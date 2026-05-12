export function isJwtExpired(token: string, skewSeconds = 30): boolean {
  if (!token) return true;

  const parts = token.split(".");
  if (parts.length < 2) return false;

  try {
    const payloadBase64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = payloadBase64.padEnd(
      payloadBase64.length + ((4 - (payloadBase64.length % 4)) % 4),
      "=",
    );

    const json = atob(padded);
    const payload = JSON.parse(json) as { exp?: number };

    if (!payload.exp) return false;

    const nowSeconds = Math.floor(Date.now() / 1000);
    return payload.exp <= nowSeconds + skewSeconds;
  } catch {
    return false;
  }
}
