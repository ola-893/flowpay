import { useState, useMemo } from 'react';
import { Clock, Calendar, CalendarDays, Settings, Hexagon, Coins, Search, Rocket } from 'lucide-react';

// Duration presets in seconds
const DURATION_PRESETS = [
  { label: '1 Hour', value: 3600, Icon: Clock },
  { label: '24 Hours', value: 86400, Icon: Calendar },
  { label: '7 Days', value: 604800, Icon: CalendarDays },
  { label: 'Custom', value: null, Icon: Settings },
];

// Token options
const TOKENS = [
  { symbol: 'MNEE', name: 'MNEE Token', Icon: Coins, balance: '500.00' },
];

// Progress Step Component
const ProgressStep = ({ step, currentStep, label }) => {
  const isActive = currentStep === step;
  const isCompleted = currentStep > step;

  return (
    <div className="flex items-center gap-2">
      <div className={`
        w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
        ${isCompleted ? 'bg-success-500 text-white' :
          isActive ? 'bg-flowpay-500 text-white shadow-glow-sm' :
            'bg-white/10 text-white/40'}
      `}>
        {isCompleted ? '✓' : step}
      </div>
      <span className={`text-sm hidden sm:inline ${isActive ? 'text-white font-medium' : 'text-white/50'}`}>
        {label}
      </span>
    </div>
  );
};

// Recipient Input with validation
const RecipientInput = ({ value, onChange, isValid }) => {
  const isEthAddress = /^0x[a-fA-F0-9]{40}$/.test(value);
  const showValidation = value.length > 0;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-white/80">Recipient Address</label>
      <div className="relative">
        <input
          type="text"
          className={`
            input-default pr-12
            ${showValidation && isEthAddress ? 'border-success-500/50 focus:border-success-500' : ''}
            ${showValidation && !isEthAddress ? 'border-error-500/50 focus:border-error-500' : ''}
          `}
          placeholder="0x... or ENS name"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {showValidation && isEthAddress && (
            <span className="text-success-400">✓</span>
          )}
          {showValidation && !isEthAddress && value.length > 2 && (
            <span className="text-error-400">✗</span>
          )}
        </div>
      </div>
      {value.endsWith('.eth') && (
        <div className="text-xs text-accent-400 flex items-center gap-1">
          <Search className="w-3 h-3 animate-pulse" /> Resolving ENS...
        </div>
      )}
    </div>
  );
};

// Token Selector
const TokenSelector = ({ selected, onSelect }) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-white/80">Select Token</label>
    <div className="grid grid-cols-2 gap-3">
      {TOKENS.map(token => {
        const TokenIcon = token.Icon;
        return (
          <button
            key={token.symbol}
            type="button"
            onClick={() => onSelect(token)}
            className={`
              p-4 rounded-xl border transition-all text-left
              ${selected?.symbol === token.symbol
                ? 'border-flowpay-500 bg-flowpay-500/10 shadow-border-glow'
                : 'border-white/10 bg-white/5 hover:bg-white/10'}
            `}
          >
            <div className="flex items-center gap-2">
              <TokenIcon className="w-6 h-6 text-white/80" />
              <div>
                <div className="font-semibold text-white">{token.symbol}</div>
                <div className="text-xs text-white/50">{token.name}</div>
              </div>
            </div>
            <div className="mt-2 text-xs text-white/60">
              Balance: <span className="font-mono text-white/80">{token.balance}</span>
            </div>
          </button>
        );
      })}
    </div>
  </div>
);

// Duration Selector
const DurationSelector = ({ selected, onSelect, customValue, onCustomChange }) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-white/80">Stream Duration</label>
    <div className="grid grid-cols-4 gap-2">
      {DURATION_PRESETS.map(preset => {
        const PresetIcon = preset.Icon;
        return (
          <button
            key={preset.label}
            type="button"
            onClick={() => onSelect(preset)}
            className={`
              p-3 rounded-lg border text-center transition-all
              ${selected?.label === preset.label
                ? 'border-flowpay-500 bg-flowpay-500/10'
                : 'border-white/10 bg-white/5 hover:bg-white/10'}
            `}
          >
            <div className="flex justify-center">
              <PresetIcon className="w-5 h-5 text-white/70" />
            </div>
            <div className="text-xs text-white/70 mt-1">{preset.label}</div>
          </button>
        );
      })}
    </div>
    {selected?.value === null && (
      <input
        type="number"
        className="input-default mt-3"
        placeholder="Duration in seconds"
        value={customValue}
        onChange={(e) => onCustomChange(e.target.value)}
        min={60}
      />
    )}
  </div>
);

// Rate Calculator
const RateCalculator = ({ amount, duration, token }) => {
  const durationSec = duration?.value || parseInt(duration) || 0;
  const amountNum = parseFloat(amount) || 0;

  const rate = durationSec > 0 ? amountNum / durationSec : 0;
  const ratePerHour = rate * 3600;
  const ratePerDay = rate * 86400;

  if (!amountNum || !durationSec) return null;

  return (
    <div className="p-4 rounded-xl glass-primary space-y-3">
      <div className="text-sm font-medium text-white/80">Cost Preview</div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-white/50">Flow Rate</div>
          <div className="font-mono font-semibold text-flowpay-300">
            {rate.toFixed(8)} {token?.symbol || 'MNEE'}/sec
          </div>
        </div>
        <div>
          <div className="text-white/50">Per Hour</div>
          <div className="font-mono font-semibold text-white">
            {ratePerHour.toFixed(6)} {token?.symbol || 'MNEE'}
          </div>
        </div>
        <div>
          <div className="text-white/50">Per Day</div>
          <div className="font-mono font-semibold text-white">
            {ratePerDay.toFixed(4)} {token?.symbol || 'MNEE'}
          </div>
        </div>
        <div>
          <div className="text-white/50">Est. Gas</div>
          <div className="font-mono font-semibold text-warning-400">
            ~0.002 ETH
          </div>
        </div>
      </div>
    </div>
  );
};

export default function CreateStreamForm({
  recipient,
  setRecipient,
  amountEth,
  setAmountEth,
  durationSeconds,
  setDurationSeconds,
  onSubmit,
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedToken, setSelectedToken] = useState(TOKENS[0]);
  const [selectedDuration, setSelectedDuration] = useState(DURATION_PRESETS[1]);
  const [customDuration, setCustomDuration] = useState('');

  const isRecipientValid = /^0x[a-fA-F0-9]{40}$/.test(recipient);

  const effectiveDuration = selectedDuration?.value || parseInt(customDuration) || 0;

  // Sync with parent state
  const handleDurationChange = (preset) => {
    setSelectedDuration(preset);
    if (preset.value) {
      setDurationSeconds(preset.value.toString());
    }
  };

  const handleCustomDurationChange = (value) => {
    setCustomDuration(value);
    setDurationSeconds(value);
  };

  const canProceed = {
    1: isRecipientValid,
    2: selectedToken && parseFloat(amountEth) > 0,
    3: effectiveDuration > 0,
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      onSubmit(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-between">
        <ProgressStep step={1} currentStep={currentStep} label="Recipient" />
        <div className="flex-1 h-px bg-white/10 mx-2" />
        <ProgressStep step={2} currentStep={currentStep} label="Amount" />
        <div className="flex-1 h-px bg-white/10 mx-2" />
        <ProgressStep step={3} currentStep={currentStep} label="Duration" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Recipient */}
        {currentStep === 1 && (
          <div className="animate-fade-in space-y-4">
            <RecipientInput
              value={recipient}
              onChange={setRecipient}
              isValid={isRecipientValid}
            />
          </div>
        )}

        {/* Step 2: Token & Amount */}
        {currentStep === 2 && (
          <div className="animate-fade-in space-y-4">
            <TokenSelector selected={selectedToken} onSelect={setSelectedToken} />

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Amount</label>
              <div className="relative">
                <input
                  type="number"
                  className="input-default pr-16"
                  placeholder="0.00"
                  value={amountEth}
                  onChange={(e) => setAmountEth(e.target.value)}
                  step="0.001"
                  min="0"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-white/50">
                  {selectedToken?.symbol}
                </div>
              </div>
              <div className="flex justify-between text-xs text-white/50">
                <span>Balance: {selectedToken?.balance} {selectedToken?.symbol}</span>
                <button
                  type="button"
                  className="text-flowpay-400 hover:text-flowpay-300"
                  onClick={() => setAmountEth(selectedToken?.balance || '0')}
                >
                  Max
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Duration & Confirm */}
        {currentStep === 3 && (
          <div className="animate-fade-in space-y-4">
            <DurationSelector
              selected={selectedDuration}
              onSelect={handleDurationChange}
              customValue={customDuration}
              onCustomChange={handleCustomDurationChange}
            />

            <RateCalculator
              amount={amountEth}
              duration={selectedDuration?.value || customDuration}
              token={selectedToken}
            />

            {/* Summary */}
            <div className="p-4 rounded-xl glass space-y-2">
              <div className="text-sm font-medium text-white/80">Stream Summary</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-white/50">To:</div>
                <div className="font-mono text-white/80 truncate">{recipient}</div>
                <div className="text-white/50">Amount:</div>
                <div className="font-mono text-white/80">{amountEth} {selectedToken?.symbol}</div>
                <div className="text-white/50">Duration:</div>
                <div className="font-mono text-white/80">{selectedDuration?.label || 'Custom'}</div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3">
          {currentStep > 1 && (
            <button
              type="button"
              className="btn-outline flex-1"
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              ← Back
            </button>
          )}
          <button
            type="submit"
            className={`flex-1 ${currentStep === 3 ? 'btn-primary' : 'btn-default'}`}
            disabled={!canProceed[currentStep]}
          >
            {currentStep === 3 ? <><Rocket className="w-4 h-4" /> Start Stream</> : 'Continue →'}
          </button>
        </div>
      </form>
    </div>
  );
}
