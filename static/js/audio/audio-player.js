class AudioPlayer {

  constructor(cfg) {
    this.rootClass         = cfg.controlsClass;
    this.playClass         = cfg.playClass;
    this.timeClass         = cfg.timeClass;
    this.speakerClass      = cfg.speakerClass;
    this.barClass          = cfg.barClass;
    this.containerClass    = cfg.containerClass;
    this.src               = cfg.src;
    this.playSvg           = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.0" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"/></svg>';
    this.pauseSvg          = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.0" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5"/></svg>';
    this.speakerSvg        = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.0" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"/></svg>';
    this.muteSvg           = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.0" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.531V19.94a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.506-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.395C2.806 8.757 3.63 8.25 4.51 8.25H6.75z"/></svg>';
    this.root              = document.getElementsByClassName(this.rootClass)[0];
    this.progress          = this.root.getElementsByClassName(this.barClass)[0];
    this.progressContainer = this.root.getElementsByClassName(this.containerClass)[0];
    this.play              = document.getElementsByClassName(this.playClass)[0];
    this.speaker           = document.getElementsByClassName(this.speakerClass)[0];
    this.isMute            = false;
    this.isInit            = true;
    this.sound             = undefined;

    // Initial SVGs for buttons
    this.setInner(this.playClass, this.playSvg);
    this.setInner(this.speakerClass, this.speakerSvg);

    // Play/Pause
    this.play.addEventListener('click', () => {
      if (this.isInit) {
        this.initSound();
      }
      if (this.sound.playing()) {
        this.setInner(this.playClass, this.playSvg);
        this.sound.pause();
      } else {
        this.setInner(this.playClass, this.pauseSvg);
        this.sound.play();
      }
    });

    // Speaker/Mute
    this.speaker.addEventListener('click', () => {
      if (!this.isInit) {
        if (this.isMute) {
          this.isMute = false;
          this.setInner(this.speakerClass, this.speakerSvg);
          this.sound.volume(1.0);
        } else {
          this.isMute = true;
          this.setInner(this.speakerClass, this.muteSvg);
          this.sound.volume(0.0);
        }
      }
    });

    // Progress bar
    this.progressContainer.addEventListener('click', (e) => {
      if (this.sound /* && this.sound.playing() */) {
        const rect = e.target.getBoundingClientRect();
        const pos_x = e.clientX - rect.left;
        const p = (pos_x / this.progressContainer.offsetWidth) || 0;
        this.sound.seek(this.sound.duration() * p);
        setTimeout(() => this.step(), 100);
      }
    });
  }

  setInner(name, value) {
    const element = this.root.getElementsByClassName(name)[0];
    element.innerHTML = value;
  }

  formatTime(secs) {
    const minutes = Math.trunc(secs / 60) || 0;
    const seconds = Math.trunc(secs - minutes * 60) || 0;
    return (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
  }

  updateTimer() {
    const duration = this.sound.duration()
    const seek = Math.round(this.sound.seek());
    this.setInner(this.timeClass, `${this.formatTime(seek)} | ${this.formatTime(duration)}`);
  }

  updateProgress() {
    const percent = ((this.sound.seek() / this.sound.duration()) * 100) || 0;
    this.progress.style.width = `${percent}%`;
  }

  step() {
    this.updateTimer();
    this.updateProgress();
    if (this.sound.playing()) {
      requestAnimationFrame(this.step.bind(this));
    }
  }

  initSound() {
    if (this.isInit) {
      this.isInit = false;
      this.sound = new Howl({
        src: [this.src],
        autoplay: false,
        html5: true,
        onplay: () => requestAnimationFrame(this.step.bind(this)),
        onend: () => this.setInner(this.playClass, this.playSvg),
      });
    }
  };

}
