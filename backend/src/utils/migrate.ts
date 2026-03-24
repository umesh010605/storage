import fs from 'fs';
import path from 'path';
import pool from '../config/database';

const MIGRATIONS_DIR = path.join(__dirname, '../migrations');

interface Migration {
  filename: string;
  sql: string;
}

export const runMigrations = async (): Promise<void> => {
  try {
    // Create migrations table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Get list of executed migrations
    const { rows: executedMigrations } = await pool.query(
      'SELECT filename FROM migrations ORDER BY filename'
    );
    const executedFilenames = executedMigrations.map(row => row.filename);

    // Read migration files
    const migrationFiles = fs.readdirSync(MIGRATIONS_DIR)
      .filter(file => file.endsWith('.sql'))
      .sort();

    const migrations: Migration[] = migrationFiles.map(filename => ({
      filename,
      sql: fs.readFileSync(path.join(MIGRATIONS_DIR, filename), 'utf8')
    }));

    // Execute pending migrations
    for (const migration of migrations) {
      if (!executedFilenames.includes(migration.filename)) {
        console.log(`🔄 Running migration: ${migration.filename}`);
        
        const client = await pool.connect();
        try {
          await client.query('BEGIN');
          await client.query(migration.sql);
          await client.query(
            'INSERT INTO migrations (filename) VALUES ($1)',
            [migration.filename]
          );
          await client.query('COMMIT');
          console.log(`✅ Migration completed: ${migration.filename}`);
        } catch (error) {
          await client.query('ROLLBACK');
          throw error;
        } finally {
          client.release();
        }
      }
    }

    console.log('🎉 All migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};