export var TypeOfTask;
(function (TypeOfTask) {
    TypeOfTask[TypeOfTask["DocumentUpload"] = 0] = "DocumentUpload";
    TypeOfTask[TypeOfTask["ChunkDocument"] = 1] = "ChunkDocument";
    TypeOfTask[TypeOfTask["ConvertChunkToEmbedding"] = 2] = "ConvertChunkToEmbedding";
    TypeOfTask[TypeOfTask["DeleteDocument"] = 3] = "DeleteDocument";
})(TypeOfTask || (TypeOfTask = {}));
export class Response {
    static createErrorResponse(message, statusCode = 500, details) {
        return {
            body: {
                statusCode,
                success: false,
                error: message,
                details
            }
        };
    }
    static createSuccessResponse(message, data, statusCode = 200) {
        return {
            statusCode,
            body: {
                message,
                data
            }
        };
    }
}
