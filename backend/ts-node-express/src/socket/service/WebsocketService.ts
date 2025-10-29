import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { io } from "../../app.js";
import { decodeJWT } from "../../functions/decodeJWT.js";
import { db } from "../../lib/prismaContext.js";
import { chunkRetrieval } from "../../functions/chunkRetrieval.js";
import { HydeService } from "../../services/HydeService.js";
import { HydeConfig } from "../../models/models.js";

export function websocketService() {
    io.on('connection', (socket) => {

    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI });

    socket.on('connect-to-chat-room', async ({ token }) => {
        try {
        let chatRoom;
        const decodedJWT = await decodeJWT(token!);

        const userId = decodedJWT.userForToken.id;

        chatRoom = await db.chat.findUnique({
            where: {
            userId: userId
            }
        })

        if (chatRoom) {
            const roomId = `chat:${chatRoom.id}`;
            socket.join(roomId);
            socket.emit('chat-joined', {
            chatRoomId: chatRoom
            })
            socket.data.currentRoomId = roomId;
            socket.data.currentUserId = userId;

            socket.emit('chat-created', {
            message: 'Chat room created successfully',
            chatRoom: roomId
            });
        } else {
            socket.emit('chat-created', {
            error: 'unable to join chatroom'
            });
        }

        } catch (error) {
        console.log('error with connect-tochat-room', error)
        }
    })

    socket.on('send-message', async ({ messageBody, enableRag }) => {
        try {
        const roomId = socket.data.currentRoomId;
        
        if (!roomId) {
            socket.emit('error', {
            error: 'You must join a chat room first'
            });
            return;
        }

        const chatRoomId = Number(roomId.slice(5))
        const chatRoom = await db.chat.findUnique({
            where: {
            id: chatRoomId
            }
        })

        if (!chatRoom) {
            console.log('error finding existing chatroom in sending message');
        }

        const newMessage = await db.message.create({
            data: {
            chatId: chatRoom!.id,
            body: messageBody,
            role: 'user',
            isHuman: true
            }
        })

        if (!newMessage) {
            console.log('error creating new message in the database');
        }

        io.to(roomId).emit('new-human-message', {
            message: 'New message sent successfully',
            newMessage: newMessage
        })

        if (!enableRag){
            const generateLlmmResponse = async (body: string): Promise<GenerateContentResponse> => {
                const response = await genAI.models.generateContent({
                    model: 'gemini-2.0-flash-001',
                    contents: body,
                });
                return response;
            }

            const llmResp = await generateLlmmResponse(messageBody);

            const newLlmResponse = await db.message.create({
            data: {
                chatId: chatRoomId,
                role: 'llm',
                body: llmResp.text,
                isHuman: false
            }
            })

            io.to(roomId).emit('new-llm-response', {
            message: 'New Llm Message sent successfully',
            newLlmMessage: newLlmResponse
            })
            
            return;
        }

        const hydeConfig: HydeConfig = {
            temperature: 0
        }

        const hydeService: HydeService = new HydeService(genAI)

        const fakeDoc = await hydeService.generateHypotheticalDocument(messageBody, hydeConfig);

        const relevantChunks = await chunkRetrieval(1, fakeDoc, genAI)

        const generateLlmmResponse = async (messageBody: string): Promise<GenerateContentResponse> => {
            const response = await genAI.models.generateContent({
                model: 'gemini-2.0-flash-001',
                contents: `Given this user question ${messageBody} and this retrieved documentChunk ${relevantChunks[0].content}
                        can you give an answer to the users original question which was: ${messageBody} DON'T MENTION CHUNKS IN YOUR ANSWER IN REGARDS TO DOCUMENTCHUNKS`,
            });
            return response;
        }

        const llmResp = await generateLlmmResponse(messageBody);

            const newLlmResponse = await db.message.create({
            data: {
                chatId: chatRoomId,
                role: 'llm',
                body: llmResp.text,
                isHuman: false
            }
            })

            io.to(roomId).emit('new-llm-response', {
            message: 'New Llm Message sent successfully',
            newLlmMessage: newLlmResponse
            })

        return;

        } catch (error) {
            console.log('error with sending message', error)
        }
    })

    socket.emit('welcome', { 
        message: 'Connected to WebSocket server',
        socketId: socket.id 
    });

    socket.on('test', (data) => {
        console.log('Received test:', data);

        socket.emit('test-response', { 
        received: data,
        timestamp: new Date().toISOString()
        });
    });

    socket.on('disconnect', () => {
        console.log('user disconnected')
    })
    })
}