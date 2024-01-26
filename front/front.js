// Get the width and height of the screen
const screenWidth = window.screen.width;
const screenHeight = window.screen.height;

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
  console.log("PosX: ", posX);
  console.log("PosY: ", posY);
  console.log("MapedPosX: ", mapedPosX);
  console.log("MapedPosY: ", mapedPosY);

  socket.emit("Position", [mapedPosX, mapedPosY]);
});

// onButton.addEventListener("click", () => {
//   socket.emit("press on");
// });

// Map the screen height and width to the desired ranges
// const mappedHeight = map(
//   screenHeight / 2,
//   0,
//   screenHeight,
//   heightRange[0],
//   heightRange[1]
// );
// const mappedWidth = map(
//   screenWidth / 2,
//   0,
//   screenWidth,
//   widthRange[0],
//   widthRange[1]
// );

// Display the mapped values
// console.log("Mapped Height:", mappedHeight);
// console.log("Mapped Width:", mappedWidth);

// Mapping function
function map(value, inMin, inMax, outMin, outMax) {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}
