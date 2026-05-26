import config from "./config.js";

export function getCorsOrigins(): string[] | true {
  const raw = config.CORS_ORIGINS?.trim();
  if (!raw || raw === "*") {
    return config.NODE_ENV === "production" ? [] : true;
  }
  return raw.split(",").map((o) => o.trim()).filter(Boolean);
}

export function getHelmetOptions() {
  const isProd = config.NODE_ENV === "production";
  return {
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: isProd
      ? {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
          },
        }
      : false,
    hsts: isProd
      ? { maxAge: 31536000, includeSubDomains: true, preload: true }
      : false,
  };
}

export function shouldTrustProxy(): boolean {
  return config.TRUST_PROXY === "true";
}
