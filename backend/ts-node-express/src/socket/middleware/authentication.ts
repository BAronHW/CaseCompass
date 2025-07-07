import { Socket } from "socket.io";
import { decodeJWT } from "../../functions/decodeJWT.js";
import { db } from "../../lib/prismaContext.js";

export const verifyToken = async (socket: Socket, next: any) => {
    try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization;

        if (!token) {
            return next(new Error('Authentication error no token found'));
        }
        
        const decodedAuthToken = decodeJWT(token);

        if (!decodedAuthToken) {
            return next(new Error('Authentication error unable to decode JWT token'))
        }

        const foundUser = await db.user.findUnique({
            where: {
                id: decodedAuthToken.userForToken.id
            }
        })

        if (!foundUser) {
            return next(new Error('Unable to find user'));
        }

        socket.data = {
            userId: foundUser.id,
            user: {
                id: foundUser.id,
                email: foundUser.email,
            }
        };

        next();
    } catch (error) {
        console.log('Error authenticating JWT in socket.io service', error);
        next(new Error('Auth error unable to authenticate JWT'))
    }
    next();
}