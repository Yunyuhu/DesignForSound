import React, { useState, useEffect } from 'react';

const App = () => {
  const [micLevel, setMicLevel] = useState(0);

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
        setMicLevel(average/10);
        // setMicLevel(average / 256); // 正規化到 0-1 之間
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

    // 在組件卸載時停止麥克風
    return () => {
      if (mediaStream) {
        const tracks = mediaStream.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div>
      <h1>聲音偵測器</h1>
      <div>
        <p>音量: {micLevel.toFixed(2)}</p>
        {/* 在這裡可以使用音量的數值來畫一個動態的圖形 */}
        <div
          style={{
            width: '100px',
            height: '20px',
            backgroundColor: 'blue',
            transform: `scaleX(${micLevel})`,
            transformOrigin: 'left',
            transition: 'transform 0.2s ease-in-out',
          }}
        ></div>
      </div>
    </div>
  );
};

export default App;
