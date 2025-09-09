// src/lib/adminAuth.ts
export function requireAdmin(req: Request) {
  const key = process.env.ADMIN_KEY;
  const provided = req.headers.get("x-admin-key") || "";
  if (!key || provided !== key) return false;
  return true;
}
