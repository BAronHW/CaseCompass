"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const router = (0, express_1.Router)();
router.get('/user/:uid', userController_1.findUserByUid);
router.get('/user/', userController_1.findAllUsers);
exports.default = router;
