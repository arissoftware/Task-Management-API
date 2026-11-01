import { pool } from "../db/pool.js";

export const authRepository = {
  async saveRefreshToken(
    userId: string,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<void> {
    await pool.query(
      "INSERT INTO refresh_tokens(user_id,token_hash,expires_at) VALUES($1,$2,$3)",
      [userId, tokenHash, expiresAt],
    );
  },
  // Consume the old token and persist its replacement in one transaction.
  // A concurrent request cannot successfully rotate the same token twice.
  async rotateRefreshToken(
    oldHash: string,
    newHash: string,
    expiresAt: Date,
  ): Promise<string | null> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const consumed = await client.query<{ user_id: string }>(
        "DELETE FROM refresh_tokens WHERE token_hash=$1 AND expires_at > NOW() RETURNING user_id",
        [oldHash],
      );
      const userId = consumed.rows[0]?.user_id;
      if (!userId) {
        await client.query("ROLLBACK");
        return null;
      }
      await client.query(
        "INSERT INTO refresh_tokens(user_id,token_hash,expires_at) VALUES($1,$2,$3)",
        [userId, newHash, expiresAt],
      );
      await client.query("COMMIT");
      return userId;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },
  async deleteRefreshToken(tokenHash: string): Promise<void> {
    await pool.query("DELETE FROM refresh_tokens WHERE token_hash=$1", [
      tokenHash,
    ]);
  },
};
