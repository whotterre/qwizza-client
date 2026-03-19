import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import BauhausButton from "@/components/BauhausButton";
import { useSocket } from "@/hooks/useSocket";

const PlayerResults = () => {
  const { gamePin } = useParams<{ gamePin: string }>();
  const navigate = useNavigate();
  const [score, setScore] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;

  const nickname = localStorage.getItem("qwizza_player_nickname");

  const { on } = useSocket({
    onConnect: () => {
      console.log("[PlayerResults] Socket connected");
    },
  });

  useEffect(() => {
    const onSubscribeQuizResults = on("QUIZ_RESULTS", (payload: any) => {
      console.log("[PlayerResults] QUIZ_RESULTS received:", payload);
      setScore(payload.score || 0);
      setTotal(payload.total || 0);
    });

    return () => {
      onSubscribeQuizResults();
    };
  }, [on]);

  return (
    <div className="min-h-screen flex flex-col">
      {total === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-display font-black tracking-tighter mb-2">loading results...</p>
            <p className="text-muted-foreground">waiting for final scores</p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-12">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              transition={{ duration: 0.3, ease: [0, 0, 0, 1] }}
              className="md:col-span-4 bg-bauhaus-green flex flex-col items-center justify-center p-8 border-b-2 md:border-b-0 md:border-r-2 border-foreground"
            >
              <p className="text-xs uppercase tracking-[0.2em] font-body font-medium text-background mb-4">your score</p>
              <p className="text-[20vw] md:text-[12vw] font-display font-black tracking-tighter text-background tabular leading-none">
                {score}
              </p>
              <p className="text-xl font-display font-black text-background tracking-tighter">/ {total}</p>
            </motion.div>

            <div className="md:col-span-8 flex flex-col items-start justify-center p-8 md:p-16 gap-8">
              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1, ease: [0, 0, 0, 1] }}
              >
                <p className="text-xs uppercase tracking-[0.2em] font-body font-medium text-muted-foreground mb-2">results</p>
                <h2 className="text-4xl font-display font-black tracking-tighter">game over.</h2>
                <p className="text-xl font-body font-medium text-muted-foreground mt-2">
                  {pct}% accuracy
                </p>
              </motion.div>

              {/* Score bar */}
              <div className="w-full border-2 border-foreground h-16">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.5, delay: 0.3, ease: [0, 0, 0, 1] }}
                  className="h-full bg-bauhaus-green"
                />
              </div>

              <BauhausButton color="foreground" onClick={() => navigate("/")}>
                play again
              </BauhausButton>
            </div>
          </div>

          <div className="grid grid-cols-3">
            <div className="h-3 bg-bauhaus-red" />
            <div className="h-3 bg-bauhaus-yellow" />
            <div className="h-3 bg-bauhaus-blue" />
          </div>
        </>
      )}
    </div>
  );
};

export default PlayerResults;
