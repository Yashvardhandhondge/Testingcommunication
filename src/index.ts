import WebSocket, { WebSocketServer } from 'ws';
import http from 'http';

interface IMessage {
  type: 'join' | 'chat';
  roomId: string;
  message?: string;
  username?: string;
}

const server = http.createServer((request: http.IncomingMessage, response: http.ServerResponse) => {
  console.log(`${new Date()} Received request for ${request.url}`);
  response.end("hi there");
});

const wss = new WebSocketServer({ server });
const rooms: { [roomId: string]: WebSocket[] } = {}; 

wss.on('connection', (ws: WebSocket) => {
  let currentRoomId: string | null = null;

  ws.on('message', (data: string, isBinary: boolean) => {
    const message: IMessage = JSON.parse(data);

    if (message.type === 'join') {
      const roomId = message.roomId;
      if (!rooms[roomId]) {
        rooms[roomId] = [];
      }
      rooms[roomId].push(ws);
      currentRoomId = roomId;
      console.log(`User joined room ${roomId}`);
    } else if (message.type === 'chat') {
      const { roomId, message: text, username } = message;
      const chatMessage = { username, text };

      if (rooms[roomId]) {
        rooms[roomId].forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'chat', ...chatMessage }), { binary: isBinary });
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
