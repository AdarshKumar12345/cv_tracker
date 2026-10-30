import jwt from 'jsonwebtoken';
import { IUserPayload } from '../types';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'fallback_access_secret_key_12345';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret_key_12345';

export const generateTokens = (payload: IUserPayload) => {
  const accessToken = jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || '15m') as any,
  });

  const refreshToken = jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as any,
  });

  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string): IUserPayload => {
  return jwt.verify(token, ACCESS_SECRET) as IUserPayload;
};

export const verifyRefreshToken = (token: string): IUserPayload => {
  return jwt.verify(token, REFRESH_SECRET) as IUserPayload;
};
