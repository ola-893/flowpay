import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const defaultTabs = [
  { id: 'dashboard', path: '/', icon: '📊', label: 'Dashboard' },
  { id: 'streams', path: '/streams', icon: '💸', label: 'Streams' },
  { id: 'agent', path: '/agent', icon: '🤖', label: 'Agent' },
  { id: 'docs', path: '/docs', icon: '📚', label: 'Docs' },
];

// Bottom Navigation for Mobile
export function MobileBottomNav({ walletAddress, tabs = defaultTabs }) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const location = useLocation();
  const activeTab = tabs.find(t => t.path === location.pathname)?.id || 'dashboard';

  // Hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsVisible(currentScrollY < lastScrollY || currentScrollY < 50);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <nav
      className={`
        md:hidden fixed bottom-0 left-0 right-0 z-50
        glass-darker border-t border-white/10
        transition-transform duration-300 safe-area-bottom
        ${isVisible ? 'translate-y-0' : 'translate-y-full'}
      `}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            to={tab.path}
            className={`
              flex flex-col items-center justify-center
              min-w-[64px] py-2 px-3 rounded-xl
              transition-all duration-200 touch-manipulation
              ${activeTab === tab.id
                ? 'bg-flowpay-500/20 text-flowpay-300'
                : 'text-white/50 active:bg-white/10'
              }
            `}
          >
            <span className="text-xl mb-0.5">{tab.icon}</span>
            <span className="text-[10px] font-medium">{tab.label}</span>
            {activeTab === tab.id && (
              <div className="absolute bottom-1 w-1 h-1 rounded-full bg-flowpay-400" />
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
}

// Collapsible Section Component
export function CollapsibleSection({ title, icon, children, defaultOpen = true, className = '' }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`card-glass overflow-hidden ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 md:p-6 touch-manipulation"
      >
        <div className="flex items-center gap-2">
          {icon && <span className="text-lg">{icon}</span>}
          <h3 className="text-base md:text-lg font-semibold text-white">{title}</h3>
        </div>
        <svg
          className={`w-5 h-5 text-white/50 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      <div
        className={`
          transition-all duration-300 ease-in-out overflow-hidden
          ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <div className="px-4 pb-4 md:px-6 md:pb-6">
          {children}
        </div>
      </div>
    </div>
  );
}

// Touch-friendly Button
export function TouchButton({ children, onClick, variant = 'default', size = 'md', className = '', disabled = false, ...props }) {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    default: 'btn-default',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
    success: 'btn-success',
    danger: 'btn-danger',
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm min-h-[36px]',
    md: 'px-4 py-2.5 text-base min-h-[44px]',
    lg: 'px-6 py-3 text-lg min-h-[52px]',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variants[variant]}
        ${sizes[size]}
        touch-manipulation
        active:scale-[0.98]
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}

// Touch-friendly Input
export function TouchInput({ label, error, className = '', ...props }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-sm text-white/70">{label}</label>
      )}
      <input
        className={`
          input-default
          min-h-[44px] text-base
          touch-manipulation
          ${error ? 'border-error-500 focus:border-error-500 focus:ring-error-500/20' : ''}
        `}
        {...props}
      />
      {error && (
        <p className="text-xs text-error-400">{error}</p>
      )}
    </div>
  );
}

// Responsive Grid
export function ResponsiveGrid({ children, cols = { default: 1, sm: 2, lg: 3 }, gap = 4, className = '' }) {
  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  };

  return (
    <div
      className={`
        grid gap-${gap}
        ${colClasses[cols.default] || 'grid-cols-1'}
        ${cols.sm ? `sm:${colClasses[cols.sm]}` : ''}
        ${cols.md ? `md:${colClasses[cols.md]}` : ''}
        ${cols.lg ? `lg:${colClasses[cols.lg]}` : ''}
        ${cols.xl ? `xl:${colClasses[cols.xl]}` : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// Pull to Refresh Indicator (visual only)
export function PullToRefreshIndicator({ isRefreshing }) {
  if (!isRefreshing) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-slide-down">
      <div className="flex items-center gap-2 px-4 py-2 rounded-full glass">
        <svg className="w-4 h-4 animate-spin text-flowpay-400" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
        <span className="text-sm text-white/70">Refreshing...</span>
      </div>
    </div>
  );
}
