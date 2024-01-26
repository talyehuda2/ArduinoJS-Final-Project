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
  console.log("ServoHorizontal-value ", data);
  servoH.innerText = `ServoH: ${data}`;
});
socket.on("ServoVertical-value", (data) => {
  console.log("ServoVertical-value ", data);
  servoV.innerText = `ServoV: ${data}`;
});

window.addEventListener("mousemove", (event) => {
  let frequency = event.clientY;
  socket.emit("frequency", frequency);
});

onButton.addEventListener("click", () => {
  socket.emit("press on");
});
