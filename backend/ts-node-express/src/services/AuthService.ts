import bcrypt from "bcryptjs";
import { db } from "../lib/prismaContext.js";
import crypt from 'crypto';
import { LoginResult, Response, ServiceResponse, SuccessResponse } from "../models/models.js";
import jwt from "jsonwebtoken";

export class AuthService {

    public async registerUser(
        name: string, 
        email: string, 
        password: string
    ) {
        
        const userHasExists = await db.user.findFirst({
            where:{
                email: email
            }
        })

        if(userHasExists){
            const errorResponse = Response.createErrorResponse(
                'This user already exists!', 
                400
            );
            throw errorResponse.body.error;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const uuid = crypt.randomUUID()

        const newUser = await db.user.create({
            data:{
                name: name,
                email: email,
                password: hashedPassword,
                uid: uuid,
                refreshToken:''

            }
        })

        if (!newUser) {
            const res = Response.createErrorResponse(
                'Unable to create new user', 
                400
            )
            throw res.body.error;
        }

        await db.chat.create({
            data: {
                userId: newUser.id,

            }
        })

        await db.accountTemplate.create({
            data:{
                ownerId: newUser.id
            }
        })

        const returnNewUser = {
            name: name,
            email: email,
            uuid: uuid
        }

        const res = Response.createSuccessResponse(
            'User registered',
            { newUser: returnNewUser }
        )
        return res
    }

    public async loginUser(
        email: string, 
        password: string
    ): Promise<ServiceResponse<LoginResult>> {

        const user = await db.user.findUnique({
            where: { email }
        });

        if (!user) {
            const errorResponse = Response.createErrorResponse(
                'Invalid credentials',
                401,
                'INVALID_CREDENTIALS'
            );
            throw errorResponse;
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            const errorResponse = Response.createErrorResponse(
                'Invalid credentials',
                401,
                'INVALID_CREDENTIALS'
            );
            throw errorResponse;
        }

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error('JWT_SECRET is not defined');
        }

        const userForToken = {
            id: user.id,
            email: user.email
        };

        const accessToken = jwt.sign(
            { userForToken }, 
            jwtSecret, 
            { expiresIn: '1h' }
        );
        
        const refreshToken = jwt.sign(
            { userForToken }, 
            jwtSecret, 
            { expiresIn: '1d' }
        );

        await db.user.update({
            where: { email },
            data: { refreshToken }
        });

        const response = Response.createSuccessResponse(
            'Login successful',
            {
                user: user,
                accessToken,
                refreshToken
            }
        );

        return response;
    }
}