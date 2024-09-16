import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    // Get audio devices
    navigator.mediaDevices.enumerateDevices().then((deviceInfos) => {
      const audioDevices = deviceInfos.filter(
        (device) => device.kind === "audioinput"
      );
      setDevices(audioDevices);
    });

    // socket
    socket.on("audio-data", (data) => {
      console.log("Audio data received to FE");
      // playAudio(data);
    });

  }, []);

  const startTransmission = async () => {
    if (!selectedDevice) {
      alert("Please select an audio device.");
      return;
    }

    try {
        // stream audio
    } catch (err) {
      console.error("Error accessing media devices.", err);
    }
  };

  // stop transmission function goes here

  // play audio function

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
                setIsTransmitting(!isTransmitting);
                startTransmission();
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
