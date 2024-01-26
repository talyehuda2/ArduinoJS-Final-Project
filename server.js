const five = require("johnny-five");
const express = require("express");
const { createServer } = require("node:http");
const { join } = require("node:path");
const { Server } = require("socket.io");
const app = express();
const server = createServer(app);
const io = new Server(server);
const board = new five.Board();

const servohLimitLow = 5;
const servohLimitHigh = 175;
let servohLocation = 90;

const servovLimitLow = 20;
const servovLimitHigh = 100;
let servovLocation = 90;

const tol = 50;
const dtime = 10;

app.use(express.static("front"));

server.listen(3000, () => {
  console.log("server running at http://localhost:3000");
});

board.on("ready", function () {
  const led = new five.Led(13);
  prLt = new five.Sensor({
    pin: "A0",
    freq: 250,
  });
  prRt = new five.Sensor({
    pin: "A1",
    freq: 250,
  });
  prLd = new five.Sensor({
    pin: "A2",
    freq: 250,
  });
  prRd = new five.Sensor({
    pin: "A3",
    freq: 250,
  });

  servoh = new five.Servo({
    pin: 5,
    range: [servohLimitLow, servohLimitHigh],
    startAt: servohLocation,
  });

  servov = new five.Servo({
    pin: 6,
    range: [servovLimitLow, servovLimitHigh],
    startAt: servovLocation,
  });

  io.on("connection", (user) => {
    prLt.on("data", function () {
      user.emit("PhotoresistorLeftTop-value", this.value);
    });
    prRt.on("data", function () {
      user.emit("PhotoresistorRightTop-value", this.value);
    });
    prLd.on("data", function () {
      user.emit("PhotoresistorLeftDown-value", this.value);
    });
    prRd.on("data", function () {
      console.log("prRD");
      user.emit("PhotoresistorRightDown-value", this.value);
    });
    servoh.on("change", function () {
      console.log("change servoH");
      io.emit("ServoHorizontal-value", this.value);
    });
    servov.on("change", function () {
      console.log("change servoV");
      io.emit("ServoVertical-value", this.value);
    });

    user.on("press on", () => {
      led.on();
    });

    user.on("press off", () => {
      led.off();
    });
  });

  setInterval(moveServo, dtime);
});

// function responsible to move the servo 1 step into the light
function moveServo() {
  let prLtValue = prLt.value;
  let prRtValue = prRt.value;
  let prLdValue = prLd.value;
  let prRdValue = prRd.value;

  let averageT = (prLtValue + prRtValue) / 2;
  let averageD = (prLdValue + prRdValue) / 2;
  let averageR = (prRtValue + prRdValue) / 2;
  let averageL = (prLtValue + prLdValue) / 2;

  differnceVertical = averageT - averageD;
  differnceHorizontal = averageL - averageR;

  if (-1 * tol > differnceVertical || differnceVertical > tol) {
    if (averageT < averageD) {
      servovLocation++;
      if (servohLocation > servohLimitHigh) {
        servohLocation = servohLimitHigh;
      }
    } else if (averageT > averageD) {
      servovLocation--;
      if (servohLocation < servohLimitLow) {
        servohLocation = servohLimitLow;
      }
    }
    servov.to(servovLocation);
  }

  if (-1 * tol > differnceHorizontal || differnceHorizontal > tol) {
    if (averageL < averageR) {
      servohLocation++;
      if (servohLocation > servohLimitHigh) {
        servohLocation = servohLimitHigh;
      }
    } else if (averageL > averageR) {
      servohLocation--;
      if (servohLocation < servohLimitLow) {
        servohLocation = servohLimitLow;
      }
    }
    servoh.to(servohLocation);
  }
}
