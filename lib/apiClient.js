// Thin fetch wrapper shared by every screen for talking to app/api/*. Mirrors
// the .status/.currentHolder/.conflict error shape the API routes themselves
// throw internally, so callers can do `catch (e) { if (e.status === 409) ... }`.
export async function apiFetch(path, options = {}) {
  const res = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw Object.assign(new Error(data?.error || "Request failed"), {
      status: res.status,
      data,
    });
  }

  return data;
}
