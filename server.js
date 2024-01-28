const five = require("johnny-five");
const express = require("express");
const { createServer } = require("node:http");
const { join } = require("node:path");
const { Server } = require("socket.io");
const app = express();
const server = createServer(app);
const io = new Server(server);
const board = new five.Board({ port: "COM4" });

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
      io.emit("ServoHorizontal-value", servoh.value);
      io.emit("ServoVertical-value", servov.value);
    });
    prRt.on("data", function () {
      user.emit("PhotoresistorRightTop-value", this.value);
    });
    prLd.on("data", function () {
      user.emit("PhotoresistorLeftDown-value", this.value);
    });
    prRd.on("data", function () {
      user.emit("PhotoresistorRightDown-value", this.value);
    });

    user.on("light-tracker", () => {
      console.log("light-tracker");
      moveServoToLight();
    });

    user.on("face-hand-tracker", (data) => {
      console.log("face-hand-tracker");
      let position = data;
      position = limitPosition(position);
      setTimeout(() => {
        moveServosToPosition(position[0], position[1]);
      }, 200);
    });

    user.on("mouse-tracker", (data) => {
      let position = data;
      console.log(`mouse tracker`);
      position = limitPosition(position);
      moveServosToPosition(position[0], position[1]);
    });
  });
});

// function responsible to move the servo 1 step into the light
function moveServoToLight() {
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

// function that get position with Horizontal and Vertical Position and set the servos values to them
function moveServosToPosition(position) {
  console.log("postionH: ", position[0]);
  console.log("postionV: ", position[1]);
  servoh.to(position[0]);
  servov.to(position[1]);
}

function limitPosition(positionH, positionV) {
  if (positionH > servohLimitHigh) {
    positionH = servohLimitHigh;
  } else if (positionH < servohLimitLow) {
    positionH = servohLimitLow;
  }
  if (positionV > servovLimitHigh) {
    positionV = servovLimitHigh;
  } else if (positionV < servovLimitLow) {
    positionV = servovLimitLow;
  }
  return [positionH, positionV];
}
