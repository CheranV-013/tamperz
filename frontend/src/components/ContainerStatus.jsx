const statusPalette = {
  normal: "bg-emerald-50 text-emerald-700 border-emerald-100",
  warning: "bg-amber-50 text-amber-700 border-amber-100",
  critical: "bg-rose-50 text-rose-700 border-rose-100",
};

const ContainerStatus = ({ containers }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {containers.map((container) => (
        <div
          key={container.id}
          className="bg-white rounded-2xl p-5 border border-slate-100 shadow-card"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Container</p>
            <span
              className={`px-3 py-1 rounded-full text-xs border ${
                statusPalette[container.status]
              }`}
            >
              {container.status.toUpperCase()}
            </span>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mt-2">{container.id}</h3>
          <p className="text-sm text-slate-500 mt-1">Last update: {container.lastUpdate}</p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-slate-400">Temp</p>
              <p className="font-semibold text-slate-900">{container.temperature}°C</p>
            </div>
            <div>
              <p className="text-slate-400">Humidity</p>
              <p className="font-semibold text-slate-900">{container.humidity}%</p>
            </div>
            <div>
              <p className="text-slate-400">Vibration</p>
              <p className="font-semibold text-slate-900">{container.vibration}</p>
            </div>
            <div>
              <p className="text-slate-400">Battery</p>
              <p className="font-semibold text-slate-900">{container.battery}V</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContainerStatus;
