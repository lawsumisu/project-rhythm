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
    if (sound.isPlaying && sound.seek > dt + this.beatCount * dt) {
      this.beatCount++;
      fn(this.beatCount);
    }
  }

  public reset(): void {
    this.beatCount = 0;
  }
}
