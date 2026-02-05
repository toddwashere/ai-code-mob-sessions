let sadTromboneAudio: HTMLAudioElement | null = null;

export function playSadTrombone() {
  try {
    if (!sadTromboneAudio) {
      sadTromboneAudio = new Audio("/sad-trombone.mp3");
    }
    sadTromboneAudio.currentTime = 0;
    sadTromboneAudio.play().catch(() => {
      // Ignore autoplay restrictions - user has interacted
    });
  } catch {
    // Silently fail if audio fails
  }
}
