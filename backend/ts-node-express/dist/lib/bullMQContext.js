"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobQueue = void 0;
const bullmq_1 = require("bullmq");
const redisConnectionContext_js_1 = require("./redisConnectionContext.js");
exports.jobQueue = new bullmq_1.Queue('documentTasks', {
    connection: redisConnectionContext_js_1.redisConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000
        }
    }
});
