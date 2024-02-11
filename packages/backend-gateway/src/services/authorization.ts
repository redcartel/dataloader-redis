import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Pool } from "pg";
import { Response } from "express";

export function verifyToken(token : string) {
    try {
      const decoded = jwt.verify(token, process.env['JWT_SECRET'] as string);
      return decoded;
    } catch (error) {
      return null;
    }
  };

export function encodeToken(account: { username?: string, email?: string}) {
  if (account.username && account.email) {
    const token = jwt.sign(account, process.env['JWT_SECRET'] as string);
    return token;
  }
  else {
    return ''
  }
}

export type LoginResponse = {
  usename?: string,
  email?: string,
  token?: string
}

export async function login(pool: Pool, username: string, password: string) {
  const query = 'SELECT password, email FROM accounts WHERE username = $1 LIMIT 1';
  const result = await pool.query(query, [username]);
  if (result.rows.length === 1) {
    const success = await bcrypt.compare(password, result.rows[0].password ?? '');
    if (success) {
      return {
        username,
        email: result.rows[0].email,
        token: encodeToken({username, email: result.rows[0].email})
      }
    }
  }
  return {}
}

export async function setAccountCookie(response: Response, loginResponse: LoginResponse) {
  if (loginResponse.token) {
    response.cookie('token', loginResponse.token, {
      httpOnly: true,
      sameSite: 'lax',
      domain: process.env['COOKIE_DOMAIN'] ?? 'localhost',
      maxAge: 1_000_000_000
    })
  }
  else {
    response.clearCookie('token');
  }
}