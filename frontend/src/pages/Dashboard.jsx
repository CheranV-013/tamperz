import { useEffect, useMemo, useState } from "react";

import Navbar from "../components/Navbar.jsx";
import SOCHeader from "../components/SOCHeader.jsx";
import ContainerStatus from "../components/ContainerStatus.jsx";
import SensorCharts from "../components/SensorCharts.jsx";

import socket from "../api/socketClient.js";

const formatTime = (iso) => {
  if (!iso) return "--";
  const date = new Date(iso);
  return date.toLocaleTimeString();
};

const Dashboard = () => {
  const [sensorData, setSensorData] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);

    const handleSensorData = (payload) => {
      setSensorData((prev) => {
        const next = [
          ...prev,
          {
            container_id: payload.container_id,
            timestamp: formatTime(payload.timestamp),
            temperature: payload.temperature,
            humidity: payload.humidity,
            vibration: payload.vibration,
            battery_voltage: payload.battery_voltage,
          },
        ];
        return next.slice(-50);
      });
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("sensor_data", handleSensorData);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("sensor_data", handleSensorData);
    };
  }, []);

  const containerCards = useMemo(() => {
    const ids = ["C101", "C102", "C103"];

    return ids.map((id) => {
      const latest = [...sensorData]
        .reverse()
        .find((item) => item.container_id === id);

      return {
        id,
        status: "normal",
        lastUpdate: latest ? latest.timestamp : "--",
        temperature: latest ? Number(latest.temperature).toFixed(1) : "--",
        humidity: latest ? Math.round(latest.humidity) : "--",
        vibration: latest ? Number(latest.vibration).toFixed(2) : "--",
        battery: latest?.battery_voltage
          ? Number(latest.battery_voltage).toFixed(2)
          : "--",
      };
    });
  }, [sensorData]);

  return (
    <div className="min-h-screen bg-slate-50 px-6 pb-10">
      <div className="max-w-6xl mx-auto">
        <Navbar />

        <div className="space-y-6">
          <SOCHeader connected={connected} />
          <ContainerStatus containers={containerCards} />

          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
            <SensorCharts data={sensorData} />
            <div />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
