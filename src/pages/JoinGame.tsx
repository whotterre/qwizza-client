import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import BauhausButton from "@/components/BauhausButton";
import PinInput from "@/components/PinInput";
import { api } from "@/lib/api";
import { toast } from "sonner";

const JoinGame = () => {
  const navigate = useNavigate();
  const [pin, setPin] = useState("");
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (pin.length !== 6 || !nickname.trim()) {
      toast.error("enter a 6-character pin and nickname.");
      return;
    }
    setLoading(true);
    try {
      const response = await api.joinGame(pin, nickname.trim());
      localStorage.setItem("qwizza_player_nickname", nickname.trim().toUpperCase());
      
      // Store gameId if available in response
      if (response?.game_id) {
        localStorage.setItem("qwizza_game_id", response.game_id.toString());
      }
      
      navigate(`/player/lobby/${pin}`);
    } catch (err: any) {
      toast.error(err.message || "failed to join game.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12">
        {/* Left label */}
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          transition={{ duration: 0.3, ease: [0, 0, 0, 1] }}
          className="md:col-span-2 bg-accent flex items-center justify-center p-8 border-b-2 md:border-b-0 md:border-r-2 border-foreground"
        >
          <h1 className="text-6xl md:text-9xl font-display font-black tracking-tighter text-accent-foreground md:[writing-mode:vertical-lr] md:rotate-180">
            join
          </h1>
        </motion.div>

        {/* Form */}
        <div className="md:col-span-10 flex items-center justify-center p-8 md:p-16">
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1, ease: [0, 0, 0, 1] }}
            className="w-full max-w-lg space-y-8"
          >
            <div>
              <label className="text-xs uppercase tracking-[0.2em] font-body font-medium text-muted-foreground block mb-3">
                enter pin.
              </label>
              <PinInput value={pin} onChange={setPin} />
            </div>

            <div>
              <label className="text-xs uppercase tracking-[0.2em] font-body font-medium text-muted-foreground block mb-3">
                nickname.
              </label>
              <input
                type="text"
                maxLength={32}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="your nickname"
                className="w-full px-6 py-4 border-2 border-foreground bg-background text-foreground font-display font-bold text-xl focus:outline-none focus:bg-secondary placeholder:text-muted-foreground uppercase"
              />
            </div>

            <BauhausButton
              color="foreground"
              onClick={handleJoin}
              disabled={loading}
              className="w-full"
            >
              {loading ? "joining..." : "enter game"}
            </BauhausButton>

            <button
              onClick={() => navigate("/")}
              className="text-xs uppercase tracking-[0.2em] font-body font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              ← back
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default JoinGame;
