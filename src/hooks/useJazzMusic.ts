import { useEffect, useRef, useCallback } from "react";

// Jazz chord voicings (frequencies in Hz) - smooth 7th/9th chords
const JAZZ_CHORDS = [
  [261.6, 329.6, 392.0, 466.2], // Cmaj7
  [293.7, 370.0, 440.0, 523.3], // Dm7
  [329.6, 415.3, 493.9, 587.3], // Em7
  [349.2, 440.0, 523.3, 622.3], // Fmaj7
  [392.0, 493.9, 587.3, 698.5], // G7
  [440.0, 523.3, 659.3, 783.9], // Am7
  [293.7, 370.0, 440.0, 523.3], // Dm7
  [392.0, 466.2, 587.3, 698.5], // G7b9
];

const BASS_NOTES = [130.8, 146.8, 164.8, 174.6, 196.0, 220.0, 146.8, 196.0];

export function useJazzMusic(enabled: boolean = true) {
  const ctxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<number | null>(null);
  const chordIndexRef = useRef(0);
  const gainRef = useRef<GainNode | null>(null);

  const playChord = useCallback(() => {
    const ctx = ctxRef.current;
    const masterGain = gainRef.current;
    if (!ctx || !masterGain) return;

    const now = ctx.currentTime;
    const chord = JAZZ_CHORDS[chordIndexRef.current % JAZZ_CHORDS.length];
    const bass = BASS_NOTES[chordIndexRef.current % BASS_NOTES.length];

    // Play chord tones with soft triangle waves
    chord.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now);
      // Detune slightly for warmth
      osc.detune.setValueAtTime((Math.random() - 0.5) * 8, now);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.04 - i * 0.005, now + 0.3);
      gain.gain.linearRampToValueAtTime(0.02, now + 1.5);
      gain.gain.linearRampToValueAtTime(0, now + 2.8);
      osc.connect(gain).connect(masterGain);
      osc.start(now + i * 0.05);
      osc.stop(now + 3);
    });

    // Walking bass with sine wave
    const bassOsc = ctx.createOscillator();
    const bassGain = ctx.createGain();
    bassOsc.type = "sine";
    bassOsc.frequency.setValueAtTime(bass, now);
    bassGain.gain.setValueAtTime(0, now);
    bassGain.gain.linearRampToValueAtTime(0.08, now + 0.1);
    bassGain.gain.linearRampToValueAtTime(0.04, now + 1.0);
    bassGain.gain.linearRampToValueAtTime(0, now + 2.5);
    bassOsc.connect(bassGain).connect(masterGain);
    bassOsc.start(now);
    bassOsc.stop(now + 2.8);

    // Occasional jazzy hi-hat (noise burst)
    if (Math.random() > 0.4) {
      const bufferSize = ctx.sampleRate * 0.05;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.3;
      }
      const noise = ctx.createBufferSource();
      const noiseGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.value = 8000;
      noise.buffer = noiseBuffer;
      noiseGain.gain.setValueAtTime(0.06, now + 0.5);
      noiseGain.gain.linearRampToValueAtTime(0, now + 0.58);
      noise.connect(filter).connect(noiseGain).connect(masterGain);
      noise.start(now + 0.5);
    }

    chordIndexRef.current++;
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const startMusic = () => {
      if (ctxRef.current) return;
      const ctx = new AudioContext();
      ctxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.value = 0.6;
      masterGain.connect(ctx.destination);
      gainRef.current = masterGain;

      playChord();
      intervalRef.current = window.setInterval(playChord, 3000);

      // Remove listener after first interaction
      document.removeEventListener("click", startMusic);
      document.removeEventListener("touchstart", startMusic);
    };

    // Auto-play requires user interaction
    document.addEventListener("click", startMusic);
    document.addEventListener("touchstart", startMusic);

    return () => {
      document.removeEventListener("click", startMusic);
      document.removeEventListener("touchstart", startMusic);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (ctxRef.current) {
        ctxRef.current.close();
        ctxRef.current = null;
      }
    };
  }, [enabled, playChord]);

  const toggle = useCallback(() => {
    const gain = gainRef.current;
    if (!gain) return;
    gain.gain.value = gain.gain.value > 0 ? 0 : 0.6;
  }, []);

  return { toggle };
}
