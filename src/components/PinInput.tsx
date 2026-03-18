import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface PinInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
}

const PinInput = ({ length = 6, value, onChange }: PinInputProps) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, char: string) => {
    const newVal = value.split("");
    newVal[index] = char.slice(-1).toUpperCase();
    const joined = newVal.join("").slice(0, length);
    onChange(joined);
    if (char && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="grid grid-cols-6 border-t-2 border-b-2 border-foreground">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="text"
          maxLength={1}
          value={value[i] || ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className={cn(
            "w-full aspect-square text-center font-display font-black text-3xl md:text-5xl bg-background text-foreground border-r-2 border-foreground last:border-r-0 focus:outline-none focus:bg-secondary tabular uppercase"
          )}
        />
      ))}
    </div>
  );
};

export default PinInput;
