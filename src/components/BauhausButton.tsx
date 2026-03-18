import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BauhausButtonProps {
  children: React.ReactNode;
  color?: "primary" | "secondary" | "accent" | "foreground";
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
  disabled?: boolean;
}

const colorMap = {
  primary: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  accent: "bg-accent text-accent-foreground",
  foreground: "bg-foreground text-background",
};

const BauhausButton = ({
  children,
  color = "primary",
  onClick,
  type = "button",
  className,
  disabled,
}: BauhausButtonProps) => (
  <motion.button
    type={type}
    onClick={onClick}
    disabled={disabled}
    whileHover={disabled ? {} : { x: -4, y: -4, boxShadow: "4px 4px 0px 0px hsl(var(--foreground))" }}
    whileTap={disabled ? {} : { x: 0, y: 0, boxShadow: "0px 0px 0px 0px hsl(var(--foreground))" }}
    transition={{ duration: 0.2, ease: [0, 0, 0, 1] }}
    className={cn(
      "px-8 py-4 border-2 border-foreground font-display font-black uppercase tracking-widest text-sm disabled:opacity-50 disabled:cursor-not-allowed",
      colorMap[color],
      className
    )}
  >
    {children}
  </motion.button>
);

export default BauhausButton;
