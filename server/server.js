require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const { authenticateToken, regenerateAccessToken } = require("./middleware/auth");

const userRouter = require("./routes/user");
const quizRouter = require("./routes/quiz");
const gameRouter = require("./routes/game");
const playerResultRouter = require("./routes/playerResult");
const leaderboardRouter = require("./routes/leaderboard");

mongoose.connect(process.env.DATABASE_URL);

const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to database"));

app.use(express.json({ limit: "5mb" }));
app.use(cors());
// app.use(authenticateToken);
//app.use(regenerateAccessToken);

app.use("/api/users", authenticateToken, userRouter);
app.use("/api/quizes", authenticateToken, quizRouter);
app.use("/api/games", authenticateToken, gameRouter);
app.use("/api/playerResults", authenticateToken, playerResultRouter);
app.use("/api/leaderboard", authenticateToken, leaderboardRouter);

const authRouter = require("./routes/auth");
app.use("/api/auth", authRouter);
require('./routes')(app);
app.listen(process.env.PORT, () => console.log(`Server started on port ${process.env.PORT}`));

// socketServer setting below
const io = require("socket.io")(3001, {
  cors: {
    //origin: ["http://localhost:3000", "https://admin.socket.io/#/sockets"],
  },
});

let games = {};
let leaderboard;
let players = [];

const addPlayer = (userName, socketId, pin) => {
  !players.some((player) => player.socketId === socketId) && players.push({ userName, socketId, pin});
};

const getPlayer = (socketId) => {
  return players.find((player) => player.socketId === socketId);
};

io.on("connection", (socket) => {
  socket.on("disconnect", (reason) => {
    console.log("Socket " + socket.id + " was disconnected");
    console.log(reason);
    let player = getPlayer(socket.id);
    console.log("player:", player)
    if (player) {
      io.to(player.pin).emit("player-disconnected", player);
    }
  });
  socket.on("init-game", (newGame, newLeaderboard) => {
    games[newGame.pin] = {
      game: JSON.parse(JSON.stringify(newGame)),
      leaderboard: JSON.parse(JSON.stringify(newLeaderboard)),
      hostId: socket.id,
    };
    socket.join(newGame.pin);
    console.log("Host with id " + socket.id + " started game and joined room: " + newGame.pin);
  });

  socket.on("add-player", (user, socketId, pin, callback) => {
    const gameInstance = games[pin];

    if (gameInstance) {
      // 檢查是否已經是房主
      console.log("gameInstance", gameInstance)
      console.log("user:", user)
      if (gameInstance.game.hostId.toString() === user._id.toString()) {
        callback("same", gameInstance.game._id);
      } else {
        addPlayer(user.userName, socketId, pin);
        callback("correct", user._id, gameInstance.game._id);
        socket.join(pin);
        console.log("Student " + user.userName + " with id " + socket.id + " joined room " + pin);
        let player = getPlayer(socketId);
        socket.to(pin).emit("player-added", player);
      }
    } else {
      callback("wrong", null);
    }
  });

  socket.on("start-game", (newQuiz) => {
    quiz = JSON.parse(JSON.stringify(newQuiz));
    console.log("Move players to game");
    console.log(game.pin);
    socket.to(game.pin).emit("move-to-game-page", game._id);
  });

  socket.on('kick-player', (data) => {
    // emit cancer-game to client student
    console.log("Student " + data.userName + " with id " + data.socketId + " was kicked");
    socket.to(data.pin).emit('cancer-game', { message: 'You have been kicked from the game.' });
  });

  socket.on("question-preview", (callback) => {
    callback();
    socket.to(game.pin).emit("host-start-preview");
  });

  socket.on("start-question-timer", (time, question, callback) => {
    console.log("Send question " + question.questionIndex + " data to players");
    socket.to(game.pin).emit("host-start-question-timer", time, question);
    callback();
  });

  socket.on("send-answer-to-host", (data, score) => {
    let player = getPlayer(socket.id);
    socket.to(game.pin).emit("get-answer-from-player", data, leaderboard._id, score, player);
  });
});
