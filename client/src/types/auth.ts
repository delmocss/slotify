/** Shape of GET /auth/me. */
export interface MeResponse {
  user: { id: string; email: string; created_at: string }
  organizations: { organization_id: string; name: string; role: string }[]
  slug: string | null
  /** True when this session runs on a private, throwaway copy of the demo data. */
  sandbox: boolean
  /** Public demo account e-mail (shown instead of the internal sandbox address). */
  demoEmail: string | null
}
