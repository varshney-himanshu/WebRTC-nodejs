const express = require("express");
const app = express();
const server = require("http").createServer(app);
const { v4: uuidv4 } = require("uuid");

const io = require("socket.io")(server, {
  allowEIO3: true, // false by default
  cors: {
    origin: "*",
  },
});
app.set("view engine", "ejs");
app.use(express.static("public"));

const { ExpressPeerServer } = require("peer");

const peerServer = ExpressPeerServer(server, { debug: true });

app.use("/peerjs", peerServer);

app.get("/:room/", (req, res) => {
  const roomId = req.params.room;
  res.render("room", { roomId });
});

app.get("/", (req, res) => {
  res.redirect(`/${uuidv4()}`);
  //   res.render("room", { roomId: "hello" });
});

io.on("connection", (socket) => {
  console.log("socket connected", socket.id);
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).emit("user-connected", userId);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`server is listening on port ${PORT}`));
