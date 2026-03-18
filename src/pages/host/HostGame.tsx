import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import BauhausButton from "@/components/BauhausButton";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface AddedPlayer {
  email: string;
  username: string;
}

const HostGame = () => {
  const { gamePin } = useParams<{ gamePin: string }>();
  const navigate = useNavigate();
  const [playerEmail, setPlayerEmail] = useState("");
  const [addingPlayer, setAddingPlayer] = useState(false);
  const [addedPlayers, setAddedPlayers] = useState<AddedPlayer[]>([]);

  const handleAddPlayer = async () => {
    if (!playerEmail.trim()) {
      toast.error("enter a player email.");
      return;
    }
    setAddingPlayer(true);
    try {
      const data = await api.addPlayer(gamePin!, playerEmail.trim());
      const username = data.username || data.nickname || data.name || data.player?.name || "unknown";
      setAddedPlayers((prev) => [...prev, { email: playerEmail.trim(), username }]);
      toast.success(`player added: ${username}`);
      setPlayerEmail("");
    } catch (err: any) {
      toast.error(err.message || "failed to add player.");
    } finally {
      setAddingPlayer(false);
    }
  };

  const handleStart = async () => {
    try {
      await api.initializeGame(gamePin!);
      toast.success("game started.");
    } catch (err: any) {
      toast.error(err.message || "failed to start game.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="border-b-2 border-foreground flex items-center justify-between px-8 py-4">
        <button onClick={() => navigate("/host/dashboard")} className="text-xs uppercase tracking-[0.2em] font-body font-medium text-muted-foreground hover:text-foreground transition-colors">
          ← dashboard
        </button>
        <h1 className="text-2xl font-display font-black tracking-tighter">qwizza.</h1>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-12">
        {/* PIN display */}
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          transition={{ duration: 0.3, ease: [0, 0, 0, 1] }}
          className="md:col-span-3 bg-accent flex flex-col items-center justify-center p-8 border-b-2 md:border-b-0 md:border-r-2 border-foreground"
        >
          <p className="text-xs uppercase tracking-[0.2em] font-body font-medium text-accent-foreground mb-4">game pin</p>
          <p className="text-7xl md:text-9xl font-display font-black tracking-tighter text-accent-foreground tabular md:[writing-mode:vertical-lr] md:rotate-180">
            {gamePin}
          </p>
        </motion.div>

        {/* Control */}
        <div className="md:col-span-9 p-8 md:p-16 flex flex-col items-start justify-center gap-8">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] font-body font-medium text-muted-foreground mb-2">control room</p>
            <h2 className="text-4xl font-display font-black tracking-tighter">game {gamePin}</h2>
          </div>

          <div className="border-2 border-foreground p-8 w-full">
            <p className="text-xs uppercase tracking-[0.2em] font-body font-medium text-muted-foreground mb-4">players joined</p>
            <div className="animate-pulse-block bg-secondary border-2 border-foreground p-6 text-center">
              <p className="font-display font-black text-xl tracking-tighter">waiting for players...</p>
              <p className="text-xs uppercase tracking-[0.2em] font-body text-muted-foreground mt-2">
                share pin: {gamePin}
              </p>
            </div>
          </div>

          <BauhausButton color="foreground" onClick={handleStart} className="w-full md:w-auto">
            start machine
          </BauhausButton>
        </div>
      </div>
    </div>
  );
};

export default HostGame;
