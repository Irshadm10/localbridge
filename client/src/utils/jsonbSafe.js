/** Strip undefined (JSON omits keys) and ensure JSON-serializable payload for PostgREST. */
export function toJsonbSafe(value) {
  return JSON.parse(JSON.stringify(value, (_, v) => (v === undefined ? null : v)));
}
