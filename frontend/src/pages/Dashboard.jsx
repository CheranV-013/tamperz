import { useEffect, useMemo, useState } from "react";

import Navbar from "../components/Navbar.jsx";
import SOCHeader from "../components/SOCHeader.jsx";
import ContainerStatus from "../components/ContainerStatus.jsx";
import SensorCharts from "../components/SensorCharts.jsx";

import socket from "../api/socketClient.js";
import { API_BASE_URL } from "../api/apiClient.js";

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
  const [sensorData, setSensorData] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [connected, setConnected] = useState(false);
  const [tracking, setTracking] = useState(false);

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

    const handleVisitor = (data) => {
      setVisitors((prev) => [data, ...prev].slice(0, 50));
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("sensor_data", handleSensorData);
    socket.on("visitor_update", handleVisitor);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("sensor_data", handleSensorData);
      socket.off("visitor_update", handleVisitor);
    };
  }, []);

  const triggerTracking = async () => {
    try {
      setTracking(true);
      const gpsParams = await new Promise((resolve) => {
        if (!navigator.geolocation) return resolve("");
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude, accuracy } = pos.coords;
            resolve(`?lat=${latitude}&lon=${longitude}&accuracy=${accuracy}`);
          },
          () => resolve(""),
          { enableHighAccuracy: true, timeout: 5000 }
        );
      });

      await fetch(`${API_BASE_URL}/track${gpsParams}`, { method: "GET" });
    } catch (err) {
      console.error("Tracking failed", err);
    } finally {
      setTracking(false);
    }
  };

  useEffect(() => {
    triggerTracking();
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
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-card">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Live Visitors</h2>
                <button
                  onClick={triggerTracking}
                  disabled={tracking}
                  className="text-xs px-3 py-1 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                >
                  {tracking ? "Tracking..." : "Start Tracking"}
                </button>
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
                      {[
                        visitor?.location?.city,
                        visitor?.location?.country,
                      ]
                        .filter(Boolean)
                        .join(", ") || "Unknown location"}
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
  );
};

export default Dashboard;
