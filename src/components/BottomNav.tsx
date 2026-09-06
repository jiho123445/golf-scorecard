export type Tab = 'home' | 'records';

interface BottomNavProps {
  active: Tab;
  onChange: (tab: Tab) => void;
}

const ITEMS: { key: Tab; label: string; icon: string }[] = [
  { key: 'home', label: '홈', icon: '🏠' },
  { key: 'records', label: '기록', icon: '📋' },
];

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="sticky bottom-0 z-10 flex border-t border-gray-100 bg-white/95 backdrop-blur">
      {ITEMS.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => onChange(item.key)}
          className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium ${
            active === item.key ? 'text-brand' : 'text-gray-400'
          }`}
          style={{ minHeight: 48 }}
        >
          <span className="text-xl leading-none">{item.icon}</span>
          {item.label}
        </button>
      ))}
    </nav>
  );
}
