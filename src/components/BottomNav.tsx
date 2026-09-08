export type Tab = 'home' | 'records' | 'stats' | 'settings';
interface BottomNavProps { active: Tab; onChange: (tab: Tab) => void; }
const ITEMS: { key: Tab; label: string; icon: string }[] = [
  { key: 'home', label: '홈', icon: '🏠' }, { key: 'records', label: '라운드', icon: '⛳' },
  { key: 'stats', label: '분석', icon: '📊' }, { key: 'settings', label: '설정', icon: '⚙️' },
];
export function BottomNav({ active, onChange }: BottomNavProps) { return <nav className="sticky bottom-0 z-10 flex border-t border-gray-100 bg-white/90 px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(24,56,34,0.06)] backdrop-blur-xl">{ITEMS.map((item)=><button key={item.key} type="button" onClick={()=>onChange(item.key)} className={`relative flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium ${active===item.key?'text-brand':'text-gray-400'}`} style={{minHeight:48}}><span className="text-xl leading-none">{item.icon}</span>{item.label}</button>)}</nav>; }
