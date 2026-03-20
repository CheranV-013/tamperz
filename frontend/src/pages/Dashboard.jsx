import { useEffect, useMemo, useState } from "react";

import Navbar from "../components/Navbar.jsx";
import SOCHeader from "../components/SOCHeader.jsx";
import ContainerStatus from "../components/ContainerStatus.jsx";
import AlertPanel from "../components/AlertPanel.jsx";
import SensorCharts from "../components/SensorCharts.jsx";

import apiClient from "../api/apiClient.js";
import socket from "../api/socketClient.js";

// ✅ time formatter
const formatTime = (iso) => {
  if (!iso) return "--";
  const date = new Date(iso);
  return date.toLocaleTimeString();
};

const Dashboard = () => {
  const [alerts, setAlerts] = useState([]);
  const [sensorData, setSensorData] = useState([]);
  const [connected, setConnected] = useState(false);

  // ✅ Load alerts initially
  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const res = await apiClient.get("/api/alerts");
        setAlerts(res.data.alerts || []);
      } catch (err) {
        console.error("❌ Failed to fetch alerts", err);
      }
    };

    loadAlerts();
  }, []);

  // ✅ SOCKET HANDLING (FINAL CLEAN VERSION)
  useEffect(() => {
    if (!socket) return;

    console.log("🔌 Initializing socket listeners...");

    const handleConnect = () => {
      console.log("✅ SOCKET CONNECTED:", socket.id);
      setConnected(true);
    };

    const handleDisconnect = () => {
      console.log("❌ SOCKET DISCONNECTED");
      setConnected(false);
    };

    const handleSensorData = (payload) => {
      console.log("🔥 DATA RECEIVED:", payload);

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

    const handleAlert = (alert) => {
      console.log("🚨 ALERT RECEIVED:", alert);
      setAlerts((prev) => [alert, ...prev].slice(0, 50));
    };

    // attach listeners
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("sensor_data", handleSensorData);
    socket.on("tamper_alert", handleAlert);

    // debug all events
    socket.onAny((event, data) => {
      console.log("📡 EVENT:", event, data);
    });

    // cleanup
    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("sensor_data", handleSensorData);
      socket.off("tamper_alert", handleAlert);
      socket.offAny();
    };
  }, []);

  // ✅ container cards
  const containerCards = useMemo(() => {
    const ids = ["C101", "C102", "C103"];

    return ids.map((id) => {
      const latest = [...sensorData]
        .reverse()
        .find((item) => item.container_id === id);

      return {
        id,
        status:
          alerts.length > 0 && id === "C101" ? "critical" : "normal",
        lastUpdate: latest ? latest.timestamp : "--",
        temperature: latest
          ? Number(latest.temperature).toFixed(1)
          : "--",
        humidity: latest
          ? Math.round(latest.humidity)
          : "--",
        vibration: latest
          ? Number(latest.vibration).toFixed(2)
          : "--",
        battery: latest?.battery_voltage
          ? Number(latest.battery_voltage).toFixed(2)
          : "--",
      };
    });
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