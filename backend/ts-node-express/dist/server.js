"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const config_1 = __importDefault(require("./config/config"));
const taskWorker_1 = require("./lib/taskWorker");
const models_1 = require("./models/models");
app_1.default.listen(config_1.default.port, () => {
    console.log(`Server running on port ${config_1.default.port}`);
});
(0, taskWorker_1.startTaskWorker)(models_1.TypeOfTask.DocumentUpload);
