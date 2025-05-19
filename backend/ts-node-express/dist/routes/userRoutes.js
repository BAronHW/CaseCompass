"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_js_1 = require("../controllers/userController.js");
const router = (0, express_1.Router)();
router.get('/user/:uid', userController_js_1.findUserByUid);
router.get('/user/', userController_js_1.findAllUsers);
exports.default = router;
