import { AuthRepository } from "./auth.repository"
import { hashPassword, comparePassword } from "../../utils/hash.utils"
import { generateAccessToken } from "../../utils/jwt.utils"
import { AppError } from "../../utils/appError"

export class AuthService {
    private repo = new AuthRepository()

    async register(data: {
        name: string
        email: string
        password: string
    }) {
        const existing = await this.repo.findByEmail(data.email)

        if (existing) {
            throw new AppError("Email already in use", 409)
        }

        const password_hash = await hashPassword(data.password)

        const business = await this.repo.create({
            name: data.name,
            email: data.email,
            password_hash,
        })

        const token = generateAccessToken({
            sub: business.id,
            org: business.id,
            role: "owner",
        })

        return { business, token }
    }

    async login(data: {
        email: string
        password: string
    }) {
        const business = await this.repo.findByEmail(data.email)

        if (!business) {
            throw new AppError("Invalid credentials", 401)
        }

        const valid = await comparePassword(
            data.password,
            business.password_hash
        )

        if (!valid) {
            throw new AppError("Invalid credentials", 401)
        }

        const token = generateAccessToken({
            sub: business.id,
            org: business.id,
            role: "owner",
        })

        // Nunca devolver el hash de la contraseña al cliente.
        const { password_hash: _omit, ...safeBusiness } = business

        return { business: safeBusiness, token }
    }

    async getMe(organizationId: string) {
        const business = await this.repo.findById(organizationId)

        if (!business) {
            throw new AppError("Business not found", 404)
        }

        return business
    }

}

