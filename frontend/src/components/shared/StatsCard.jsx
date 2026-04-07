export default function StatsCard({ title, value, icon, color = 'orange', subtitle }) {
  const colors = {
    orange: 'bg-orange-100 text-orange-700 border-orange-200',
    green: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    blue: 'bg-sky-100 text-sky-700 border-sky-200',
    red: 'bg-red-100 text-red-700 border-red-200',
    purple: 'bg-teal-100 text-teal-700 border-teal-200'
  };
  return (
    <div className="card flex items-center gap-4 hover:-translate-y-0.5 hover:shadow-md transition-all">
      <div className={`w-12 h-12 rounded-lg border flex items-center justify-center text-2xl ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-slate-950">{value}</p>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>
    </div>
  );
}
