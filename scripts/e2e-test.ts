/**
 * End-to-end API test script (Phase 19)
 *
 * Prerequisites:
 *   1. MongoDB + Redis running
 *   2. npm run seed:phase2 && npm run seed:admin
 *   3. npm run dev  (server on PORT, default 5000)
 *
 * Run: npm run test:e2e
 * Env: E2E_BASE_URL=http://localhost:5000/api/v1
 */

import "dotenv/config";

const BASE = (process.env.E2E_BASE_URL || "http://localhost:5000/api/v1").replace(
  /\/$/,
  "",
);

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@foodapp.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@123";

type Json = Record<string, unknown>;

interface StepResult {
  name: string;
  ok: boolean;
  status?: number;
  detail?: string;
}

const results: StepResult[] = [];
let customerToken = "";
let adminToken = "";
let restaurantId = "";
let menuItemId = "";
let addressId = "";
let orderId = "";

function log(msg: string) {
  console.log(msg);
}

async function api<T = Json>(
  method: string,
  path: string,
  options?: {
    body?: Json;
    token?: string;
    admin?: boolean;
    expectStatus?: number;
  },
): Promise<{ status: number; body: T }> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = options?.admin ? adminToken : options?.token ?? customerToken;
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

  let body: T;
  const text = await res.text();
  try {
    body = text ? (JSON.parse(text) as T) : ({} as T);
  } catch {
    body = { raw: text } as T;
  }

  return { status: res.status, body };
}

async function step(
  name: string,
  fn: () => Promise<void>,
): Promise<void> {
  try {
    await fn();
    results.push({ name, ok: true });
    log(`  ✓ ${name}`);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    results.push({ name, ok: false, detail });
    log(`  ✗ ${name} — ${detail}`);
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

async function main() {
  const runId = Date.now();
  const customerEmail = `e2e_customer_${runId}@test.com`;
  const customerPassword = "Test@123456";

  log("\n🧪 Food App E2E Test Suite");
  log(`   Base URL: ${BASE}\n`);

  // ─── Public / system ───────────────────────────────────────────
  await step("Health check", async () => {
    const { status, body } = await api("GET", "/health");
    assert(status === 200, `Expected 200, got ${status}`);
    assert((body as Json).status === "OK", "Health status not OK");
  });

  await step("System status", async () => {
    const { status, body } = await api<{ success: boolean; data: Json }>(
      "GET",
      "/system/status",
    );
    assert(status === 200, `Expected 200, got ${status}`);
    assert(body.success === true, "System status failed");
    assert(Number(body.data?.phase) >= 17, "Unexpected phase");
  });

  await step("Global search", async () => {
    const { status, body } = await api<{ success: boolean; data: { search: Json } }>(
      "GET",
      `/search?q=biryani`,
    );
    assert(status === 200, `Expected 200, got ${status}`);
    assert(body.success === true, "Search failed");
    const restaurants = body.data?.search?.restaurants as unknown[];
    assert(Array.isArray(restaurants), "No restaurants array");
    if (restaurants.length > 0) {
      const first = restaurants[0] as { _id?: string };
      restaurantId = String(first._id);
    }
  });

  await step("Search trending", async () => {
    const { status, body } = await api<{ success: boolean; data: { trending: unknown[] } }>(
      "GET",
      "/search/trending",
    );
    assert(status === 200, `Expected 200, got ${status}`);
    assert(Array.isArray(body.data?.trending), "Trending missing");
  });

  await step("List restaurants", async () => {
    const { status, body } = await api<{ success: boolean; data: { restaurants: Json[] } }>(
      "GET",
      "/restaurants?page=1&limit=5",
    );
    assert(status === 200, `Expected 200, got ${status}`);
    const list = body.data?.restaurants ?? [];
    if (!restaurantId && list[0]) {
      restaurantId = String((list[0] as { _id: string })._id);
    }
    assert(restaurantId.length > 0, "No restaurant found — run npm run seed:phase2");
  });

  // ─── Customer auth ─────────────────────────────────────────────
  await step("Register customer", async () => {
    const { status, body } = await api<{
      success: boolean;
      data: { accessToken: string };
    }>("POST", "/auth/register", {
      body: {
        fullName: "E2E Customer",
        email: customerEmail,
        mobile: String(runId).slice(-10).padStart(10, "9"),
        password: customerPassword,
      },
    });
    assert(status === 201 || status === 200, `Register failed: ${status}`);
    customerToken = body.data?.accessToken ?? "";
    assert(!!customerToken, "No access token after register");
  });

  await step("Login customer", async () => {
    const { status, body } = await api<{
      success: boolean;
      data: { accessToken: string };
    }>("POST", "/auth/login", {
      body: { email: customerEmail, password: customerPassword },
    });
    assert(status === 200, `Login failed: ${status}`);
    customerToken = body.data?.accessToken ?? customerToken;
    assert(!!customerToken, "No token after login");
  });

  await step("GET /auth/me", async () => {
    const { status, body } = await api<{ success: boolean; data: { user: Json } }>(
      "GET",
      "/auth/me",
    );
    assert(status === 200, `Me failed: ${status}`);
    assert(body.data?.user !== undefined, "User missing");
  });

  await step("Add delivery address", async () => {
    const { status, body } = await api<{
      success: boolean;
      data: { address: { _id: string } };
    }>("POST", "/users/address", {
      body: {
        label: "Home",
        fullAddress: "123 Test Street, Mumbai",
        city: "Mumbai",
        pincode: "400001",
        latitude: 19.076,
        longitude: 72.8777,
        isDefault: true,
      },
    });
    assert(status === 200 || status === 201, `Add address failed: ${status}`);
    addressId = String(body.data?.address?._id ?? "");
    assert(!!addressId, "No address id");
  });

  await step("Get menu items", async () => {
    const { status, body } = await api<{
      success: boolean;
      data: { items: { _id: string }[] };
    }>("GET", `/menu/items/${restaurantId}`);
    assert(status === 200, `Menu failed: ${status}`);
    const items = body.data?.items ?? [];
    assert(items.length > 0, "No menu items — run seed:phase2");
    menuItemId = String(items[0]._id);
  });

  await step("Add item to cart", async () => {
    const { status, body } = await api<{ success: boolean }>("POST", "/cart/add", {
      body: {
        restaurantId,
        menuItemId,
        quantity: 1,
      },
    });
    assert(status === 200 || status === 201, `Add cart failed: ${status} ${JSON.stringify(body)}`);
  });

  await step("Get cart", async () => {
    const { status, body } = await api<{ success: boolean; data: { cart: Json } }>(
      "GET",
      "/cart",
    );
    assert(status === 200, `Get cart failed: ${status}`);
    const cart = body.data?.cart as { items?: unknown[] };
    assert((cart?.items?.length ?? 0) > 0, "Cart is empty");
  });

  await step("Create order (COD)", async () => {
    const { status, body } = await api<{
      success: boolean;
      data: { order: { _id: string; orderNumber?: string } };
    }>("POST", "/orders/create", {
      body: {
        deliveryAddressId: addressId,
        paymentMethod: "COD",
      },
    });
    assert(status === 200 || status === 201, `Create order failed: ${status} ${JSON.stringify(body)}`);
    orderId = String(body.data?.order?._id ?? "");
    assert(!!orderId, "No order id");
  });

  await step("Track order", async () => {
    const { status, body } = await api<{ success: boolean; data: { tracking: Json } }>(
      "GET",
      `/orders/track/${orderId}`,
    );
    assert(status === 200, `Track failed: ${status}`);
    assert(body.data?.tracking !== undefined, "No tracking payload");
  });

  await step("Order history", async () => {
    const { status, body } = await api<{ success: boolean; data: { orders: unknown[] } }>(
      "GET",
      "/orders/user/history",
    );
    assert(status === 200, `History failed: ${status}`);
    assert((body.data?.orders?.length ?? 0) > 0, "No orders in history");
  });

  await step("Notifications list", async () => {
    const { status } = await api("GET", "/notifications");
    assert(status === 200, `Notifications failed: ${status}`);
  });

  // ─── Admin ─────────────────────────────────────────────────────
  await step("Admin login", async () => {
    const { status, body } = await api<{
      success: boolean;
      data: { accessToken: string };
    }>("POST", "/admin/login", {
      body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
    });
    assert(status === 200, `Admin login failed: ${status} — run npm run seed:admin`);
    adminToken = body.data?.accessToken ?? "";
    assert(!!adminToken, "No admin token");
  });

  await step("Admin dashboard", async () => {
    const { status, body } = await api<{ success: boolean; data: { stats: Json } }>(
      "GET",
      "/admin/dashboard",
      { admin: true },
    );
    assert(status === 200, `Dashboard failed: ${status}`);
    assert(body.data?.stats !== undefined, "No stats");
  });

  await step("Admin list orders", async () => {
    const { status } = await api("GET", "/admin/orders?page=1&limit=5", { admin: true });
    assert(status === 200, `Admin orders failed: ${status}`);
  });

  await step("Analytics summary (admin)", async () => {
    const { status } = await api("GET", "/analytics/summary?days=30", { admin: true });
    assert(status === 200, `Analytics failed: ${status}`);
  });

  // ─── Summary ───────────────────────────────────────────────────
  const passed = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok);

  log("\n─────────────────────────────────────");
  log(`Results: ${passed}/${results.length} passed`);

  if (failed.length > 0) {
    log("\nFailed steps:");
    for (const f of failed) {
      log(`  • ${f.name}: ${f.detail}`);
    }
    process.exit(1);
  }

  log("\n✅ All E2E steps passed.\n");
}

main().catch((err) => {
  console.error("\nE2E runner crashed:", err);
  process.exit(1);
});
