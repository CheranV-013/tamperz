const SOCHeader = ({ connected }) => {
  return (
    <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-card border border-slate-100">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">SOC Dashboard</p>
        <h1 className="text-2xl font-semibold text-slate-900">
          AI IoT Container Tamper Detection
        </h1>
        <p className="text-slate-500 mt-1">Real-time anomaly monitoring across global shipments.</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-500">Socket Status</span>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            connected ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
          }`}
        >
          {connected ? "Connected" : "Reconnecting"}
        </span>
      </div>
    </div>
  );
};

export default SOCHeader;
