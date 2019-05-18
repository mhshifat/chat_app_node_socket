const path = require("path");
const http = require("http");
const express = require("express");
const socketIO = require("socket.io");

const { generateMessage, generateLocationMessage } = require("./utils/message");
const Users = require("./utils/users");

const port = process.env.PORT || 5000;

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const users = new Users();

app.use(express.static(path.join(__dirname, "./public")));

io.on("connection", socket => {
  console.log(`New user connected`);

  socket.on("join", (param, cb) => {
    if (!param.name || !param.room) return cb("Name & Room name is required");
    socket.join(param.room);
    users.removeUser(socket.id);
    users.addUser(socket.id, param.name, param.room);
    io.to(param.room).emit("updateUsersList", users.getUsersList(param.room));
    socket.emit(
      "greetingMessage",
      generateMessage("Admin", "Welcome to the chat room")
    );

    socket.broadcast
      .to(param.room)
      .emit(
        "greetingMessage",
        generateMessage("Admin", `${param.name} has joined`)
      );
    cb();
  });

  socket.on("createMessage", (message, cb) => {
    const user = users.getUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "newMessage",
        generateMessage(user.name, message.text)
      );
    }
    cb("Your message has been sent");
  });

  socket.on("createLocationMessage", coords => {
    const user = users.getUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "newLocationMessage",
        generateLocationMessage(user.name, coords.latitude, coords.longitude)
      );
    }
  });

  socket.on("disconnect", () => {
    const user = users.removeUser(socket.id);
    if (user) {
      io.to(user.room).emit("updateUsersList", users.getUsersList(user.room));
      io.to(user.room).emit(
        "newMessage",
        generateMessage("Admin", `${user.name} has left`)
      );
    }
  });
});

server.listen(port, () => {
  console.log(`==> The server is running on http://localhost:${port}`);
});
