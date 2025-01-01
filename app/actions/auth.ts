'use server'

import { cookies } from 'next/headers'
import { sql } from '@vercel/postgres'
import bcrypt from 'bcryptjs'

export async function login(username: string, password: string) {
  try {
    const result = await sql`
      SELECT * FROM users WHERE username = ${username}
    `
    console.log('Login query result:', result);

    if (!result || !result.rows || result.rows.length === 0) {
      console.log('No user found with the given username');
      return { success: false, error: 'Invalid username or password' };
    }

    const user = result.rows[0];
    console.log('User data:', user);

    if (!user || typeof user.password !== 'string') {
      console.log('Invalid user data or password');
      return { success: false, error: 'Invalid username or password' };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('Invalid password');
      return { success: false, error: 'Invalid username or password' };
    }

    cookies().set('userId', user.id.toString(), { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    })
    return { success: true }
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'An error occurred during login' };
  }
}

export async function logout() {
  cookies().delete('userId')
}

export async function getUser() {
  try {
    const userId = cookies().get('userId')?.value
    if (!userId) {
      console.log('No userId found in cookies');
      return null;
    }

    const result = await sql`
      SELECT id, username FROM users WHERE id = ${parseInt(userId)}
    `
    console.log('getUser query result:', result);

    if (!result || !result.rows || result.rows.length === 0) {
      console.log('No user found with the given userId');
      return null;
    }

    const user = result.rows[0];
    if (!user || typeof user.id !== 'number' || typeof user.username !== 'string') {
      console.log('Invalid user data');
      return null;
    }

    return { id: user.id, username: user.username }
  } catch (error) {
    console.error('getUser error:', error);
    return null;
  }
}

export async function register(username: string, password: string) {
  try {
    console.log('Starting registration process for username:', username);

    const existingUserResult = await sql`
      SELECT * FROM users WHERE username = ${username}
    `
    console.log('Existing user query result:', existingUserResult);

    if (existingUserResult.rows.length > 0) {
      console.log('Username already exists');
      return { success: false, error: 'Username already exists' }
    }

    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10)
    console.log('Password hashed successfully');

    console.log('Inserting new user into database...');
    const insertResult = await sql`
      INSERT INTO users (username, password)
      VALUES (${username}, ${hashedPassword})
      RETURNING id, username
    `
    console.log('Insert query result:', insertResult);

    if (!insertResult || !insertResult.rows || insertResult.rows.length === 0) {
      console.log('Failed to create user: No rows returned');
      return { success: false, error: 'Failed to create user' };
    }

    const newUser = insertResult.rows[0];
    console.log('New user data:', newUser);

    if (!newUser || typeof newUser.id !== 'number') {
      console.log('Invalid new user data');
      return { success: false, error: 'Failed to create user' };
    }

    console.log('Setting user cookie...');
    cookies().set('userId', newUser.id.toString(), { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    })
    console.log('User cookie set successfully');

    console.log('Registration process completed successfully');
    return { success: true }
  } catch (error) {
    console.error('Register error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return { success: false, error: 'An error occurred during registration' };
  }
}

