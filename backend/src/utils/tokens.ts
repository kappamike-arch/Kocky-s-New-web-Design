import jwt, { SignOptions } from 'jsonwebtoken';
import { User } from '@prisma/client';

export const generateToken = (user: Pick<User, 'id' | 'email' | 'role'>) => {
  const options: any = {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  };
  
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET!,
    options
  );
};

export const generateRefreshToken = (user: Pick<User, 'id' | 'email' | 'role'>) => {
  const options: SignOptions = {
    expiresIn: '30d',
  };
  
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      type: 'refresh',
    },
    process.env.JWT_SECRET!,
    options
  );
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRET!);
};

export const generateEmailVerificationToken = (userId: string) => {
  const options: SignOptions = { expiresIn: '24h' };
  return jwt.sign(
    { id: userId, type: 'email_verification' },
    process.env.JWT_SECRET!,
    options
  );
};

export const generatePasswordResetToken = (userId: string) => {
  const options: SignOptions = { expiresIn: '1h' };
  return jwt.sign(
    { id: userId, type: 'password_reset' },
    process.env.JWT_SECRET!,
    options
  );
};
