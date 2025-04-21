import { db } from "../lib/prismaContext"
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config()

const jwtSecret = process.env.JWT_SECRET;


export const reAuthAccessToken = async (refreshToken: string) => {
  try {
    const decoded = jwt.verify(refreshToken, jwtSecret);
    
    const user = await db.user.findFirst({
      where: {
        refreshToken: refreshToken
      }
    });
    
    if (!user) {
      throw new Error('Invalid refresh token');
    }
    
    const newAccessToken = jwt.sign(
      { userId: user.id, email: user.email },
      jwtSecret,
      { expiresIn: '1h' }
    );
    
    return { accessToken: newAccessToken };
  } catch (error) {
    throw new Error('Token refresh failed');
  }
}

export default reAuthAccessToken;