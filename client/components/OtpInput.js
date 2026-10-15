import React, { useRef, useEffect } from 'react';

export default function OtpInput({ length = 6, value, onChange, disabled }) {
  const inputsRef = useRef([]);

  useEffect(() => {
    // If value is cleared externally, ensure inputs reflect this
    if (value.length === 0 && inputsRef.current[0]) {
      inputsRef.current.forEach(input => {
        if (input) input.value = '';
      });
      inputsRef.current[0].focus();
    }
  }, [value]);

  const handleChange = (e, index) => {
    const val = e.target.value.replace(/\D/g, ''); // only digits
    if (!val) return;

    // Build new OTP string
    const newOtp = value.split('');
    // Handle paste of multiple characters into a single box
    if (val.length > 1) {
      let pasteString = val.substring(0, length - index);
      for (let i = 0; i < pasteString.length; i++) {
        newOtp[index + i] = pasteString[i];
        if (inputsRef.current[index + i]) {
          inputsRef.current[index + i].value = pasteString[i];
        }
      }
      onChange(newOtp.join(''));
      
      const nextIndex = Math.min(index + pasteString.length, length - 1);
      if (inputsRef.current[nextIndex]) {
        inputsRef.current[nextIndex].focus();
      }
      return;
    }

    newOtp[index] = val;
    const finalOtp = newOtp.join('');
    onChange(finalOtp);

    // Move to next input automatically
    if (val && index < length - 1 && inputsRef.current[index + 1]) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      const newOtp = value.split('');
      
      // If current input is empty, delete previous and move back
      if (!e.target.value && index > 0) {
        newOtp[index - 1] = '';
        if (inputsRef.current[index - 1]) {
          inputsRef.current[index - 1].value = '';
          inputsRef.current[index - 1].focus();
        }
      } else {
        // Just clear current input
        newOtp[index] = '';
        e.target.value = '';
      }
      
      onChange(newOtp.join(''));
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1].focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputsRef.current[index + 1].focus();
    }
  };

  return (
    <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 w-full max-w-full">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={el => inputsRef.current[index] = el}
          type="text"
          inputMode="numeric"
          maxLength={1}
          disabled={disabled}
          value={value[index] || ''}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          className="w-10 h-12 sm:w-12 sm:h-14 flex-1 min-w-0 max-w-[46px] text-center text-lg sm:text-xl font-bold bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all disabled:opacity-50 text-zinc-900 dark:text-white shadow-xs"
        />
      ))}
    </div>
  );
}
