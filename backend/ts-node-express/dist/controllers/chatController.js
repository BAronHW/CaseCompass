"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteChat = exports.pushToChat = exports.createNewChat = void 0;
const createNewChat = (req, res) => {
    // create a new ai chat 
    res.json({ message: "welcome to protected route" });
    return;
};
exports.createNewChat = createNewChat;
const pushToChat = (req, res) => {
    // push new input to chat
    res.json({ message: "welcome to protected route" });
    return;
};
exports.pushToChat = pushToChat;
const deleteChat = (req, res) => {
    // delete a chattemplate
    res.json({ message: "welcome to protected route" });
    return;
};
exports.deleteChat = deleteChat;
