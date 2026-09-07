export type Tab = 'home' | 'records' | 'stats' | 'settings';

interface BottomNavProps {
  active: Tab;
  onChange: (tab: Tab) => void;
}

const ITEMS: { key: Tab; label: string; icon: string }[] = [
  { key: 'home', label: '홈', icon: '🏠' },
  { key: 'records', label: '라운드', icon: '🚩' },
  { key: 'stats', label: '분석', icon: '📊' },
  { key: 'settings', label: '설정', icon: '⚙️' },
];

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="bottom-glass-nav select-none">
      {ITEMS.map((item) => {
        const isActive = active === item.key;
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onChange(item.key)}
            className={`flex flex-col items-center justify-center gap-1 flex-1 py-1.5 rounded-2xl transition-all ${
              isActive
                ? 'text-emerald-800 font-black scale-105'
                : 'text-gray-400 font-medium hover:text-gray-600'
            }`}
          >
            <span className="text-xl leading-none">{item.icon}</span>
            <span className={`text-[10px] ${isActive ? 'font-black text-emerald-800' : 'font-bold'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
