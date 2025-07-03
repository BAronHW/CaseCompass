import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
}

interface WebSocketConfig {
  port: number;
  nodeEnv: string;
}

const config: Config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
};

const websocketConfig: WebSocketConfig = {
  port: Number(process.env.WSPORT) || 8000,
  nodeEnv: process.env.NODE_ENV || 'development',
}

export { config, websocketConfig };