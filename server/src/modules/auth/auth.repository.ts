import { pool } from "../../config/db"

export class AuthRepository {
    async findByEmail(email: string) {
        const result = await pool.query(
            "SELECT * FROM businesses WHERE email = $1",
            [email]
        )
        return result.rows[0]
    }

    async create(data: {
        name: string
        email: string
        password_hash: string
    }) {
        const slug = data.name
            .toLowerCase()
            .replace(/\s+/g, "-")

        const result = await pool.query(
            `INSERT INTO businesses (name, email, password_hash, slug)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, slug`,
            [data.name, data.email, data.password_hash, slug]
        )

        return result.rows[0]
    }


    async findById(id: string) {
        const result = await pool.query(
            "SELECT id, name, email, slug FROM businesses WHERE id = $1",
            [id]
        )
        return result.rows[0]
    }

}
