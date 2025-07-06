import dotenv from 'dotenv';
dotenv.config();
const config = {
    port: Number(process.env.PORT) || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
};
const websocketConfig = {
    port: Number(process.env.WSPORT) || 8000,
    nodeEnv: process.env.NODE_ENV || 'development',
};
export { config, websocketConfig };
