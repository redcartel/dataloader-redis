import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Pool } from "pg";

export function verifyToken(token : string) {
    try {
      const decoded = jwt.verify(token, process.env['JWT_SECRET'] as string);
      return decoded;
    } catch (error) {
      return null;
    }
  };

export function encodeToken(account: { username: string, email: string}) {
  const token = jwt.sign(account, process.env['JWT_SECRET'] as string);
  return token;
}

export async function login(pool: Pool, username: string, password: string) {
  const query = 'SELECT password, email FROM accounts WHERE username = $1 LIMIT 1';
  const result = await pool.query(query, [username]);
  console.log(await bcrypt.hash(password, 10));
  if (result.rows.length === 1) {
    console.log(result.rows);
    const success = await bcrypt.compare(password, result.rows[0].password ?? '');
    if (success) {
      return {
        username,
        email: result.rows[0].email
      }
    }
    else {
      return {

      }
    }
  }
}