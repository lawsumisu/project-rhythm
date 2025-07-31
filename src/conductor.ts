export class Metronome {
  private startTime = 0;
  private lastBeatUpdate = 0;
  private _bpm: number;

  constructor(bpm: number) {
    this._bpm = bpm;
  }

  public start(): void {
    this.startTime = Date.now() / 1000;
    this.lastBeatUpdate = 0;
  }

  public update(fn: (beatCount: number) => void) {
    const { _bpm, startTime, lastBeatUpdate } = this;
    const secPerBeat = 60 / _bpm;
    const elaspedTime = Date.now() / 1000 - startTime;
    const beatIndex = Math.floor(elaspedTime / secPerBeat);
    if (beatIndex != lastBeatUpdate) {
      this.lastBeatUpdate = beatIndex;
      fn(beatIndex);
    }
  }

  public getOffsetFromClosestBeat(t: number, interval = 4) {
    // Beatmap is action per quarter note
    const { _bpm, startTime } = this;
    const secPerBeat = 60 / _bpm;
    const _t = t - startTime;
    const beatIndex = Math.floor((_t / secPerBeat / interval) * 4);
    if (_t - beatIndex * secPerBeat >= secPerBeat / 2) {
      return Math.round((_t - (beatIndex + 1) * secPerBeat) * 60);
    } else {
      return Math.round((_t - beatIndex * secPerBeat) * 60);
    }
  }

  public set bpm(_bpm: number) {
    this._bpm = _bpm;
    const secPerBeat = 60 / _bpm;
    const elaspedTime = Date.now() / 1000 - this.startTime;
    this.lastBeatUpdate = Math.floor(elaspedTime / secPerBeat);
  }

  public get bpm() {
    return this._bpm;
  }
}
export class Conductor {
  private readonly dt: number;
  private beatCount = 0;
  private readonly offset: number;

  public readonly sound: Phaser.Sound.HTML5AudioSound | Phaser.Sound.NoAudioSound | Phaser.Sound.WebAudioSound;

  constructor(
    sound: Phaser.Sound.HTML5AudioSound | Phaser.Sound.NoAudioSound | Phaser.Sound.WebAudioSound,
    bpm: number,
    offset: number
  ) {
    this.sound = sound;
    this.dt = 60 / bpm;
    this.offset = offset;
  }

  public update(fn: (beatCount: number) => void) {
    const { sound, dt } = this;
    if (sound.isPlaying && sound.seek > (this.beatCount + 1) * dt) {
      this.beatCount++;
      fn(this.beatCount);
    }
  }

  public getOffsetFromClosestBeat(t: number, f = 5) {
    // Beatmap is action per quarter note
    const { dt, beatCount } = this;
    console.log(t - beatCount * dt, dt / 2);
    if (t - beatCount * dt >= dt / 2) {
      return Math.round((t - (beatCount + 1) * dt) * 60);
    } else {
      return Math.round((t - beatCount * dt) * 60);
    }
  }

  public reset(): void {
    this.beatCount = 0;
  }
}
