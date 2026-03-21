export type ParsedTicketInput =
  | { kind: "payload"; eventId: string; code: string; raw: string }
  | { kind: "code"; code: string; raw: string }
  | { kind: "unknown"; raw: string };

export function createTicketCode(eventId: string) {
  let hash = 0;
  for (let index = 0; index < eventId.length; index += 1) {
    hash = (hash * 31 + eventId.charCodeAt(index)) >>> 0;
  }

  const suffix = hash.toString(36).toUpperCase().padStart(6, "0").slice(0, 6);
  return `EVT-${suffix}`;
}

export function createTicketPayload(eventId: string, code: string) {
  return `eventflow://ticket?event=${encodeURIComponent(eventId)}&code=${encodeURIComponent(code)}`;
}

export function isValidTicketCode(code: string) {
  return /^EVT-[A-Z0-9]{6}$/.test(code);
}

export function parseTicketInput(input: string): ParsedTicketInput {
  const raw = input;
  const trimmed = input.trim();

  if (!trimmed) return { kind: "unknown", raw };

  if (/^eventflow:\/\/ticket\?/i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      const eventId = url.searchParams.get("event");
      const code = url.searchParams.get("code");
      if (eventId && code) {
        return {
          kind: "payload",
          eventId,
          code: code.toUpperCase(),
          raw,
        };
      }
    } catch {
      // fall through
    }
  }

  const normalized = trimmed.toUpperCase();
  if (normalized.startsWith("EVT-")) {
    return { kind: "code", code: normalized, raw };
  }

  return { kind: "unknown", raw };
}
