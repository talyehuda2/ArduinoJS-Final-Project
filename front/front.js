// Get the width and height of the screen
const screenWidth = 1100; //TODO: I can change this to get from video
const screenHeight = 800;
const videoWidth = 850; //TODO: I can change this to get from video
const videoHeight = 600;

// Define the output ranges
const heightRange = [20, 100];
const widthRange = [175, 5];

let socket = io();

function toggleView(viewId) {
  const allSections = ["light-tracker", "face-hand-tracker", "mouse-tracker"];

  allSections.forEach((section) => {
    const element = document.getElementById(section);
    if (element) {
      element.classList.remove("active");
    }
  });

  const selectedSection = document.getElementById(viewId);
  if (selectedSection) {
    selectedSection.classList.add("active");

    switch (viewId) {
      case "light-tracker":
        console.log("----------light-tracker----------");

        const photoresistor1 = document.getElementById("light-sensor-1");
        const photoresistor2 = document.getElementById("light-sensor-2");
        const photoresistor3 = document.getElementById("light-sensor-3");
        const photoresistor4 = document.getElementById("light-sensor-4");
        const servoH = document.getElementById("servo-1");
        const servoV = document.getElementById("servo-2");

        socket.on("PhotoresistorLeftTop-value", (data) => {
          photoresistor1.textContent = `LightSensor Top-Left: ${data}`;
        });
        socket.on("PhotoresistorRightTop-value", (data) => {
          photoresistor2.textContent = `LightSensor Top-Right: ${data}`;
        });
        socket.on("PhotoresistorLeftDown-value", (data) => {
          photoresistor3.textContent = `LightSensor Down-Left: ${data}`;
        });
        socket.on("PhotoresistorRightDown-value", (data) => {
          photoresistor4.textContent = `LightSensor Down-Right: ${data}`;
        });
        socket.on("ServoHorizontal-value", (data) => {
          servoH.textContent = `ServoH: ${data}`;
        });
        socket.on("ServoVertical-value", (data) => {
          servoV.textContent = `ServoV: ${data}`;
        });
        console.log("light-tracker");

        setInterval(() => {
          socket.emit(viewId);
        }, 50);
        break;

      case "face-hand-tracker":
        console.log("----------face-hand-tracker----------");
        console.log("getUserMedia supported in this browser.");

        const video = document.getElementById("video");
        if (navigator.mediaDevices.getUserMedia) {
          navigator.mediaDevices
            .getUserMedia({ video: true })
            .then((stream) => {
              video.srcObject = stream;
              video.play();
              video.style.display = "block";
              video.style.width = "100%";
              video.style.height = "100%";

              detectHand();
            })
            .catch((error) => console.error("Error accessing webcam:", error));
        } else {
          console.log("getUserMedia is not supported in this browser.");
        }

        // Function to detect hand
        function detectHand() {
          console.log("detectHand()");
          const modelParams = {
            flipHorizontal: false, // flip e.g. for video
            imageScaleFactor: 0.7, // reduce input image size for gains in speed.
            maxNumBoxes: 1, // maximum number of boxes to detect
            iouThreshold: 0.5, // ioU threshold for non-max suppression
            scoreThreshold: 0.79, // confidence threshold for predictions.
          };

          handTrack.load(modelParams).then((model) => {
            // Detect hand in video stream
            handTrack.startVideo(video).then((status) => {
              if (status) {
                console.log("Hand detection started...");
                runDetection(model);
              } else {
                console.error("Error starting video:", status);
              }
            });
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
              video.style.width = "110%";
              video.style.height = "110%";

              // if (handPosition == null) return;
              let mapedPosX = map(
                handPosition.x,
                0,
                videoWidth,
                widthRange[0],
                widthRange[1]
              );
              let mapedPosY = map(
                handPosition.y,
                0,
                videoHeight,
                heightRange[0],
                heightRange[1]
              );

              const xPositionElement =
                document.getElementById("face-position-x");
              const yPositionElement =
                document.getElementById("face-position-y");

              xPositionElement.textContent = Math.round(handPosition.x);
              yPositionElement.textContent = Math.round(handPosition.y);

              socket.emit(viewId, [
                Math.round(mapedPosX),
                Math.round(mapedPosY),
              ]);

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

        break;

      case "mouse-tracker":
        console.log("----------Mouse Tracker----------");
        // Your code for mouse-tracker
        const xPositionElement = document.getElementById("mouse-x");
        const yPositionElement = document.getElementById("mouse-y");

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

          xPositionElement.textContent = `Mouse Position X: ${Math.round(
            posX
          )}`;
          yPositionElement.textContent = `Mouse Position Y: ${Math.round(
            posY
          )}`;
          console.log(`MouseMove: ${[Math.round(posX), Math.round(posY)]}`);
          console.log(
            `MouseMapMove: ${[Math.round(mapedPosX), Math.round(mapedPosY)]}`
          );

          setTimeout(() => {
            socket.emit(viewId, [Math.round(mapedPosX), Math.round(mapedPosY)]);
          }, 50);
        });

        break;
    }
  }
}

// Mapping function for screen size to servo max and min values
function map(value, inMin, inMax, outMin, outMax) {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}
