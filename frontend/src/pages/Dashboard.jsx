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

const shortenBrowser = (ua = "") => {
  if (!ua) return "Unknown";
  const short = ua.split("(")[0].trim();
  return short.length > 28 ? `${short.slice(0, 28)}…` : short;
};

const Dashboard = () => {
  const [alerts, setAlerts] = useState([]);
  const [sensorData, setSensorData] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [connected, setConnected] = useState(false);

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

  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      setConnected(true);
    };

    const handleDisconnect = () => {
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
      setAlerts((prev) => [alert, ...prev].slice(0, 50));
    };

    const handleVisitor = (data) => {
      console.log("👀 VISITOR RECEIVED:", data);  
      setVisitors((prev) => [data, ...prev].slice(0, 50));
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("sensor_data", handleSensorData);
    socket.on("tamper_alert", handleAlert);
    socket.on("visitor_update", handleVisitor);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("sensor_data", handleSensorData);
      socket.off("tamper_alert", handleAlert);
      socket.off("visitor_update", handleVisitor);
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
        status: alerts.length > 0 && id === "C101" ? "critical" : "normal",
        lastUpdate: latest ? latest.timestamp : "--",
        temperature: latest ? Number(latest.temperature).toFixed(1) : "--",
        humidity: latest ? Math.round(latest.humidity) : "--",
        vibration: latest ? Number(latest.vibration).toFixed(2) : "--",
        battery: latest?.battery_voltage
          ? Number(latest.battery_voltage).toFixed(2)
          : "--",
      };
    });
  }, [sensorData, alerts]);

  const visitorList = useMemo(() => visitors.slice(0, 10), [visitors]);

  return (
    <div className="min-h-screen bg-slate-50 px-6 pb-10">
      <div className="max-w-6xl mx-auto">
        <Navbar />

        <div className="space-y-6">
          <SOCHeader connected={connected} />

          <ContainerStatus containers={containerCards} />

          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
            <SensorCharts data={sensorData} />
            <div className="space-y-6">
              <AlertPanel alerts={alerts} />
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-card">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900">Live Visitors</h2>
                  <span className="text-xs text-slate-400">Latest 10</span>
                </div>
                <div className="mt-4 space-y-3 max-h-[260px] overflow-auto">
                  {visitorList.length === 0 && (
                    <div className="text-sm text-slate-500">No visitors tracked yet.</div>
                  )}
                  {visitorList.map((visitor, index) => (
                    <div
                      key={`${visitor.ip}-${visitor.timestamp}-${index}`}
                      className="border border-slate-100 rounded-xl p-3"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-900">{visitor.ip}</p>
                        <span className="text-xs text-slate-400">{visitor.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {visitor?.location?.country || "Unknown location"}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {shortenBrowser(visitor.browser)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
