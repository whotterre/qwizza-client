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

          {/* Add Player */}
          <div className="border-2 border-foreground p-8 w-full">
            <p className="text-xs uppercase tracking-[0.2em] font-body font-medium text-muted-foreground mb-4">add player by email</p>
            <div className="flex gap-3">
              <input
                type="email"
                value={playerEmail}
                onChange={(e) => setPlayerEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddPlayer()}
                placeholder="player@email.com"
                className="flex-1 px-4 py-3 border-2 border-foreground bg-background font-body focus:outline-none"
              />
              <BauhausButton color="primary" onClick={handleAddPlayer} disabled={addingPlayer}>
                {addingPlayer ? "adding..." : "add"}
              </BauhausButton>
            </div>
          </div>

          {/* Players list */}
          <div className="border-2 border-foreground p-8 w-full">
            <p className="text-xs uppercase tracking-[0.2em] font-body font-medium text-muted-foreground mb-4">players ({addedPlayers.length})</p>
            {addedPlayers.length === 0 ? (
              <div className="animate-pulse-block bg-secondary border-2 border-foreground p-6 text-center">
                <p className="font-display font-black text-xl tracking-tighter">no players yet.</p>
                <p className="text-xs uppercase tracking-[0.2em] font-body text-muted-foreground mt-2">
                  add players above or share pin: {gamePin}
                </p>
              </div>
            ) : (
              <div className="space-y-0">
                {addedPlayers.map((p, i) => (
                  <motion.div
                    key={i}
                    initial={{ x: 40, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.2, delay: i * 0.03, ease: [0, 0, 0, 1] }}
                    className="border-2 border-foreground border-b-0 last:border-b-2 p-4 flex items-center justify-between bg-background hover:bg-secondary transition-colors"
                  >
                    <div>
                      <p className="font-display font-black tracking-tighter">{p.username}</p>
                      <p className="text-xs font-body text-muted-foreground">{p.email}</p>
                    </div>
                    <div className="bg-accent border-2 border-foreground px-3 py-1">
                      <p className="text-xs uppercase tracking-[0.2em] font-body font-bold text-accent-foreground">joined</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
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
