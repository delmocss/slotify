import { pool } from "../../config/db"

// pool or a transaction client: both expose query()
export type Queryable = { query: typeof pool.query }

export class AuthRepository {
  // Users table operations
  async findUserByEmail(email: string) {
    const result = await pool.query(
      "SELECT id, email, password_hash, created_at FROM users WHERE email = $1",
      [email]
    )
    return result.rows[0]
  }

  async createUser(data: { email: string; password_hash: string }, db: Queryable = pool) {
    const result = await db.query(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at",
      [data.email, data.password_hash]
    )
    return result.rows[0]
  }

  async findUserById(userId: string) {
    const result = await pool.query(
      "SELECT id, email, created_at FROM users WHERE id = $1",
      [userId]
    )
    return result.rows[0]
  }

  // Organizations table operations
  async createOrganization(name: string, db: Queryable = pool) {
    const result = await db.query(
      "INSERT INTO organizations (name) VALUES ($1) RETURNING id, name, created_at",
      [name]
    )
    return result.rows[0]
  }

  // Organization members operations
  async createOrganizationMember(data: {
    organizationId: string
    userId: string
    role: "owner" | "admin" | "member"
  }, db: Queryable = pool) {
    const result = await db.query(
      "INSERT INTO organization_members (organization_id, user_id, role) VALUES ($1, $2, $3) RETURNING id, organization_id, user_id, role, created_at",
      [data.organizationId, data.userId, data.role]
    )
    return result.rows[0]
  }

  async getUserOrganizations(userId: string) {
    const result = await pool.query(
      `SELECT om.id, om.organization_id, om.role, o.name, o.created_at
       FROM organization_members om
       JOIN organizations o ON om.organization_id = o.id
       WHERE om.user_id = $1
       ORDER BY om.created_at ASC`,
      [userId]
    )
    return result.rows
  }

  // Businesses table operations (operational entity, no auth)
  // businesses.id is set to organizationId so all service/booking queries work
  // using organizationId directly as businessId without extra lookups.
  async createBusiness(data: {
    id: string
    name: string
    email: string
    organizationId: string
  }, db: Queryable = pool) {
    const slug = await this.uniqueSlug(data.name, db)

    const result = await db.query(
      `INSERT INTO businesses (id, name, email, slug, organization_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, slug, organization_id, created_at`,
      [data.id, data.name, data.email, slug, data.organizationId]
    )
    return result.rows[0]
  }

  async findUserBusiness(organizationId: string) {
    const result = await pool.query(
      "SELECT id, name, email, slug, organization_id FROM businesses WHERE organization_id = $1",
      [organizationId]
    )
    return result.rows[0]
  }

  // Slug from the business name; falls back to "business" when the name has no
  // usable characters and appends -2, -3... until it is free.
  private async uniqueSlug(name: string, db: Queryable) {
    const base =
      name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "") || "business"

    let slug = base
    for (let n = 2; ; n++) {
      const taken = await db.query("SELECT 1 FROM businesses WHERE slug = $1", [slug])
      if (!taken.rows.length) return slug
      slug = `${base}-${n}`
    }
  }
}
