import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import BauhausButton from "@/components/BauhausButton";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { toUtcIso, validateScheduledAt } from "@/lib/reschedule";

interface Props {
  game: {
    game_id: number;
    name: string;
    scheduled_at?: string;
    gamePin?: string;
  };
  onSuccess?: () => void;
}

const RescheduleModal = ({ game, onSuccess }: Props) => {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState( game.scheduled_at ? new Date(game.scheduled_at).toISOString().slice(0,10) : "" );
  const [time, setTime] = useState( game.scheduled_at ? new Date(game.scheduled_at).toISOString().slice(11,16) : "" );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "local";

  const handleSave = async () => {
    setError(null);
    const combined = `${date}T${time}`;
    const validation = validateScheduledAt(combined);
    if (!validation.valid) {
      setError(validation.message);
      return;
    }

    const isoUtc = toUtcIso(combined);
    setLoading(true);
    try {
      await api.rescheduleGame(game.game_id, isoUtc);
      toast.success("Quiz rescheduled.");
      setOpen(false);
      onSuccess && onSuccess();
    } catch (err: any) {
      if (err.message && err.message.includes("404")) {
        toast.error("Reschedule endpoint not available yet.");
      } else {
        toast.error(err.message || "Failed to reschedule.");
      }
      setError(err.message || "Failed to reschedule.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <BauhausButton color="foreground">reschedule</BauhausButton>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reschedule quiz</DialogTitle>
          <DialogDescription>Pick a new date and time for this game. Times shown are in your local timezone ({timezone}).</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <label className="text-xs uppercase tracking-[0.2em] font-body font-medium text-muted-foreground block mb-2">date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-4 py-3 border-2 border-foreground bg-background focus:outline-none" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] font-body font-medium text-muted-foreground block mb-2">time</label>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full px-4 py-3 border-2 border-foreground bg-background focus:outline-none" />
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Timezone: <span className="font-medium">{timezone}</span></p>
          </div>

          <div className="mt-2 text-sm">
            <p className="text-muted-foreground">Preview:</p>
            <p className="font-medium">Local: {date && time ? new Date(`${date}T${time}`).toLocaleString() : "—"}</p>
            <p className="font-medium">UTC: {date && time ? new Date(`${date}T${time}`).toUTCString() : "—"}</p>
          </div>

          {error && <p className="text-red-500 text-sm" role="alert">{error}</p>}
        </div>

        <DialogFooter>
          <BauhausButton color="secondary" onClick={() => setOpen(false)}>
            cancel
          </BauhausButton>
          <BauhausButton color="primary" onClick={async () => { await handleSave(); }} disabled={loading}>
            {loading ? "saving..." : "save"}
          </BauhausButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RescheduleModal;
