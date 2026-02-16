import { AuthRepository } from "./auth.repository"
import { hashPassword, comparePassword } from "../../utils/hash.utils"
import { generateToken } from "../../utils/jwt.utils"

export class AuthService {
    private repo = new AuthRepository()

    async register(data: {
        name: string
        email: string
        password: string
    }) {
        const existing = await this.repo.findByEmail(data.email)

        if (existing) {
            throw new Error("Email already in use")
        }

        const password_hash = await hashPassword(data.password)

        const business = await this.repo.create({
            name: data.name,
            email: data.email,
            password_hash,
        })

        const token = generateToken({ businessId: business.id })

        return { business, token }
    }

    async login(data: {
        email: string
        password: string
    }) {
        const business = await this.repo.findByEmail(data.email)

        if (!business) {
            throw new Error("Invalid credentials")
        }

        const valid = await comparePassword(
            data.password,
            business.password_hash
        )

        if (!valid) {
            throw new Error("Invalid credentials")
        }

        const token = generateToken({ businessId: business.id })

        return { business, token }
    }

    async getMe(businessId: string) {
        const business = await this.repo.findById(businessId)

        if (!business) {
            throw new Error("Business not found")
        }

        return business
    }

}
