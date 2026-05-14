import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.REACT_URL,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    socket.on("join-payment-session", (orderId) => {
      if (!orderId) return;
      socket.join(orderId);
      console.log(`User joined room: ${orderId}`);
    });
  });

  return io;
};

export const getIo = () => io;
