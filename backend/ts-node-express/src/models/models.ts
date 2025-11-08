export interface UserWithPassword {
  id: number;
  name: string | null;
  email: string;
  password: string;
  uid: string;
}
export interface UserWithoutPassword {
  id: number;
  name: string | null;
  email: string;
  uid: string;
}
export interface Document {
  id: number
  key: String
  size: number
  name: String
  user: UserWithPassword
  uid: String
}
export interface PDF {
  id: number
  pdfBuffer: Buffer
  metaData: string
}

export enum TypeOfTask {
  DocumentUpload,
  ChunkDocument,
  ConvertChunkToEmbedding,
  DeleteDocument
}

export interface ErrorResponse extends Error{
    success: false;
    error: string;
    details?: any;
    statusCode: number;
}

export interface SuccessResponse<T> {
    message?: string;
    data?: T;
}

export interface LoginResult {
    user: {
        name: string;
        email: string;
        uid: string;
    };
    accessToken: string;
    refreshToken: string;
}

export interface HydeConfig {
  domain?: string;
  documentType?: string;
  maxTokens?: number;
  temperature?: number;
}

export class Response {

 public static createErrorResponse(
        message: string,
        statusCode: number = 500,
        details?: any
    ): { body: ErrorResponse } {
        return {
            body: {
                statusCode,
                success: false,
                error: message,
                details,
                name: "",
                message: ""
            }
        };
    }

  public static createSuccessResponse<T>(
        message?: string,
        data?: T,
        statusCode: number = 200
    ): { statusCode: number; body: SuccessResponse<T> } {
        return {
            statusCode,
            body: {
                message,
                data
            }
        };
    }
}

export type ServiceResponse<T> = {
    statusCode: number;
    body: SuccessResponse<T>;
};

export interface DocumentResult {
    id: number;
    name: string;
    size: number;
    key: string;
    uid: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface DocumentWithUrl extends DocumentResult {
    objectUrl: string;
}

export interface contractAnalysisBody {
    body: string,
    methodDetails: string
}