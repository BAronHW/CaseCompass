"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeOfTask = void 0;
var TypeOfTask;
(function (TypeOfTask) {
    TypeOfTask[TypeOfTask["DocumentUpload"] = 0] = "DocumentUpload";
    TypeOfTask[TypeOfTask["ChunkDocument"] = 1] = "ChunkDocument";
    TypeOfTask[TypeOfTask["ConvertChunkToEmbedding"] = 2] = "ConvertChunkToEmbedding";
    TypeOfTask[TypeOfTask["DeleteDocument"] = 3] = "DeleteDocument";
})(TypeOfTask || (exports.TypeOfTask = TypeOfTask = {}));
