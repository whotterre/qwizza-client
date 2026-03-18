import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import JoinGame from "./pages/JoinGame";
import HostLogin from "./pages/host/HostLogin";
import HostSignup from "./pages/host/HostSignup";
import HostDashboard from "./pages/host/HostDashboard";
import HostGame from "./pages/host/HostGame";
import PlayerLobby from "./pages/player/PlayerLobby";
import PlayerGame from "./pages/player/PlayerGame";
import PlayerResults from "./pages/player/PlayerResults";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/join" element={<JoinGame />} />
          <Route path="/host/login" element={<HostLogin />} />
          <Route path="/host/signup" element={<HostSignup />} />
          <Route path="/host/dashboard" element={<HostDashboard />} />
          <Route path="/host/game/:gamePin" element={<HostGame />} />
          <Route path="/player/lobby/:gamePin" element={<PlayerLobby />} />
          <Route path="/player/game/:gamePin" element={<PlayerGame />} />
          <Route path="/player/results/:gamePin" element={<PlayerResults />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
