const socket = io().connect("/");
let myVideoStream;

const HOST = window.location.host;
let peerConfig = {
  path: "/peerjs",
  host: HOST === "localhost:5000" ? "/" : HOST,
  secure: HOST !== "localhost:5000",
};

if (HOST === "localhost:5000") {
  peerConfig.port = 5000;
}
var peer = new Peer(undefined, peerConfig);

peer.on("open", (id) => {
  console.log("Peer Opened:", id);
  socket.emit("join-room", ROOM_ID, id);
});

socket.on("user-connected", (userId) => {
  console.log("user connected:", userId);
  connectToNewUser(userId, myVideoStream);
});

const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
myVideo.muted = true;

navigator.mediaDevices
  .getUserMedia({
    audio: true,
    video: true,
  })
  .then((stream) => {
    myVideoStream = stream;

    addVideoStream(myVideo, stream);

    peer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });
  });

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
    videoGrid.append(video);
  });
};

const connectToNewUser = (userId, stream) => {
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
};

console.log(ROOM_ID);
