import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import SOCHeader from "../components/SOCHeader.jsx";
import ContainerStatus from "../components/ContainerStatus.jsx";
import AlertPanel from "../components/AlertPanel.jsx";
import SensorCharts from "../components/SensorCharts.jsx";
import apiClient from "../api/apiClient.js";
import socket from "../api/socketClient.js";

const formatTime = (iso) => {
  if (!iso) return "--";
  const date = new Date(iso);
  return date.toLocaleTimeString();
};

const Dashboard = () => {
  const [alerts, setAlerts] = useState([]);
  const [sensorData, setSensorData] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const response = await apiClient.get("/api/alerts");
        const items = response.data.alerts || [];
        setAlerts(items);
      } catch (error) {
        console.error("Failed to fetch alerts", error);
      }
    };

    loadAlerts();
  }, []);

  useEffect(() => {
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("tamper_alert", (alert) => {
      setAlerts((prev) => [alert, ...prev].slice(0, 50));
    });

    socket.on("sensor_update", (payload) => {
      setSensorData((prev) => {
        const anomalyFlag =
          payload.door_status === 1 ||
          payload.vibration > 0.6 ||
          payload.gps_shift > 0.6 ||
          payload.battery_voltage < 3.2 ||
          payload.temperature > 40 ||
          payload.temperature < 10;
        const next = [
          ...prev,
          {
            timestamp: formatTime(payload.timestamp),
            temperature: payload.temperature,
            humidity: payload.humidity,
            vibration: payload.vibration,
            anomaly: anomalyFlag ? payload.vibration : null,
          },
        ];
        return next.slice(-30);
      });
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("tamper_alert");
      socket.off("sensor_update");
    };
  }, []);

  const containerCards = useMemo(() => {
    const latest = sensorData[sensorData.length - 1];
    const base = ["C101", "C102", "C103"].map((id) => ({
      id,
      status: "normal",
      lastUpdate: latest ? latest.timestamp : "--",
      temperature: latest ? latest.temperature.toFixed(1) : "--",
      humidity: latest ? Math.round(latest.humidity) : "--",
      vibration: latest ? latest.vibration.toFixed(2) : "--",
      battery: latest ? "3.9" : "--",
    }));

    if (alerts.length > 0) {
      base[0] = {
        ...base[0],
        status: "critical",
      };
    }

    return base;
  }, [sensorData, alerts]);

  return (
    <div className="min-h-screen bg-slate-50 px-6 pb-10">
      <div className="max-w-6xl mx-auto">
        <Navbar />
        <div className="space-y-6">
          <SOCHeader connected={connected} />
          <ContainerStatus containers={containerCards} />

          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
            <SensorCharts data={sensorData} />
            <AlertPanel alerts={alerts} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
