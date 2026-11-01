import { pool } from "../db/pool.js";
import type { User } from "../types/domain.js";

type UserRow = {
  id: string;
  full_name: string;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
};

const mapUser = (row: UserRow): User => ({
  id: row.id,
  fullName: row.full_name,
  email: row.email,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const userRepository = {
  async create(
    fullName: string,
    email: string,
    passwordHash: string,
  ): Promise<User> {
    const result = await pool.query<UserRow>(
      "INSERT INTO users(full_name,email,password_hash) VALUES($1,$2,$3) RETURNING *",
      [fullName, email, passwordHash],
    );
    return mapUser(result.rows[0]!);
  },

  async findByEmail(
    email: string,
  ): Promise<(User & { passwordHash: string }) | null> {
    const result = await pool.query<UserRow>(
      "SELECT * FROM users WHERE email=$1",
      [email],
    );

    const row = result.rows[0];
    return row ? { ...mapUser(row), passwordHash: row.password_hash } : null;
  },

  async findById(id: string): Promise<User | null> {
    const result = await pool.query<UserRow>(
      "SELECT * FROM users WHERE id=$1",
      [id],
    );
    return result.rows[0] ? mapUser(result.rows[0]) : null;
  },
};
