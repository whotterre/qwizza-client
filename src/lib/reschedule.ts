export function validateScheduledAt(combinedIsoLike: string) {
  const d = new Date(combinedIsoLike);
  if (!isFinite(d.getTime())) {
    return { valid: false, message: "Invalid date/time." };
  }
  const now = Date.now();
  const min = now + 2 * 60 * 1000; // at least 2 minutes ahead
  if (d.getTime() <= now) return { valid: false, message: "Scheduled time must be in the future." };
  if (d.getTime() < min) return { valid: false, message: "Scheduled time must be at least 2 minutes from now." };
  return { valid: true };
}

export function toUtcIso(combinedIsoLike: string) {
  const d = new Date(combinedIsoLike);
  return d.toISOString();
}
