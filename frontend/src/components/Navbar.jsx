const Navbar = () => {
  return (
    <nav className="flex items-center justify-between py-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-semibold">
          AI
        </div>
        <div>
          <p className="text-sm text-slate-500">Container Security</p>
          <p className="text-lg font-semibold text-slate-900">Tamper Detection SOC</p>
        </div>
      </div>
      <div className="text-sm text-slate-500">Monitoring Region: Global</div>
    </nav>
  );
};

export default Navbar;
