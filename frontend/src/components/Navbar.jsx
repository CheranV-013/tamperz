const Navbar = () => {
  return (
    <nav className="flex items-center justify-between py-5">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-semibold shadow-lg">
          AI
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Container Security</p>
          <p className="text-xl font-semibold text-slate-900">Tamper Detection SOC</p>
        </div>
      </div>
      <div className="chip">
        <span className="h-2 w-2 rounded-full bg-emerald-500 pulse-soft" />
        Monitoring Region: Global
      </div>
    </nav>
  );
};

export default Navbar;
