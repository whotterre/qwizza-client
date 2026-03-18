import { useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import AnswerBlock from "@/components/AnswerBlock";

const colors: ("red" | "yellow" | "blue" | "black")[] = ["red", "blue", "yellow", "black"];

const PlayerGame = () => {
  const { gamePin } = useParams<{ gamePin: string }>();
  const [selected, setSelected] = useState<number | null>(null);

  // Placeholder data — will be driven by WebSocket
  const question = {
    content: "waiting for the next question...",
    answers: ["option a", "option b", "option c", "option d"],
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="border-b-2 border-foreground flex items-center justify-between px-8 py-4">
        <span className="text-xs uppercase tracking-[0.2em] font-body font-medium text-muted-foreground tabular">
          pin: {gamePin}
        </span>
        <h1 className="text-xl font-display font-black tracking-tighter">qwizza.</h1>
      </div>

      {/* Question */}
      <div className="border-b-2 border-foreground px-8 py-12 md:py-16">
        <motion.h2
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          transition={{ duration: 0.3, ease: [0, 0, 0, 1] }}
          className="text-3xl md:text-4xl font-display font-black tracking-tighter text-balance max-w-3xl"
        >
          {question.content}
        </motion.h2>
      </div>

      {/* Timer bar */}
      <div className="h-2 bg-muted border-b-2 border-foreground">
        <div className="h-full bg-primary transition-all duration-1000 ease-linear" style={{ width: "100%" }} />
      </div>

      {/* Answers */}
      <div className="flex-1 grid grid-cols-2 gap-0">
        {question.answers.map((answer, i) => (
          <div key={i} className="border-r-2 border-b-2 border-foreground last:border-r-0 [&:nth-child(2)]:border-r-0 [&:nth-child(4)]:border-r-0">
            <AnswerBlock
              label={answer}
              color={colors[i]}
              selected={selected === i}
              onClick={() => setSelected(i)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerGame;
