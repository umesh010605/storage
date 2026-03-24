import pool from '../config/database';
import { User, CreateUserData, UserResponse } from '../models/User';

export class UserRepository {
  async create(userData: CreateUserData): Promise<UserResponse> {
    const query = `
      INSERT INTO users (email, password_hash)
      VALUES ($1, $2)
      RETURNING id, email, created_at, updated_at
    `;
    
    const { rows } = await pool.query(query, [
      userData.email,
      userData.password_hash
    ]);
    
    return rows[0];
  }

  async findByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE email = $1';
    const { rows } = await pool.query(query, [email]);
    return rows[0] || null;
  }

  async findById(id: string): Promise<UserResponse | null> {
    const query = `
      SELECT id, email, created_at, updated_at 
      FROM users 
      WHERE id = $1
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  }

  async emailExists(email: string): Promise<boolean> {
    const query = 'SELECT 1 FROM users WHERE email = $1';
    const { rows } = await pool.query(query, [email]);
    return rows.length > 0;
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    const query = 'UPDATE users SET password_hash = $1 WHERE id = $2';
    await pool.query(query, [passwordHash, id]);
  }

  async delete(id: string): Promise<void> {
    const query = 'DELETE FROM users WHERE id = $1';
    await pool.query(query, [id]);
  }
}