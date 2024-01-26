const five = require("johnny-five");
const board = new five.Board();

const servohLimitLow = 5;
const servohLimitHigh = 175;
let servohLocation = 90;

const servovLimitLow = 20;
const servovLimitHigh = 100;
let servovLocation = 90;

const tol = 100;
const dtime = 50;

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

  function moveServo() {
    console.log("moveServo");
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

  setInterval(moveServo, dtime);
  //Test Horizontal
  //   const delayBetweenMoves = 1000;
  //   for (let pos = servohLimitLow; pos <= servohLimitHigh; pos += 10) {
  //     // Use setTimeout to add a delay between moves
  //     setTimeout(() => {
  //       servoh.to(pos);
  //       console.log("Servo value: " + servoh.value);
  //       console.log("prLt value: " + prLt.value);
  //       console.log("prRt value: " + prRt.value);
  //       console.log("prLd value: " + prLd.value);
  //       console.log("prRd value: " + prRd.value);
  //     }, delayBetweenMoves * (pos / 10));
  //   }
});
