// Get the width and height of the screen
const screenWidth = 1100;
const screenHeight = 800;

// Define the output ranges
const heightRange = [20, 100];
const widthRange = [175, 5];

const onButton = document.getElementById("on");
const offButton = document.getElementById("off");
const photoresistor1 = document.getElementById("photoresistorLeftTop");
const photoresistor2 = document.getElementById("photoresistorRightTop");
const photoresistor3 = document.getElementById("photoresistorLeftDown");
const photoresistor4 = document.getElementById("photoresistorRightDown");
const servoH = document.getElementById("servoHorizontal");
const servoV = document.getElementById("ServoVertical");
const socket = io();

// const model = await handTrack.load();
// const predictions = await model.detect(img);

socket.on("PhotoresistorLeftTop-value", (data) => {
  photoresistor1.innerText = `PR1: ${data}`;
});
socket.on("PhotoresistorRightTop-value", (data) => {
  photoresistor2.innerText = `PR2: ${data}`;
});
socket.on("PhotoresistorLeftDown-value", (data) => {
  photoresistor3.innerText = `PR3: ${data}`;
});
socket.on("PhotoresistorRightDown-value", (data) => {
  photoresistor4.innerText = `PR4: ${data}`;
});
socket.on("ServoHorizontal-value", (data) => {
  servoH.innerText = `ServoH: ${data}`;
});
socket.on("ServoVertical-value", (data) => {
  servoV.innerText = `ServoV: ${data}`;
});

window.addEventListener("mousemove", (event) => {
  let posX = event.clientX;
  let posY = event.clientY;
  let mapedPosX = map(
    posX,
    0,
    window.screen.availWidth,
    widthRange[0],
    widthRange[1]
  );
  let mapedPosY = map(
    posY,
    0,
    window.screen.availHeight,
    heightRange[0],
    heightRange[1]
  );
  // console.log("PosX: ", posX);
  // console.log("PosY: ", posY);
  // console.log("MapedPosX: ", mapedPosX);
  // console.log("MapedPosY: ", mapedPosY);

  // socket.emit("Position", [mapedPosX, mapedPosY]);
});

// Mapping function for screen size to servo max and min values
function map(value, inMin, inMax, outMin, outMax) {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

document.addEventListener("DOMContentLoaded", () => {
  // Access the webcam and start streaming
  const video = document.getElementById("video");

  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        video.srcObject = stream;
        detectHand();
      })
      .catch((error) => console.error("Error accessing webcam:", error));
  }

  // Function to detect hand
  function detectHand() {
    const modelParams = {
      flipHorizontal: false, // flip e.g. for video
      maxNumBoxes: 2, // maximum number of boxes to detect
      iouThreshold: 0.5, // ioU threshold for non-max suppression
      scoreThreshold: 0.79, // confidence threshold for predictions.
    };

    handTrack.load(modelParams).then((model) => {
      // Detect hand in video stream
      runDetection(model);
    });
  }

  // Function to run hand detection
  function runDetection(model) {
    model.detect(video).then((predictions) => {
      if (predictions.length > 0) {
        // Hand is detected
        const hand = predictions[0];

        // Access hand information
        const handOpen = hand.class === "open" ? "Open" : "Closed";
        const handPosition = { x: hand.bbox[0], y: hand.bbox[1] };

        console.log(`Hand is ${handOpen}. Position:`, handPosition);
        let mapedPosX = map(
          handPosition.x,
          0,
          window.screen.availWidth,
          widthRange[0],
          widthRange[1]
        );
        let mapedPosY = map(
          handPosition.y,
          0,
          window.screen.availHeight,
          heightRange[0],
          heightRange[1]
        );

        socket.emit("Position", [Math.round(mapedPosX), Math.round(mapedPosY)]);

        // Call runDetection again to continue detecting hand
        runDetection(model);
      } else {
        // No hand detected
        console.log("No hand detected.");

        // Call runDetection again to continue detecting hand
        runDetection(model);
      }
    });
  }
});
