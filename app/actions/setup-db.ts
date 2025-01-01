'use server'

import { sql } from '@vercel/postgres'

export async function setupDatabase() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `
    console.log('Database setup completed successfully')
    return { success: true }
  } catch (error) {
    console.error('Error setting up database:', error)
    return { success: false, error: 'Failed to set up database' }
  }
}

