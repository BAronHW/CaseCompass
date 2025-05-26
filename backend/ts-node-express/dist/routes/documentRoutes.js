"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const documentController_1 = require("../controllers/documentController");
const verifyToken_1 = require("../middlewares/verifyToken");
const router = (0, express_1.Router)();
router.post('/createDocument', verifyToken_1.verifyToken, documentController_1.uploadDocument);
exports.default = router;
