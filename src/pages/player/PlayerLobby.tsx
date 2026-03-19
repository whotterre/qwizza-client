import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { useState, useEffect } from "react";
import { useJazzMusic } from "@/hooks/useJazzMusic";
import { useSocket } from "@/hooks/useSocket";
import { toast } from "sonner";

const PlayerLobby = () => {
  const { gamePin } = useParams<{ gamePin: string }>();
  const navigate = useNavigate();
  const [muted, setMuted] = useState(false);
  const [connected, setConnected] = useState(false);
  const { toggle } = useJazzMusic(true);
  const nickname = localStorage.getItem("qwizza_player_nickname");

  useEffect(() => {
    console.log("[PlayerLobby] Data check - gamePin:", gamePin, "nickname:", nickname);
  }, [gamePin, nickname]);
  
  const { emit, on } = useSocket({
    onConnect: () => {
      console.log("[PlayerLobby] Socket connected, emitting PLAYER_JOIN with gamePin:", gamePin, "nickname:", nickname);
      setConnected(true);
      emit("PLAYER_JOIN", { gamePin, nickname });
    },
    onDisconnect: () => setConnected(false),
    onError: (error) => console.error("Socket error:", error),
  });

  useEffect(() => {
    const onSubscribe = on("QUESTION", (payload) => {
      console.log("[PlayerLobby] QUESTION event received, navigating to game:", gamePin);
      navigate(`/player/game/${gamePin}`);
    });

    return onSubscribe;
  }, [on, navigate, gamePin]);

  useEffect(() => {
    const onSubscribe = on("PLAYER_JOINED", (payload: { nickname: string }) => {
      const currentNickname = localStorage.getItem("qwizza_player_nickname");
      if (payload.nickname !== currentNickname) {
        toast.info(`${payload.nickname} joined the lobby!`);
      }
    });

    return onSubscribe;
  }, [on]);

  const handleToggleMute = () => {
    toggle();
    setMuted(!muted);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12">
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          transition={{ duration: 0.3, ease: [0, 0, 0, 1] }}
          className="md:col-span-3 bg-secondary flex flex-col items-center justify-center p-8 border-b-2 md:border-b-0 md:border-r-2 border-foreground"
        >
          <p className="text-xs uppercase tracking-[0.2em] font-body font-medium text-secondary-foreground mb-4">game pin</p>
          <p className="text-7xl md:text-9xl font-display font-black tracking-tighter text-secondary-foreground tabular md:[writing-mode:vertical-lr] md:rotate-180">
            {gamePin}
          </p>
        </motion.div>

        <div className="md:col-span-9 flex flex-col items-center justify-center p-8 md:p-16">
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1, ease: [0, 0, 0, 1] }}
            className="text-center space-y-8"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.2em] font-body font-medium text-muted-foreground mb-2">lobby</p>
              <h2 className="text-4xl font-display font-black tracking-tighter">you are in.</h2>
            </div>

            <div className="animate-pulse-block border-2 border-foreground p-12 bg-secondary">
              <p className="font-display font-black text-2xl tracking-tighter">{connected ? "ready" : "waiting"}</p>
              <p className="text-xs uppercase tracking-[0.2em] font-body text-muted-foreground mt-2">
                {connected ? "for host to start the game..." : "to connect..."}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3">
              <p className="text-xs uppercase tracking-[0.2em] font-body text-muted-foreground">
                stay on this page. the game will begin shortly.
              </p>
              <button
                onClick={handleToggleMute}
                className="border-2 border-foreground p-2 bg-background hover:bg-secondary transition-colors"
                aria-label={muted ? "Unmute jazz" : "Mute jazz"}
              >
                {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
            </div>

            <p className="text-[10px] uppercase tracking-[0.2em] font-body text-muted-foreground opacity-60">
              ♪ click anywhere to start the jazz ♪
            </p>
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-3">
        <div className="h-3 bg-bauhaus-red" />
        <div className="h-3 bg-bauhaus-yellow" />
        <div className="h-3 bg-bauhaus-blue" />
      </div>
    </div>
  );
};

export default PlayerLobby;
