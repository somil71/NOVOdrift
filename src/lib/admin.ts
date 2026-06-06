/**
 * Admin allowlist.
 * Set ADMIN_EMAILS in the environment (comma-separated) to restrict the admin
 * panel + content-write APIs to specific accounts.
 *
 * Safety: if ADMIN_EMAILS is unset/empty, ANY authenticated user is treated as
 * admin (preserves current behavior — no accidental lockout). Set it in
 * production to lock things down.
 */
export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
}

export function isAdminEmail(email: string | null | undefined): boolean {
  const list = adminEmails()
  if (list.length === 0) return true // no allowlist configured → allow any authed user
  return !!email && list.includes(email.toLowerCase())
}
