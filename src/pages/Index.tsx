import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import BauhausButton from "@/components/BauhausButton";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 border-b-2 border-foreground">
        {/* Left: Title */}
        <div className="md:col-span-7 flex flex-col justify-center px-8 md:px-16 py-24 border-b-2 md:border-b-0 md:border-r-2 border-foreground">
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.2, ease: [0, 0, 0, 1] }}
            className="text-xs uppercase tracking-[0.2em] font-body font-medium text-muted-foreground mb-4"
          >
            the game of form.
          </motion.p>
          <motion.h1
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            transition={{ duration: 0.3, ease: [0, 0, 0, 1] }}
            className="text-[16vw] md:text-[12vw] leading-none font-display font-black tracking-tighter text-foreground"
          >
            qwizza.
          </motion.h1>
        </div>

        {/* Right: Actions */}
        <div className="md:col-span-5 flex flex-col">
          {/* Join block */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            transition={{ duration: 0.3, delay: 0.1, ease: [0, 0, 0, 1] }}
            className="flex-1 bg-secondary flex items-center justify-center border-b-2 border-foreground cursor-pointer group"
            onClick={() => navigate("/join")}
          >
            <div className="text-center p-8">
              <p className="text-xs uppercase tracking-[0.2em] font-body font-medium text-secondary-foreground mb-4">
                player
              </p>
              <h2 className="text-4xl md:text-5xl font-display font-black tracking-tighter text-secondary-foreground group-hover:translate-x-[-4px] group-hover:translate-y-[-4px] transition-transform duration-200">
                join a game
              </h2>
            </div>
          </motion.div>

          {/* Host block */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            transition={{ duration: 0.3, delay: 0.2, ease: [0, 0, 0, 1] }}
            className="flex-1 bg-primary flex items-center justify-center cursor-pointer group"
            onClick={() => navigate("/host/login")}
          >
            <div className="text-center p-8">
              <p className="text-xs uppercase tracking-[0.2em] font-body font-medium text-primary-foreground mb-4">
                host
              </p>
              <h2 className="text-4xl md:text-5xl font-display font-black tracking-tighter text-primary-foreground group-hover:translate-x-[-4px] group-hover:translate-y-[-4px] transition-transform duration-200">
                login as host
              </h2>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer stripe */}
      <div className="grid grid-cols-3 border-t-0">
        <div className="h-3 bg-bauhaus-red" />
        <div className="h-3 bg-bauhaus-yellow" />
        <div className="h-3 bg-bauhaus-blue" />
      </div>
    </div>
  );
};

export default Index;
