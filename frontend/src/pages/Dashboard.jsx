import { useEffect, useMemo, useState } from "react";

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
    const latest = sensorData[sensorData.length - 1];
    const id = latest?.container_id || "C101";

    return [
      {
        id,
        status: "normal",
        lastUpdate: latest ? latest.timestamp : "--",
        temperature: latest ? Number(latest.temperature).toFixed(1) : "--",
        humidity: latest ? Math.round(latest.humidity) : "--",
        vibration: latest ? Number(latest.vibration).toFixed(2) : "--",
        battery: latest?.battery_voltage
          ? Number(latest.battery_voltage).toFixed(2)
          : "--",
      },
    ];
  }, [sensorData]);

  return (
    <div className="space-y-6 w-full">
      <SOCHeader connected={connected} />
      <ContainerStatus containers={containerCards} />
      <div className="panel p-5 hover-float">
        <SensorCharts data={sensorData} />
      </div>
    </div>
  );
};

export default Dashboard;
