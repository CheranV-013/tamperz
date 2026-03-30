import { useEffect, useMemo, useRef, useState } from "react";
import ContainerMap from "../components/ContainerMap.jsx";
import socket from "../api/socketClient.js";
import { API_BASE_URL } from "../api/apiClient.js";

const shortenBrowser = (ua = "") => {
  if (!ua) return "Unknown";
  const short = ua.split("(")[0].trim();
  return short.length > 28 ? `${short.slice(0, 28)}…` : short;
};

const Tracking = () => {
  const [visitors, setVisitors] = useState([]);
  const [gpsPosition, setGpsPosition] = useState(null);
  const [gpsStreaming, setGpsStreaming] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [tracking, setTracking] = useState(false);
  const gpsWatchIdRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    const handleGpsUpdate = (payload) => {
      if (payload?.gps_lat && payload?.gps_lon) {
        setGpsPosition({ lat: payload.gps_lat, lon: payload.gps_lon });
      }
    };

    const handleVisitor = (data) => {
      setVisitors((prev) => [data, ...prev].slice(0, 50));
    };

    socket.on("gps_update", handleGpsUpdate);
    socket.on("visitor_update", handleVisitor);

    return () => {
      socket.off("gps_update", handleGpsUpdate);
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

  const startGpsStream = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported in this browser.");
      return;
    }
    if (gpsStreaming) return;

    setGpsStreaming(true);
    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        if (accuracy && accuracy > 50) {
          return;
        }
        setGpsPosition({ lat: latitude, lon: longitude });
        await fetch(`${API_BASE_URL}/api/container-location`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            container_id: "C101",
            gps_lat: latitude,
            gps_lon: longitude,
            accuracy,
          }),
        });
      },
      () => {
        setGpsStreaming(false);
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );

    gpsWatchIdRef.current = watchId;
  };

  const stopGpsStream = () => {
    if (gpsWatchIdRef.current !== null) {
      navigator.geolocation.clearWatch(gpsWatchIdRef.current);
      gpsWatchIdRef.current = null;
    }
    setGpsStreaming(false);
  };

  const visitorList = useMemo(() => visitors.slice(0, 12), [visitors]);

  return (
    <div className="space-y-6">
      <div className="panel p-6 hover-float">
        <div className="panel-header">
          <div>
            <h2 className="section-title">Live Container Location</h2>
            <p className="text-xs text-slate-400">C101 GPS feed</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={startGpsStream}
              disabled={gpsStreaming}
              className="btn btn-primary"
            >
              Start Container GPS
            </button>
            <button
              onClick={stopGpsStream}
              disabled={!gpsStreaming}
              className="btn btn-ghost"
            >
              Stop GPS
            </button>
            {gpsStreaming && (
              <span className="text-xs text-emerald-600 pulse-soft">Streaming</span>
            )}
          </div>
        </div>
        <div className="mt-4">
          <ContainerMap position={gpsPosition} />
        </div>
      </div>

      <div className="panel p-6 slide-up hover-float">
        <div className="panel-header">
          <div>
            <h2 className="section-title">Live Visitors</h2>
            <p className="text-xs text-slate-400">Accurate location when GPS is shared</p>
          </div>
          <button
            onClick={triggerTracking}
            disabled={tracking}
            className="btn btn-ghost"
          >
            {tracking ? "Tracking..." : "Start Tracking"}
          </button>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {visitorList.length === 0 && (
            <div className="text-sm text-slate-500">No visitors tracked yet.</div>
          )}
          {visitorList.map((visitor, index) => {
            const locationLabel = [
              visitor?.location?.city,
              visitor?.location?.country,
            ]
              .filter(Boolean)
              .join(", ");
            const hasCoords = visitor?.location?.lat && visitor?.location?.lon;

            return (
              <div
                key={`${visitor.ip}-${visitor.timestamp}-${index}`}
                className="border border-slate-100 rounded-xl p-4 bg-white/70 hover:bg-white transition hover-float"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900">{visitor.ip}</p>
                  <span className="text-xs text-slate-400">{visitor.timestamp}</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {locationLabel || "Unknown location"}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {shortenBrowser(visitor.browser)}
                </p>
                <div className="mt-3">
                  {hasCoords ? (
                    <button
                      onClick={() => setSelectedVisitor(visitor)}
                      className="btn btn-ghost"
                    >
                      View Location
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400">GPS not shared</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedVisitor && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 fade-in">
          <div className="panel p-6 w-[92%] max-w-md slide-up">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="section-title">Visitor Location</h3>
                <p className="text-xs text-slate-400 mt-1">
                  {selectedVisitor.ip}
                </p>
              </div>
              <button
                onClick={() => setSelectedVisitor(null)}
                className="text-sm text-slate-500 hover:text-slate-700"
              >
                Close
              </button>
            </div>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <p>
                <span className="text-slate-500">Location:</span>{" "}
                {[selectedVisitor?.location?.city, selectedVisitor?.location?.country]
                  .filter(Boolean)
                  .join(", ") || "Unknown"}
              </p>
              <p>
                <span className="text-slate-500">Coordinates:</span>{" "}
                {selectedVisitor?.location?.lat}, {selectedVisitor?.location?.lon}
              </p>
              {selectedVisitor?.location?.accuracy && (
                <p>
                  <span className="text-slate-500">Accuracy:</span>{" "}
                  {Math.round(selectedVisitor.location.accuracy)} meters
                </p>
              )}
            </div>
            {selectedVisitor?.location?.lat && selectedVisitor?.location?.lon && (
              <button
                onClick={() => {
                  const { lat, lon } = selectedVisitor.location;
                  window.open(`https://maps.google.com/?q=${lat},${lon}`, "_blank");
                }}
                className="btn btn-primary w-full mt-4"
              >
                Open in Google Maps
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Tracking;
