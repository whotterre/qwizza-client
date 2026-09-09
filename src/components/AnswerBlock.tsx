import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnswerBlockProps {
  label: string;
  color: "red" | "yellow" | "blue" | "black";
  onClick?: () => void;
  disabled?: boolean;
  selected?: boolean;
}

const colorMap = {
  red: "bg-bauhaus-red text-primary-foreground",
  yellow: "bg-bauhaus-yellow text-secondary-foreground",
  blue: "bg-bauhaus-blue text-accent-foreground",
  black: "bg-bauhaus-black text-background",
};

const AnswerBlock = ({ label, color, onClick, disabled, selected }: AnswerBlockProps) => (
  <motion.button
    onClick={onClick}
    disabled={disabled}
    whileHover={disabled ? {} : { x: -4, y: -4, boxShadow: "4px 4px 0px 0px hsl(var(--foreground))" }}
    whileTap={disabled ? {} : { x: 0, y: 0, boxShadow: "0px 0px 0px 0px hsl(var(--foreground))" }}
    initial={{ x: "100%" }}
    animate={{ x: 0 }}
    transition={{ duration: 0.2, ease: [0, 0, 0, 1] }}
    className={cn(
      "w-full h-full min-h-[90px] md:min-h-[120px] border-2 border-foreground flex items-center justify-center font-display font-black text-lg md:text-2xl uppercase tracking-wider p-4 text-center cursor-pointer transition-colors",
      colorMap[color],
      selected && "ring-4 ring-foreground",
      disabled && "opacity-70 cursor-not-allowed"
    )}
  >
    {label}
  </motion.button>
);

export default AnswerBlock;
