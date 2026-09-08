import { useState } from "react";
import { api } from "@/lib/api";

export default function useRescheduleGame() {
  const [loading, setLoading] = useState(false);

  const reschedule = async (gameId: number, scheduledAtIso: string) => {
    setLoading(true);
    try {
      const res = await api.rescheduleGame(gameId, scheduledAtIso);
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { reschedule, loading };
}
