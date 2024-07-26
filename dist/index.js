"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = __importStar(require("ws"));
const http_1 = __importDefault(require("http"));
const server = http_1.default.createServer((request, response) => {
    console.log(`${new Date()} Received request for ${request.url}`);
    response.end("hi there");
});
const wss = new ws_1.WebSocketServer({ server });
const rooms = {};
wss.on('connection', (ws) => {
    let currentRoomId = null;
    ws.on('message', (data, isBinary) => {
        const message = JSON.parse(data);
        if (message.type === 'join') {
            const roomId = message.roomId;
            if (!rooms[roomId]) {
                rooms[roomId] = [];
            }
            rooms[roomId].push(ws);
            currentRoomId = roomId;
            console.log(`User joined room ${roomId}`);
        }
        else if (message.type === 'chat') {
            const { roomId, message: text, username } = message;
            const chatMessage = { username, text };
            if (rooms[roomId]) {
                rooms[roomId].forEach((client) => {
                    if (client.readyState === ws_1.default.OPEN) {
                        client.send(JSON.stringify(Object.assign({ type: 'chat' }, chatMessage)), { binary: isBinary });
                    }
                });
            }
        }
    });
    ws.on('close', () => {
        if (currentRoomId && rooms[currentRoomId]) {
            rooms[currentRoomId] = rooms[currentRoomId].filter(client => client !== ws);
            if (rooms[currentRoomId].length === 0) {
                delete rooms[currentRoomId];
            }
        }
        console.log("User disconnected");
    });
    console.log("User connected");
    ws.send('Hello! Message From Server!!');
});
server.listen(8080, () => {
    console.log(`${new Date()} Server is listening on port 8080`);
});
