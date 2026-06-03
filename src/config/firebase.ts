import admin from "firebase-admin";
import config from "./config.js";
import logger from "./logger.js";

let initialized = false;

export function isFirebaseEnabled(): boolean {
  return config.FIREBASE_ENABLED === "true";
}

function parseServiceAccountFromEnv():
  | admin.ServiceAccount
  | { projectId: string; clientEmail: string; privateKey: string }
  | null {
  if (config.FIREBASE_SERVICE_ACCOUNT_JSON_BASE64) {
    const raw = Buffer.from(
      config.FIREBASE_SERVICE_ACCOUNT_JSON_BASE64,
      "base64",
    ).toString("utf8");
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return parsed as admin.ServiceAccount;
  }

  if (
    config.FIREBASE_PROJECT_ID &&
    config.FIREBASE_CLIENT_EMAIL &&
    config.FIREBASE_PRIVATE_KEY
  ) {
    return {
      projectId: config.FIREBASE_PROJECT_ID,
      clientEmail: config.FIREBASE_CLIENT_EMAIL,
      privateKey: config.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    };
  }

  return null;
}

export function getFirebaseApp(): admin.app.App | null {
  if (!isFirebaseEnabled()) return null;

  if (!initialized) {
    const creds = parseServiceAccountFromEnv();
    if (!creds) {
      logger.warn(
        "Firebase is enabled but no credentials were provided. Set FIREBASE_SERVICE_ACCOUNT_JSON_BASE64 or FIREBASE_PROJECT_ID/FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY.",
      );
      return null;
    }

    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert(creds as admin.ServiceAccount),
      });
    }
    initialized = true;
  }

  return admin.app();
}

export function getFirebaseMessaging(): admin.messaging.Messaging | null {
  const app = getFirebaseApp();
  if (!app) return null;
  return admin.messaging(app);
}

