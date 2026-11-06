import { AuthRepository } from "./auth.repository"
import { hashPassword, comparePassword } from "../../utils/hash.utils"
import { generateAccessToken } from "../../utils/jwt.utils"
import { AppError } from "../../utils/appError"
import { pool } from "../../config/db"

export class AuthService {
  private repo = new AuthRepository()

  async register(data: {
    name: string
    email: string
    password: string
  }) {
    // 1. Validate email not already used
    const existing = await this.repo.findUserByEmail(data.email)
    if (existing) {
      throw new AppError("Email already in use", 409)
    }

    // 2-5. Create user, organization, owner membership and business atomically:
    // a failure part-way must not leave an orphan user that blocks re-registering.
    const password_hash = await hashPassword(data.password)
    const client = await pool.connect()
    let user, organization, business
    try {
      await client.query("BEGIN")
      user = await this.repo.createUser({ email: data.email, password_hash }, client)
      organization = await this.repo.createOrganization(data.name, client)
      await this.repo.createOrganizationMember(
        { organizationId: organization.id, userId: user.id, role: "owner" },
        client
      )
      // businesses.id equals organizationId so all modules can use
      // organizationId directly as businessId without extra lookups.
      business = await this.repo.createBusiness(
        {
          id: organization.id,
          name: data.name,
          email: data.email,
          organizationId: organization.id,
        },
        client
      )
      await client.query("COMMIT")
    } catch (err) {
      await client.query("ROLLBACK").catch(() => {})
      // unique violation: concurrent registration with the same email/slug
      if ((err as { code?: string }).code === "23505") {
        throw new AppError("Email already in use", 409)
      }
      throw err
    } finally {
      client.release()
    }

    // 6. Generate JWT
    const token = generateAccessToken({
      sub: user.id,
      org: organization.id,
      role: "owner",
    })

    return {
      user: { id: user.id, email: user.email },
      organization: { id: organization.id, name: organization.name },
      business,
      token,
    }
  }

  async login(data: { email: string; password: string }) {
    // 1. Find user by email
    const user = await this.repo.findUserByEmail(data.email)
    if (!user) {
      throw new AppError("Invalid credentials", 401)
    }

    // 2. Validate password
    const valid = await comparePassword(data.password, user.password_hash)
    if (!valid) {
      throw new AppError("Invalid credentials", 401)
    }

    // 3. Get user's organizations
    const userOrganizations = await this.repo.getUserOrganizations(user.id)
    if (!userOrganizations.length) {
      throw new AppError("User has no organizations", 403)
    }

    // 4. Select default organization (first one, ordered by creation)
    const defaultOrg = userOrganizations[0]

    // 5. Get business for this organization
    const business = await this.repo.findUserBusiness(
      defaultOrg.organization_id
    )

    // 6. Generate JWT with selected organization
    const token = generateAccessToken({
      sub: user.id,
      org: defaultOrg.organization_id,
      role: defaultOrg.role,
    })

    return {
      user: { id: user.id, email: user.email },
      organization: {
        id: defaultOrg.organization_id,
        name: defaultOrg.name,
        role: defaultOrg.role,
      },
      business,
      token,
    }
  }

  async getMe(userId: string) {
    const user = await this.repo.findUserById(userId)
    if (!user) {
      throw new AppError("User not found", 404)
    }

    const organizations = await this.repo.getUserOrganizations(userId)

    let slug: string | null = null
    if (organizations.length > 0) {
      const business = await this.repo.findUserBusiness(organizations[0].organization_id)
      slug = business?.slug ?? null
    }

    return {
      user,
      organizations,
      slug,
    }
  }
}

