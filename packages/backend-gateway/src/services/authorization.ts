import jwt from "jsonwebtoken";

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

export async function login(username: string, password: string) {

}