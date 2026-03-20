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

  // attach
  socket.on("connect", handleConnect);
  socket.on("disconnect", handleDisconnect);
  socket.on("sensor_data", handleSensorData);
  socket.on("tamper_alert", handleAlert);

  // debug
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