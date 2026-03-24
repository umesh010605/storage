import { runMigrations } from '../utils/migrate';
import { testConnection } from '../config/database';

async function main() {
  console.log('🚀 Starting database migration...');
  
  try {
    // Test database connection first
    const connected = await testConnection();
    if (!connected) {
      console.error('❌ Cannot connect to database. Please check your configuration.');
      process.exit(1);
    }

    // Run migrations
    await runMigrations();
    console.log('✅ Database migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

main();