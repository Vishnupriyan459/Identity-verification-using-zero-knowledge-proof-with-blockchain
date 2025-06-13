import { useRef, useState } from "react";
import Webcam from "react-webcam";
import axios from "axios";

function Upload() {
  const webcamRef = useRef(null);
  const [image, setImage] = useState(null);
  const [response, setResponse] = useState("");
  const [isCameraActive, setIsCameraActive] = useState(false);  // Initially false, webcam is off

  // Capture the image when "Capture" button is clicked
  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);
    setIsCameraActive(false);  // Stop camera feed after capture
  };

  // Upload the captured image for verification
  const uploadImage = async () => {
    if (!image) return;

    const blob = await fetch(image).then(res => res.blob());
    const formData = new FormData();
    formData.append("image", blob, "captured-image.jpg");

    try {
      const res = await axios.post("http://localhost:5000/verify", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setResponse(res.data.message);
    } catch (error) {
      setResponse("Error verifying image");
    }
  };

  // Re-enable the webcam feed when user decides to retry
  const retryCapture = () => {
    setIsCameraActive(true);  // Reactivate webcam
    setImage(null);  // Reset image
    setResponse("");  // Reset the response
  };

  // Start the camera feed
  const startCamera = () => {
    setIsCameraActive(true);  // Activate the webcam feed
  };

  return (
    <div className="App">
      <h1>Biometric Face Verification</h1>

      {/* Button to start the camera feed */}
      {!isCameraActive && (
        <button onClick={startCamera}>Start Camera</button>
      )}

      {/* Show webcam live feed if camera is active */}
      {isCameraActive && (
        <Webcam
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={{
            facingMode: "user",
          }}
        />
      )}

      {/* Button to capture the image */}
      {isCameraActive && <button onClick={capture}>Capture</button>}

      {/* Display captured image and verification button */}
      {image && (
        <div>
          <img src={image} alt="Captured" />
          <button onClick={uploadImage}>Verify Face</button>
          <button onClick={retryCapture}>Retry Capture</button>
        </div>
      )}

      {/* Display response message */}
      {response && <p>{response}</p>}
    </div>
  );
}

export default Upload;
