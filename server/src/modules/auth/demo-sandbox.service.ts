import crypto from "crypto"
import { pool } from "../../config/db"
import { env } from "../../config/env"
import { generateAccessToken } from "../../utils/jwt.utils"

// Every login with the public demo account gets its own private copy of the demo
// business (a "sandbox"). Whatever a visitor creates, edits or deletes only exists
// in their copy, so the next person who tries the app always starts from the same
// clean demo data. Sandboxes are throwaway: they are purged after SANDBOX_TTL_HOURS.

export const SANDBOX_EMAIL_DOMAIN = "sandbox.slotify.local"
export const SANDBOX_TTL_HOURS = 24
// Hard cap so a script hammering the demo login cannot fill the database.
const MAX_ACTIVE_SANDBOXES = 300

export function isSandboxEmail(email: string | undefined | null) {
  return !!email && email.endsWith(`@${SANDBOX_EMAIL_DOMAIN}`)
}

export function isDemoEmail(email: string) {
  return email.trim().toLowerCase() === env.demoEmail
}

function randomSuffix(length = 6) {
  return crypto.randomBytes(8).toString("hex").slice(0, length)
}

export class DemoSandboxService {
  /**
   * Creates a private copy of the demo business and returns a login result for it,
   * or null when the template business does not exist (caller falls back to a
   * normal login).
   */
  async createFor(demoUser: { password_hash: string }) {
    await this.purgeExpired().catch((err) => console.error("Sandbox purge failed", err))

    const template = await pool.query("SELECT id, name FROM businesses WHERE slug = $1", [
      env.demoSlug,
    ])
    if (!template.rows.length) return null

    const active = await pool.query("SELECT COUNT(*)::int AS n FROM users WHERE email LIKE $1", [
      `%@${SANDBOX_EMAIL_DOMAIN}`,
    ])
    if (active.rows[0].n >= MAX_ACTIVE_SANDBOXES) {
      await this.purgeOldest(Math.ceil(MAX_ACTIVE_SANDBOXES / 10))
    }

    const templateId: string = template.rows[0].id
    const name: string = template.rows[0].name
    const suffix = randomSuffix()
    const email = `sandbox-${suffix}-${randomSuffix(4)}@${SANDBOX_EMAIL_DOMAIN}`
    const slug = `${env.demoSlug}-${suffix}`

    const client = await pool.connect()
    try {
      await client.query("BEGIN")

      const user = (
        await client.query(
          "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email",
          [email, demoUser.password_hash]
        )
      ).rows[0]

      const org = (
        await client.query("INSERT INTO organizations (name) VALUES ($1) RETURNING id, name", [
          name,
        ])
      ).rows[0]

      await client.query(
        "INSERT INTO organization_members (organization_id, user_id, role) VALUES ($1, $2, 'owner')",
        [org.id, user.id]
      )

      const business = (
        await client.query(
          `INSERT INTO businesses (id, name, email, slug, organization_id)
           VALUES ($1, $2, $3, $4, $1)
           RETURNING id, name, email, slug, organization_id`,
          [org.id, name, email, slug]
        )
      ).rows[0]

      // Everything below is set-based (one statement per table, not one per row) so the
      // login stays fast even against a remote database with a big template.
      await client.query(
        `INSERT INTO services (business_id, name, slug, duration_minutes, price, is_active)
         SELECT $1, name, slug, duration_minutes, price, is_active
         FROM services WHERE business_id = $2`,
        [org.id, templateId]
      )

      await client.query(
        `INSERT INTO working_hours (business_id, day_of_week, start_time, end_time)
         SELECT $1, day_of_week, start_time, end_time FROM working_hours WHERE business_id = $2`,
        [org.id, templateId]
      )

      // Bookings are re-linked to the copied services through the (business_id, slug)
      // unique key. Keep the demo looking alive: if the template's latest booking is in the
      // past, slide every copied booking forward so that one lands on today (spacing is
      // kept); bookings already in the future are left alone (shift = 0).
      // The copy of the bookings is a nicety: if the database refuses it (for instance a
      // legacy CHECK (date >= CURRENT_DATE), see migration 004) the visitor must still get
      // a working demo, just without bookings. A savepoint lets us skip it without aborting
      // the whole transaction.
      await client.query("SAVEPOINT copy_bookings")
      try {
        await client.query(
          `WITH shift AS (
           SELECT GREATEST(0, CURRENT_DATE - MAX(date))::int AS days
           FROM bookings WHERE business_id = $2
         )
         INSERT INTO bookings
           (business_id, service_id, booking_code, cancel_token, client_name, client_email,
            date, start_time, end_time, status)
         SELECT $1, ns.id,
                'SLT-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
                substr(replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''), 1, 48),
                k.client_name, k.client_email,
                k.date + shift.days, k.start_time, k.end_time, k.status
         FROM bookings k
         CROSS JOIN shift
         JOIN services os ON os.id = k.service_id
         JOIN services ns ON ns.business_id = $1 AND ns.slug = os.slug
         WHERE k.business_id = $2
         ORDER BY k.date DESC
         LIMIT 500`,
          [org.id, templateId]
        )
        await client.query("RELEASE SAVEPOINT copy_bookings")
      } catch (err) {
        await client.query("ROLLBACK TO SAVEPOINT copy_bookings")
        console.error(
          "Demo sandbox: could not copy the template bookings, continuing without them",
          err
        )
      }

      await client.query("COMMIT")

      const token = generateAccessToken(
        { sub: user.id, org: org.id, role: "owner" },
        `${SANDBOX_TTL_HOURS}h`
      )

      return {
        user: { id: user.id, email: user.email },
        organization: { id: org.id, name: org.name, role: "owner" },
        business,
        token,
        sandbox: true,
      }
    } catch (err) {
      await client.query("ROLLBACK").catch(() => {})
      throw err
    } finally {
      client.release()
    }
  }

  async purgeExpired() {
    await this.purge(
      `SELECT id FROM users
       WHERE email LIKE $1 AND created_at < NOW() - make_interval(hours => $2)`,
      [`%@${SANDBOX_EMAIL_DOMAIN}`, SANDBOX_TTL_HOURS]
    )
  }

  private async purgeOldest(count: number) {
    await this.purge("SELECT id FROM users WHERE email LIKE $1 ORDER BY created_at ASC LIMIT $2", [
      `%@${SANDBOX_EMAIL_DOMAIN}`,
      count,
    ])
  }

  // Deleting the organization cascades to its business, services, working hours,
  // bookings and memberships; the sandbox users are removed explicitly.
  private async purge(selectUsersSql: string, params: unknown[]) {
    await pool.query(
      `WITH doomed AS (${selectUsersSql}),
            gone_orgs AS (
              DELETE FROM organizations
              WHERE id IN (SELECT organization_id FROM organization_members
                           WHERE user_id IN (SELECT id FROM doomed))
            )
       DELETE FROM users WHERE id IN (SELECT id FROM doomed)`,
      params
    )
  }
}
