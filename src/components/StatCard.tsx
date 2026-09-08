interface StatCardProps {
  label: string;
  value: string | number;
  highlight?: boolean;
}

export function StatCard({ label, value, highlight }: StatCardProps) {
  return (
    <div
      className={`flex flex-1 flex-col items-center justify-center rounded-2xl px-2 py-4 ${
        highlight ? 'bg-brand text-white' : 'bg-gray-50 text-gray-900'
      }`}
    >
      <span className={`text-2xl font-bold tabular-nums ${highlight ? 'text-white' : 'text-gray-900'}`}>
        {value}
      </span>
      <span className={`mt-1 text-xs ${highlight ? 'text-white/80' : 'text-gray-500'}`}>{label}</span>
    </div>
  );
}
