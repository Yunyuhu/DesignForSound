import React, { useState, useEffect } from 'react';

const App = () => {
  const [micLevel, setMicLevel] = useState(0);
  const [positions, setPositions] = useState([]);

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
        setMicLevel(average / 256); // 正規化到 0-1 之間
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

  useEffect(() => {
    const generatePositions = () => {
      const newPositions = Array.from({ length: 20 }, () => ({
        right: getRandomValue(0, 1000),
        top: getRandomValue(0, 800),
      }));
      setPositions(newPositions);
    };

    generatePositions(); // 初始生成
    const intervalId = setInterval(generatePositions, 300000); // 每 5 分鐘重新生成一次

    return () => clearInterval(intervalId);
  }, []);

  const ballSize = micLevel * 6000; // 調整球的大小

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'center'
      }}>
        <h1 style={{
          position: 'fixed',
          marginTop: '50px'
        }}>從現在開始，大聲說出你的想法！</h1>
      </div>

      <div style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
      }}>
        <div>
          {/* 使用球體 */}
          <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: `${ballSize + 85}px`,
                height: `${ballSize + 85}px`,
                borderRadius: '50%',
                backgroundColor: '#000000',
                transition: 'width 0.2s ease-in-out, height 0.2s ease-in-out'
              }}
            >
          {positions.map((position, index) => (
            
              <h1 key={index}
              style={{
                position: 'fixed',
                color:'#FFFFFF',
                ...position // 動態設定位置
              }}>懷疑詞句</h1>
              
          ))}
              
              <div style={{flexDirection:'column'}}>
                <h4 style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: "#FFFFFF"
                  }}>speak louder</h4>
                <p style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: "#FFFFFF"
                }}>音量: {micLevel.toFixed(2)}</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

// 生成指定範圍內的隨機數
const getRandomValue = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export default App;