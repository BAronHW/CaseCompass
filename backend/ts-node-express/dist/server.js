"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_js_1 = __importDefault(require("./app.js"));
const config_js_1 = __importDefault(require("./config/config.js"));
const taskWorker_js_1 = require("./lib/taskWorker.js");
const models_js_1 = require("./models/models.js");
app_js_1.default.listen(config_js_1.default.port, () => {
    console.log(`Server running on port ${config_js_1.default.port}`);
});
(0, taskWorker_js_1.startTaskWorker)(models_js_1.TypeOfTask.DocumentUpload);
