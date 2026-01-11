import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ArrowRightLeft, 
  Bot, 
  BookOpen, 
  Link as LinkIcon,
  Hexagon,
  Wrench,
  Lock,
  Download,
  LogOut
} from 'lucide-react';

// Chain icons using Lucide
const ChainIcon = ({ chainId }) => {
  const isEthereum = chainId === 11155111 || chainId === 1;
  return isEthereum 
    ? <Hexagon className="w-4 h-4 text-white/70" />
    : <LinkIcon className="w-4 h-4 text-white/70" />;
};

// Animated FlowPay Logo with streaming effect
const AnimatedLogo = () => (
  <div className="relative h-10 w-10 rounded-xl bg-gradient-to-tr from-flowpay-500 to-accent-500 shadow-glow flex items-center justify-center overflow-hidden group">
    {/* Flowing stream animation */}
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
    <span className="relative z-10 text-white font-bold text-lg">F</span>
    {/* Glow pulse on hover */}
    <div className="absolute inset-0 rounded-xl bg-flowpay-400/0 group-hover:bg-flowpay-400/20 transition-all duration-300" />
  </div>
);

// Navigation Tab Component with Link
const NavTab = ({ icon: Icon, label, active, to }) => (
  <Link
    to={to}
    className={`
      px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
      flex items-center gap-2
      ${active
        ? 'bg-flowpay-500/20 text-flowpay-300 border border-flowpay-500/30'
        : 'text-white/60 hover:text-white hover:bg-white/5'
      }
    `}
  >
    <Icon className="w-5 h-5" />
    <span className="hidden sm:inline">{label}</span>
    {active && <div className="w-1.5 h-1.5 rounded-full bg-flowpay-400 animate-pulse" />}
  </Link>
);

// Notification Bell Component
const NotificationBell = ({ count = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all duration-200"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-error-500 text-[10px] font-bold flex items-center justify-center animate-pulse">
            {count}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 glass rounded-xl p-4 shadow-glass animate-fade-in z-50">
          <h4 className="text-sm font-semibold text-white mb-3">Notifications</h4>
          <div className="space-y-2 text-sm text-white/70">
            <div className="flex items-start gap-2 p-2 rounded-lg hover:bg-white/5">
              <span className="text-success-400">●</span>
              <span>Stream #42 created successfully</span>
            </div>
            <div className="flex items-start gap-2 p-2 rounded-lg hover:bg-white/5">
              <span className="text-warning-400">●</span>
              <span>Low balance warning on Stream #38</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Settings Dropdown Component
const SettingsDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all duration-200"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 glass rounded-xl overflow-hidden shadow-glass animate-fade-in z-50">
          <button className="w-full px-4 py-2.5 text-left text-sm text-white/80 hover:bg-white/10 flex items-center gap-2">
            <Wrench className="w-4 h-4" /> Preferences
          </button>
          <button className="w-full px-4 py-2.5 text-left text-sm text-white/80 hover:bg-white/10 flex items-center gap-2">
            <Lock className="w-4 h-4" /> Security
          </button>
          <button className="w-full px-4 py-2.5 text-left text-sm text-white/80 hover:bg-white/10 flex items-center gap-2">
            <Download className="w-4 h-4" /> Export Data
          </button>
          <div className="border-t border-white/10" />
          <button className="w-full px-4 py-2.5 text-left text-sm text-error-400 hover:bg-error-500/10 flex items-center gap-2">
            <LogOut className="w-4 h-4" /> Disconnect
          </button>
        </div>
      )}
    </div>
  );
};

// Mobile Menu Component
const MobileMenu = ({ isOpen, activeTab, tabs }) => {
  if (!isOpen) return null;

  return (
    <div className="md:hidden absolute top-full left-0 right-0 mt-2 mx-4 glass rounded-xl p-4 animate-slide-down z-50">
      <nav className="flex flex-col gap-2">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.id}
              to={tab.path}
              className={`
                w-full px-4 py-3 rounded-lg text-left text-sm font-medium transition-all
                flex items-center gap-3
                ${activeTab === tab.id
                  ? 'bg-flowpay-500/20 text-flowpay-300'
                  : 'text-white/60 hover:bg-white/5'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

const defaultTabs = [
  { id: 'dashboard', path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'streams', path: '/streams', icon: ArrowRightLeft, label: 'Streams' },
  { id: 'agent', path: '/agent', icon: Bot, label: 'Agent Console' },
  { id: 'docs', path: '/docs', icon: BookOpen, label: 'Docs' },
];

export default function Header({
  walletAddress,
  chainId,
  networkName,
  onConnect,
  balance,
  tabs = defaultTabs
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const activeTab = tabs.find(t => t.path === location.pathname)?.id || 'dashboard';

  const formatBalance = (bal) => {
    if (!bal) return '0.00';
    const num = parseFloat(bal);
    return num.toFixed(4);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 glass-darker">
      <div className="mx-auto max-w-7xl px-4">
        {/* Main Header Row */}
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <AnimatedLogo />
            <div className="hidden sm:block">
              <h1 className="text-xl font-black tracking-tight">
                <span className="text-gradient-primary">FlowPay</span>
              </h1>
              <p className="text-[10px] text-white/50 -mt-0.5">x402 Streaming Payments</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {tabs.map(tab => (
              <NavTab
                key={tab.id}
                icon={tab.icon}
                label={tab.label}
                active={activeTab === tab.id}
                to={tab.path}
              />
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {walletAddress ? (
              <>
                {/* Network Indicator */}
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                  <ChainIcon chainId={chainId} />
                  <span className="text-xs font-medium text-white/70">{networkName || 'Unknown'}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse" />
                </div>

                {/* Balance Display */}
                <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg glass-primary">
                  <span className="text-xs text-white/60">Balance:</span>
                  <span className="text-sm font-mono font-semibold text-flowpay-300">
                    {formatBalance(balance)} MNEE
                  </span>
                </div>

                {/* Wallet Address */}
                <div className="px-3 py-1.5 rounded-lg bg-surface-700 border border-white/10 hover:border-white/20 transition-colors cursor-pointer">
                  <span className="text-xs font-mono text-white/80">
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </span>
                </div>

                {/* Notification Bell */}
                <NotificationBell count={2} />

                {/* Settings */}
                <SettingsDropdown />
              </>
            ) : (
              <button
                className="btn-primary"
                onClick={onConnect}
              >
                Connect Wallet
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <MobileMenu
          isOpen={mobileMenuOpen}
          activeTab={activeTab}
          tabs={tabs}
        />
      </div>
    </header>
  );
}
