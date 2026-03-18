import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import BauhausButton from "@/components/BauhausButton";
import { api } from "@/lib/api";
import { toast } from "sonner";

const HostSignup = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password) {
      toast.error("fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      await api.signup(email, password, "host");
      toast.success("account created. please login.");
      navigate("/host/login");
    } catch (err: any) {
      toast.error(err.message || "signup failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12">
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          transition={{ duration: 0.3, ease: [0, 0, 0, 1] }}
          className="md:col-span-2 bg-secondary flex items-center justify-center p-8 border-b-2 md:border-b-0 md:border-r-2 border-foreground"
        >
          <h1 className="text-6xl md:text-9xl font-display font-black tracking-tighter text-secondary-foreground md:[writing-mode:vertical-lr] md:rotate-180">
            signup
          </h1>
        </motion.div>

        <div className="md:col-span-10 flex items-center justify-center p-8 md:p-16">
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1, ease: [0, 0, 0, 1] }}
            className="w-full max-w-lg space-y-8"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.2em] font-body font-medium text-muted-foreground mb-1">qwizza</p>
              <h2 className="text-4xl font-display font-black tracking-tighter">create account.</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-[0.2em] font-body font-medium text-muted-foreground block mb-2">email.</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-6 py-4 border-2 border-foreground bg-background text-foreground font-body text-lg focus:outline-none focus:bg-secondary" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.2em] font-body font-medium text-muted-foreground block mb-2">password.</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-6 py-4 border-2 border-foreground bg-background text-foreground font-body text-lg focus:outline-none focus:bg-secondary" />
              </div>
            </div>

            <BauhausButton color="foreground" onClick={handleSignup} disabled={loading} className="w-full">
              {loading ? "creating..." : "create account"}
            </BauhausButton>

            <div className="flex items-center justify-between">
              <Link to="/host/login" className="text-xs uppercase tracking-[0.2em] font-body font-medium text-muted-foreground hover:text-foreground transition-colors">
                already have account? →
              </Link>
              <button onClick={() => navigate("/")} className="text-xs uppercase tracking-[0.2em] font-body font-medium text-muted-foreground hover:text-foreground transition-colors">
                ← back
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HostSignup;
