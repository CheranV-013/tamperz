const SOCHeader = ({ connected }) => {
  return (
    <div className="panel p-6 hover-float">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">SOC Dashboard</p>
          <h1 className="text-3xl font-semibold text-slate-900">
            AI IoT Container Tamper Detection
          </h1>
          <p className="text-slate-500 mt-1">
            Real-time anomaly monitoring across global shipments.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 uppercase tracking-[0.2em]">Socket</span>
          <span className={`chip ${connected ? "chip-success" : ""}`}>
            {connected ? "Connected" : "Reconnecting"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SOCHeader;
