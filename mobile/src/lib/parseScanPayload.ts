export type ScanPayload =
  | { kind: 'collection'; code: string }
  | { kind: 'container'; serialNumber: string }
  | { kind: 'unknown'; raw: string };

const MONGO_ID = /^[a-fA-F0-9]{24}$/;

function lastPathSegment(value: string): string {
  const cleaned = value.replace(/\/+$/, '');
  const parts = cleaned.split('/').filter(Boolean);
  return decodeURIComponent(parts[parts.length - 1] || '');
}

function hostPath(value: string): { host: string; path: string } | null {
  try {
    const url = new URL(value);
    return { host: url.hostname.toLowerCase(), path: url.pathname };
  } catch {
    return null;
  }
}

/**
 * Collection-base QRs open a drop-off. Everything else is a container serial.
 * Supported collection forms:
 *   reloop://collection/{id|slug}
 *   reloop://vendor/{id|slug}
 *   https://…/collection/{id|slug}
 *   COLLECTION:{id|slug}
 *   24-char Mongo id
 */
export function parseScanPayload(raw: string): ScanPayload {
  const value = (raw ?? '').toString().trim();
  if (!value) return { kind: 'unknown', raw: value };

  const upper = value.toUpperCase();
  if (upper.startsWith('COLLECTION:') || upper.startsWith('VENDOR:')) {
    const code = value.slice(value.indexOf(':') + 1).trim();
    return code ? { kind: 'collection', code } : { kind: 'unknown', raw: value };
  }
  if (upper.startsWith('CONTAINER:') || upper.startsWith('SERIAL:')) {
    const serial = value.slice(value.indexOf(':') + 1).trim();
    return serial ? { kind: 'container', serialNumber: serial } : { kind: 'unknown', raw: value };
  }

  const asUrl = value.match(/^[a-zA-Z][a-zA-Z0-9+.-]*:/) ? hostPath(value) : null;
  if (asUrl) {
    const path = asUrl.path.replace(/\/+$/, '');
    const collectionHit = path.match(/\/(?:collection|vendor|v)\/([^/]+)$/i);
    if (collectionHit?.[1]) {
      return { kind: 'collection', code: decodeURIComponent(collectionHit[1]) };
    }
    const containerHit = path.match(/\/(?:c|container|serial)\/([^/]+)$/i);
    if (containerHit?.[1]) {
      return { kind: 'container', serialNumber: decodeURIComponent(containerHit[1]) };
    }
    if (asUrl.host === 'collection' || asUrl.host === 'vendor') {
      const code = lastPathSegment(path) || asUrl.host;
      return { kind: 'collection', code };
    }
    if (asUrl.host === 'c' || asUrl.host === 'container') {
      return { kind: 'container', serialNumber: lastPathSegment(path) };
    }
  }

  if (MONGO_ID.test(value)) {
    return { kind: 'collection', code: value };
  }

  return { kind: 'container', serialNumber: value };
}
