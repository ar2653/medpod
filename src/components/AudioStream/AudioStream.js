import React, { useState, useEffect, useRef } from "react";
import { Button, Layout, Select } from "antd";
import { AudioOutlined } from "@ant-design/icons";
import io from "socket.io-client";
import "./AudioStream.css";


const { Content } = Layout;
const { Option } = Select;

const socket = io("http://localhost:5001", {
  transports: ["websocket"],
});

const AudioStream = () => {
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [audioContext, setAudioContext] = useState(null);
  const workletNodeRef = useRef(null);
  const mediaStreamSourceRef = useRef(null);

  useEffect(() => {
    // Get audio devices
    navigator.mediaDevices.enumerateDevices().then((deviceInfos) => {
      const audioDevices = deviceInfos.filter(
        (device) => device.kind === "audioinput"
      );
      setDevices(audioDevices);
    });

    // Audio worker
    const loadAudioWorklet = async () => {
      try {
        const context = new (window.AudioContext || window.webkitAudioContext)();
        setAudioContext(context);
        if (context.state === 'suspended') {
          await context.resume();
        }
        await context.audioWorklet.addModule('audio-processor.js');
      } catch (error) {
        console.error("Error loading AudioWorklet module", error);
      }
    };
    loadAudioWorklet();

    // socket
    socket.on("audio-data", (data) => {
      console.log("Audio data received to FE");
      playAudio(data);
    });

    return () => {
      socket.off("audio-data");
    };
  }, []);

  const startTransmission = async () => {
    if (!selectedDevice) {
      alert("Please select an audio device.");
      return;
    }

    try {
      // Load worker
      const context = new (window.AudioContext || window.webkitAudioContext)();
      setAudioContext(context);
      if (context.state === 'suspended') {
        await context.resume();
      }
      await context.audioWorklet.addModule('audio-processor.js');
      // Create Stream and AudioWorker
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: selectedDevice },
      });

      const source = context.createMediaStreamSource(stream);
      const workletNode = new AudioWorkletNode(context, 'audio-processor');

      source.connect(workletNode);
      workletNode.connect(context.destination);

      // Handle messages from AudioWorkletProcessor
      workletNode.port.onmessage = (event) => {
        const audioData = event.data;
        console.log("Emitting audio data to server from client (React app)");
        socket.emit("audio-data", audioData);
      };

      workletNode.port.postMessage('start');

      // Store references to manage stopping later
      mediaStreamSourceRef.current = source;
      workletNodeRef.current = workletNode;

    } catch (err) {
      console.error("Error accessing media devices.", err);
    }
  };

  // stop transmission function goes here
  const stopTransmission = () => {
    if (audioContext) {
      if (mediaStreamSourceRef.current) {
        mediaStreamSourceRef.current.disconnect();
      }
      if (workletNodeRef.current) {
        workletNodeRef.current.disconnect();
      }
      audioContext.close().then(() => {
        console.log("Audio context closed");
      }).catch((error) => {
        console.error("Error closing audio context", error);
      });
      // Stop emitting data to the server
      socket.off("audio-data");
      setAudioContext(null);
    }
    setIsTransmitting(false);
  };

  // play audio function
  const playAudio = (data) => {
    if (audioContext) {
      try {
        const audioBuffer = new Float32Array(data);
        const buffer = audioContext.createBuffer(1, audioBuffer.length, audioContext.sampleRate);
        buffer.copyToChannel(audioBuffer, 0);

        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.start();
      } catch (error) {
        console.error("Error playing audio", error);
      }
    }
  };

  return (
    <Layout className="audio-stream-layout">
      <Content className="audio-stream-content">
        <div className="audio-section left">
          <div className="transmit-controls">
            <Select
              style={{ width: "100%", marginBottom: "16px" }}
              placeholder="Select Audio Device"
              onChange={(value) => setSelectedDevice(value)}
            >
              {devices.map((device) => (
                <Option key={device.deviceId} value={device.deviceId}>
                  {device.label || "Unknown Device"}
                </Option>
              ))}
            </Select>
            <Button
              icon={<AudioOutlined />}
              type={isTransmitting ? "primary" : "default"}
              onClick={() => {
                if (isTransmitting) {
                  stopTransmission();
                } else {
                  startTransmission();
                }
                setIsTransmitting(!isTransmitting);
              }}
            >
              {isTransmitting ? "Stop Transmission" : "Start Transmission"}
            </Button>
          </div>
        </div>
        <div className="audio-section right">
          <div className="audio-visualization">
            <p>
              {isTransmitting
                ? "Receiving audio..."
                : "Waiting for incoming audio..."}
            </p>
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default AudioStream;
