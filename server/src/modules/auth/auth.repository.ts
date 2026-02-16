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
    const result = await pool.query(
      `INSERT INTO businesses (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email`,
      [data.name, data.email, data.password_hash]
    )

    return result.rows[0]
  }

  async findById(id: string) {
  const result = await pool.query(
    "SELECT id, name, email FROM businesses WHERE id = $1",
    [id]
  )
  return result.rows[0]
}

}
