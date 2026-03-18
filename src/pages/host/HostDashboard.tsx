import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import BauhausButton from "@/components/BauhausButton";
import { api, getStoredUser, clearToken, clearStoredUser } from "@/lib/api";
import { toast } from "sonner";

interface Game {
  game_id: number;
  name: string;
  gamePin: string;
  question_duration: number;
  scheduled_at: string;
  created_at: string;
}

const HostDashboard = () => {
  const navigate = useNavigate();
  const user = getStoredUser();
  const [games, setGames] = useState<Game[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", question_duration: 30, scheduled_at: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/host/login");
      return;
    }
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      const data = await api.getHostGames();
      setGames(data.games || data || []);
    } catch {
      // silent
    }
  };

  const handleCreate = async () => {
    if (!form.name || !form.scheduled_at) {
      toast.error("fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      await api.createGame(form.name, form.question_duration, form.scheduled_at);
      toast.success("game created.");
      setShowCreate(false);
      setForm({ name: "", question_duration: 30, scheduled_at: "" });
      loadGames();
    } catch (err: any) {
      toast.error(err.message || "failed to create game.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearToken();
    clearStoredUser();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="border-b-2 border-foreground flex items-center justify-between px-8 py-4">
        <h1 className="text-2xl font-display font-black tracking-tighter">qwizza.</h1>
        <div className="flex items-center gap-4">
          <span className="text-xs uppercase tracking-[0.2em] font-body font-medium text-muted-foreground">
            {user?.email}
          </span>
          <button onClick={handleLogout} className="text-xs uppercase tracking-[0.2em] font-body font-medium text-muted-foreground hover:text-foreground transition-colors">
            logout
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-12">
        {/* Sidebar */}
        <div className="md:col-span-3 border-b-2 md:border-b-0 md:border-r-2 border-foreground p-8">
          <p className="text-xs uppercase tracking-[0.2em] font-body font-medium text-muted-foreground mb-6">
            control room
          </p>
          <BauhausButton color="foreground" onClick={() => setShowCreate(!showCreate)} className="w-full mb-4">
            + new game
          </BauhausButton>
        </div>

        {/* Main */}
        <div className="md:col-span-9 p-8">
          {/* Create form */}
          {showCreate && (
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.2, ease: [0, 0, 0, 1] }}
              className="border-2 border-foreground p-8 mb-8 bg-secondary"
            >
              <h3 className="text-xl font-display font-black tracking-tighter mb-6">create game.</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs uppercase tracking-[0.2em] font-body font-medium text-muted-foreground block mb-2">game name.</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-foreground bg-background font-body focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.2em] font-body font-medium text-muted-foreground block mb-2">question duration (seconds).</label>
                  <input type="number" value={form.question_duration} onChange={(e) => setForm({ ...form, question_duration: Number(e.target.value) })}
                    className="w-full px-4 py-3 border-2 border-foreground bg-background font-body focus:outline-none tabular" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.2em] font-body font-medium text-muted-foreground block mb-2">scheduled start.</label>
                  <input type="datetime-local" value={form.scheduled_at} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-foreground bg-background font-body focus:outline-none" />
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <BauhausButton color="primary" onClick={handleCreate} disabled={loading}>
                  {loading ? "creating..." : "create"}
                </BauhausButton>
                <BauhausButton color="secondary" onClick={() => setShowCreate(false)}>
                  cancel
                </BauhausButton>
              </div>
            </motion.div>
          )}

          {/* Games list */}
          <p className="text-xs uppercase tracking-[0.2em] font-body font-medium text-muted-foreground mb-4">
            your games
          </p>

          {games.length === 0 ? (
            <div className="border-2 border-foreground p-12 text-center">
              <p className="text-muted-foreground font-body">no games yet. create one to begin.</p>
            </div>
          ) : (
            <div className="space-y-0">
              {games.map((game, i) => (
                <motion.div
                  key={game.game_id}
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.05, ease: [0, 0, 0, 1] }}
                  className="border-2 border-foreground border-b-0 last:border-b-2 p-6 flex items-center justify-between hover:bg-secondary transition-colors cursor-pointer"
                  onClick={() => navigate(`/host/game/${game.gamePin}`)}
                >
                  <div>
                    <h3 className="font-display font-black text-xl tracking-tighter">{game.name}</h3>
                    <p className="text-xs uppercase tracking-[0.2em] font-body text-muted-foreground mt-1">
                      pin: <span className="tabular font-bold text-foreground">{game.gamePin}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-[0.2em] font-body text-muted-foreground">
                      {game.question_duration}s per question
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HostDashboard;
