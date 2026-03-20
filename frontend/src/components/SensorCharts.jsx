import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  ReferenceDot,
} from "recharts";

const SensorCharts = ({ data }) => {
  const chartData = useMemo(() => {
    const sliced = data.slice(-50);
    return sliced.map((item) => ({
      ...item,
      anomaly: item.vibration > 0.6 ? item.vibration : null,
    }));
  }, [data]);

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-card">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Sensor Trends</h2>
        <span className="text-xs text-slate-400">Last 50 readings</span>
      </div>
      <div className="mt-4 h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="timestamp" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="temperature" stroke="#0f172a" strokeWidth={2} />
            <Line type="monotone" dataKey="humidity" stroke="#14b8a6" strokeWidth={2} />
            <Line
              type="monotone"
              dataKey="vibration"
              stroke="#f97316"
              strokeWidth={2}
              dot={false}
            />
            {chartData
              .filter((point) => point.anomaly !== null)
              .map((point, index) => (
                <ReferenceDot
                  key={`${point.timestamp}-${index}`}
                  x={point.timestamp}
                  y={point.vibration}
                  r={5}
                  fill="#ef4444"
                  stroke="#ef4444"
                />
              ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SensorCharts;
