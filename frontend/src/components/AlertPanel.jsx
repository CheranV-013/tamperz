const AlertPanel = ({ alerts }) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-card h-full">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Tamper Alerts</h2>
        <span className="text-xs text-slate-400">Live Feed</span>
      </div>
      <div className="mt-4 space-y-3 max-h-[360px] overflow-auto">
        {alerts.length === 0 && (
          <div className="text-sm text-slate-500">No alerts yet. Monitoring live data.</div>
        )}
        {alerts.map((alert, index) => (
          <div
            key={`${alert.time}-${index}`}
            className="border border-rose-100 bg-rose-50 rounded-xl p-3"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-rose-700">{alert.type}</p>
              <span className="text-xs text-rose-500">Score: {alert.score}</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Container: {alert.container_id} • Sensor: {alert.sensor}
            </p>
            <p className="text-xs text-slate-400 mt-1">{alert.time}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertPanel;
