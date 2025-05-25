"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const documentController_js_1 = require("../controllers/documentController.js");
const verifyToken_js_1 = require("../middlewares/verifyToken.js");
const router = (0, express_1.Router)();
router.post('/createDocument', verifyToken_js_1.verifyToken, documentController_js_1.uploadDocument);
exports.default = router;
