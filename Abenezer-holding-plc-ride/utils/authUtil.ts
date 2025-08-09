import jwt from 'jsonwebtoken';

export interface AuthToken {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

const secretKey = process.env.JWT_SECRET || 'defaultSecretKey';
export const generateAuthToken = (user: {
  id: string;
  email: string;
  role: string;
}): string => {
  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    secretKey,
    { expiresIn: '1h' }
  );
  return token;
};
