import React, { useState, useEffect } from 'react';

const App = () => {
  const [micLevel, setMicLevel] = useState(0);
  const [positions, setPositions] = useState([]);
  const [isMicOn, setIsMicOn] = useState(true);

  useEffect(() => {
    let mediaStream = null;

    const handleMicData = (stream) => {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);

      microphone.connect(analyser);
      analyser.connect(audioContext.destination);

      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateMicLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((acc, value) => acc + value, 0) / bufferLength;
        setMicLevel(average / 256); // Normalize to 0-1
        requestAnimationFrame(updateMicLevel);
      };

      updateMicLevel();
    };

    const startMic = async () => {
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        handleMicData(mediaStream);
      } catch (error) {
        console.error('Error accessing microphone:', error);
      }
    };

    startMic();

    // Stop the microphone when the component is unmounted
    return () => {
      if (mediaStream) {
        const tracks = mediaStream.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    const generatePositions = () => {
      const newPositions = Array.from({ length: 20 }, () => ({
        right: getRandomValue(0, 1000),
        top: getRandomValue(0, 800),
      }));
      setPositions(newPositions);
    };

    generatePositions(); // Initial generation
    const intervalId = setInterval(generatePositions, 300000); // Every 5 minutes

    return () => clearInterval(intervalId);
  }, []);

  const ballSize = micLevel * 6000; // Adjust ball size based on mic level

  const toggleMic = () => {
    setIsMicOn((prev) => !prev);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <h1 style={{ position: 'fixed', marginTop: '50px' }}>Speak your mind loudly from now on!</h1>
      </div>

      <div
        style={{
          position: 'relative',
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        <div>
          {/* Ball Container */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: `${ballSize + 85}px`,
              height: `${ballSize + 85}px`,
              borderRadius: '50%',
              backgroundColor: '#000000',
              transition: 'width 0.2s ease-in-out, height 0.2s ease-in-out',
            }}
          >
            {/* Dynamic Texts */}
            {positions.map((position, index) => (
              <h1
                key={index}
                style={{
                  position: 'fixed',
                  color: '#FFFFFF',
                  ...position,
                  zIndex: 1, // Ensure dynamic texts are not overlapped by the button
                }}
              >
                懷疑詞句
              </h1>
            ))}

            {/* Button to Toggle Mic */}
            <div
              style={{
                position: 'fixed',
                zIndex: 2, // Ensure the button is on top
              }}
            >
              <button onClick={toggleMic} style={{ padding: '10px', backgroundColor: '#3498db', color: '#fff' }}>
                {isMicOn ? 'Turn Off Mic' : 'Turn On Mic'}
                123123123
              </button>
            </div>

            {/* Static Texts */}
            <div style={{ flexDirection: 'column', zIndex: 1 }}>
              <h4 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF' }}>
                Speak louder
              </h4>
              <p
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                }}
              >
                Volume: {micLevel.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Generate a random value within a specified range
const getRandomValue = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export default App;
