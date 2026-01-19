const audioCtx = new (window.AudioContext)({
  latencyHint: "interactive",
});
const soundBuffers = {};

const soundPaths = {
  flap: "./audio/wing.mp3",
  hit: "./audio/hit.mp3",
  score: "./audio/point.mp3",
  swoosh: "./audio/swoosh.mp3",
  die: "./audio/die.mp3",
};

async function preloadAllAudio() {
  const loadTasks = Object.entries(soundPaths).map(async ([name, path]) => {
    const response = await fetch(path);
    const arrayBuffer = await response.arrayBuffer();
    soundBuffers[name] = await audioCtx.decodeAudioData(arrayBuffer);
  });

  await Promise.all(loadTasks);
  console.log("All audio preloaded");
}

function unlockAudio() {
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
}

function playSound(name) {
  audioCtx.resume();

  const buffer = soundBuffers[name];

  if (buffer) {
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtx.destination);
    source.start(0);
  }
}

export { preloadAllAudio, unlockAudio, playSound, audioCtx };
