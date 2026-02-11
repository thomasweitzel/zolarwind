function initAudioPlayers() {
  const nodes = document.querySelectorAll('[data-audio-id][data-audio-src]');
  if (!nodes.length || typeof AudioPlayer === 'undefined') {
    return;
  }

  nodes.forEach((node) => {
    const id = node.getAttribute('data-audio-id');
    const src = node.getAttribute('data-audio-src');
    if (!id || !src) {
      return;
    }

    new AudioPlayer({
      src: src,
      controlsClass: `audio-controls${id}`,
      containerClass: `progress-container${id}`,
      barClass: `progress-bar${id}`,
      playClass: `play-div${id}`,
      timeClass: `time-div${id}`,
      speakerClass: `speaker-div${id}`,
    });
  });
}

initAudioPlayers();
