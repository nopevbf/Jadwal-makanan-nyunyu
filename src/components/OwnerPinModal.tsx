import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, Lock, X, AlertTriangle } from 'lucide-react';

interface OwnerPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onFirstFailure: () => void;
  darkMode: boolean;
}

const CORRECT_PIN = '221996';
const PIN_LENGTH = 6;

export const OwnerPinModal: React.FC<OwnerPinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onFirstFailure,
  darkMode,
}) => {
  const [pin, setPin] = useState<string[]>(Array(PIN_LENGTH).fill(''));
  const [attempts, setAttempts] = useState<number>(0);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setPin(Array(PIN_LENGTH).fill(''));
      setAttempts(0);
      setIsShaking(false);
      setErrorMessage('');
      setTimeout(() => {
        inputsRef.current[0]?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (index: number, value: string) => {
    // Only accept numeric digit
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned) {
      const nextPin = [...pin];
      nextPin[index] = '';
      setPin(nextPin);
      return;
    }

    const digit = cleaned.slice(-1);
    const nextPin = [...pin];
    nextPin[index] = digit;
    setPin(nextPin);

    // If there is next input, advance focus
    if (index < PIN_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }

    // Auto submit when all 6 digits are filled
    const fullPin = nextPin.join('');
    if (fullPin.length === PIN_LENGTH) {
      verifyPin(fullPin);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!pin[index] && index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, PIN_LENGTH);
    if (!pasteData) return;

    const nextPin = Array(PIN_LENGTH).fill('');
    for (let i = 0; i < pasteData.length; i++) {
      nextPin[i] = pasteData[i];
    }
    setPin(nextPin);

    if (pasteData.length === PIN_LENGTH) {
      verifyPin(pasteData);
    } else {
      inputsRef.current[pasteData.length]?.focus();
    }
  };

  const verifyPin = (enteredPin: string) => {
    if (enteredPin === CORRECT_PIN) {
      setErrorMessage('');
      onSuccess();
    } else {
      // Failed PIN attempt
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      // On first failure, immediately record to family activity logs
      if (attempts === 0) {
        onFirstFailure();
      }

      // Trigger shake animation
      setIsShaking(true);
      setTimeout(() => {
        setIsShaking(false);
      }, 600);

      // Reset PIN boxes and refocus first input
      setPin(Array(PIN_LENGTH).fill(''));
      inputsRef.current[0]?.focus();

      if (newAttempts >= 3) {
        setErrorMessage('3x salah PIN. Akses dialihkan kembali.');
        setTimeout(() => {
          onClose();
        }, 600);
      } else {
        setErrorMessage(`PIN salah (${newAttempts}/3 percobaan).`);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <style>
        {`
          @keyframes pinShake {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-9px); }
            40% { transform: translateX(9px); }
            60% { transform: translateX(-6px); }
            80% { transform: translateX(6px); }
          }
          .animate-pin-shake {
            animation: pinShake 0.5s ease-in-out;
          }
        `}
      </style>

      <div
        className={`w-full max-w-sm rounded-3xl p-6 sm:p-7 border shadow-2xl transition-all relative ${
          darkMode
            ? 'bg-neutral-900 border-neutral-750 text-neutral-100'
            : 'bg-white border-neutral-200 text-neutral-900'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-xs opacity-60 hover:opacity-100 transition-opacity"
          title="Batal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon & Title */}
        <div className="text-center mb-6">
          <div className="w-13 h-13 mx-auto mb-3 rounded-2xl bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-500">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="font-bold font-display text-lg sm:text-xl">Akses Pemilik Utama</h3>
          <p className="text-xs opacity-65 mt-1">
            Masukkan 6-digit PIN untuk beralih ke profil <strong>Ka Aji</strong>
          </p>
        </div>

        {/* 6 Digit PIN Boxes */}
        <div
          className={`flex items-center justify-center gap-2 sm:gap-2.5 mb-5 ${
            isShaking ? 'animate-pin-shake' : ''
          }`}
        >
          {pin.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputsRef.current[index] = el)}
              id={`owner-pin-box-${index}`}
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className={`w-10 sm:w-12 h-12 sm:h-14 text-center text-xl sm:text-2xl font-mono font-bold rounded-2xl border transition-all focus:outline-none focus:ring-2 focus:ring-red-500 ${
                isShaking
                  ? 'border-red-500 bg-red-500/10 text-red-500 ring-2 ring-red-500/40'
                  : digit
                  ? 'border-red-500/60 bg-red-500/5 text-neutral-900 dark:text-white'
                  : darkMode
                  ? 'border-neutral-700 bg-neutral-800/80 text-white'
                  : 'border-neutral-300 bg-neutral-50 text-neutral-900'
              }`}
            />
          ))}
        </div>

        {/* Error message / Attempts warning */}
        {errorMessage && (
          <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center justify-center gap-2 text-center animate-in fade-in">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};
