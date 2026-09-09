import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import BauhausButton from "@/components/BauhausButton";
import { api } from "@/lib/api";

const PlayerResults = () => {
  const { gamePin } = useParams<{ gamePin: string }>();
  const navigate = useNavigate();
  const [score, setScore] = useState<number>(0);
  const [leaderboard, setLeaderboard] = useState<
    { nickname: string; score: number }[]
  >([]);
  const [position, setPosition] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const nickname = localStorage.getItem("qwizza_player_nickname") || "";
  const gameId = localStorage.getItem("qwizza_game_id");
  const maxScore = leaderboard[0]?.score || 1;

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      if (!gameId || !nickname) {
        setLeaderboard([]);
        setLoading(false);
        return;
      }

      try {
        const response = await api.getFinalLeaderboard(parseInt(gameId));
        const finalLeaderboard = response.leaderboard || [];
        setLeaderboard(finalLeaderboard);

        const playerEntry = finalLeaderboard.find(
          (entry: any) => entry.nickname === nickname
        );

        if (playerEntry) {
          setScore(playerEntry.score);
          const playerPosition = finalLeaderboard.findIndex(
            (entry: any) => entry.nickname === nickname
          ) + 1;
          setPosition(playerPosition);
        }
      } catch (error) {
        // If backend returned 404 or error, show empty leaderboard and allow retry
        setLeaderboard([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [gameId, nickname]);

  return (
    <div className="min-h-screen flex flex-col">
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-display font-black tracking-tighter mb-2">loading results...</p>
            <p className="text-muted-foreground">waiting for final scores</p>
          </div>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-display font-black tracking-tighter mb-2">no results yet</p>
            <p className="text-muted-foreground mb-4">final scores are not available for this game.</p>
            <div className="flex justify-center gap-3">
              <BauhausButton color="primary" onClick={() => {
                // trigger a reload by updating state (call same fetch logic)
                setLoading(true);
                (async () => {
                  try {
                    const response = await api.getFinalLeaderboard(parseInt(gameId || "0"));
                    const finalLeaderboard = response.leaderboard || [];
                    setLeaderboard(finalLeaderboard);
                    const playerEntry = finalLeaderboard.find((entry: any) => entry.nickname === nickname);
                    if (playerEntry) {
                      setScore(playerEntry.score);
                      setPosition(finalLeaderboard.findIndex((entry: any) => entry.nickname === nickname) + 1);
                    }
                  } catch (e) {
                    setLeaderboard([]);
                  } finally {
                    setLoading(false);
                  }
                })();
              }}>retry</BauhausButton>
              <BauhausButton color="foreground" onClick={() => navigate("/")}>back</BauhausButton>
            </div>
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
              <p className="text-xs uppercase tracking-[0.2em] font-body font-medium text-background mb-4">
                your score
              </p>
              <p className="text-[20vw] md:text-[12vw] font-display font-black tracking-tighter text-background tabular leading-none">
                {score.toFixed(1)}
              </p>
              <p className="text-lg font-body text-background mt-2">
                position: #{position}
              </p>
            </motion.div>

            <div className="md:col-span-8 flex flex-col items-start justify-center p-8 md:p-16 gap-8">
              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1, ease: [0, 0, 0, 1] }}
              >
                <p className="text-xs uppercase tracking-[0.2em] font-body font-medium text-muted-foreground mb-2">
                  results
                </p>
                <h2 className="text-4xl font-display font-black tracking-tighter">
                  game over.
                </h2>
              </motion.div>

              {/* Leaderboard */}
              <div className="w-full space-y-2">
                <p className="text-sm uppercase tracking-[0.15em] font-body font-medium text-muted-foreground mb-4">
                  final leaderboard
                </p>
                {leaderboard.map((entry, idx) => (
                  <motion.div
                    key={entry.nickname}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 + idx * 0.05 }}
                    className={`flex justify-between p-3 border border-foreground ${
                      entry.nickname === nickname
                        ? "bg-bauhaus-green text-background"
                        : ""
                    }`}
                  >
                    <span className="font-body font-medium">
                      #{idx + 1} {entry.nickname}
                    </span>
                    <span className="font-display font-black">
                      {entry.score.toFixed(1)}
                    </span>
                  </motion.div>
                ))}
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