let context: AudioContext | null = null;

const NOTES = [880, 1320];
const NOTE_GAP_S = 0.18;
const NOTE_LENGTH_S = 0.5;

// Browsers only allow audio after a user gesture, so the context is created on the first one.
export function unlockChime(): void {
  if (typeof window === 'undefined' || !('AudioContext' in window)) {
    return;
  }

  context ??= new AudioContext();
  void context.resume();
}

export function playChime(): void {
  if (!context || context.state !== 'running') {
    return;
  }

  const audio = context;

  NOTES.forEach((frequency, index) => {
    const start = audio.currentTime + index * NOTE_GAP_S;
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.25, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + NOTE_LENGTH_S);
    oscillator.connect(gain).connect(audio.destination);
    oscillator.start(start);
    oscillator.stop(start + NOTE_LENGTH_S);
  });
}
