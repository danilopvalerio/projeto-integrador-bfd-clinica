import jwt from "jsonwebtoken";
import { TokenPayload } from "../../modules/session/sessionDTO";

const ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET || "clinica_access_secret_safe";
const REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "clinica_refresh_secret_safe";

const ACCESS_EXPIRES = "15m";
const REFRESH_EXPIRES = "7d";

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRES,
  });
}

export function generateRefreshToken(userId: string): string {
  // Refresh token guarda apenas o ID (Subject)
  return jwt.sign({ sub: userId }, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES,
  });
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, ACCESS_SECRET) as TokenPayload;
}

export function verifyRefreshToken(token: string): string | jwt.JwtPayload {
  return jwt.verify(token, REFRESH_SECRET);
}
