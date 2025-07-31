import { DebugDrawPlugin } from '@lawsumisu/phaser';
import * as Phaser from 'phaser';
import { Conductor, Metronome } from 'src/conductor';
import * as Tone from 'tone';
import { Vector2 } from '@lawsumisu/common-utilities';

const keyCodes = Phaser.Input.Keyboard.KeyCodes;
type PhaserSound = Phaser.Sound.HTML5AudioSound | Phaser.Sound.NoAudioSound | Phaser.Sound.WebAudioSound;

class Scene extends Phaser.Scene {
  private conductor: Conductor;
  private fillColor: number[] = [1, 1, 1];
  private lastPress = -1;
  private metronome: Metronome;
  private synth = new Tone.Synth().toDestination();
  private synth2 = new Tone.Synth().toDestination();
  private beats: { position: Vector2; state?: string; timer: number }[] = [];

  public preload(): void {
    this.load.audio('theme', 'assets/audio/cryptic_marble.ogg');
  }
  public create(): void {
    const music = this.sound.add('theme');
    const bpm = 133;
    this.conductor = new Conductor(music, bpm, 0);
    this.metronome = new Metronome(bpm);
    // transport.start();
    this.metronome.start();
    Tone.getContext().lookAhead = 0;

    this.input.on('pointerup', () => {
      if (music.isPlaying) {
        music.pause();
      } else {
        music.resume();
      }
    });

    // Keyboard setup
    [keyCodes.ENTER, keyCodes.A, keyCodes.UP, keyCodes.DOWN].forEach((k: number) => this.input.keyboard!.addKey(k));
  }

  public update(): void {
    const {
      [keyCodes.A]: A,
      [keyCodes.ENTER]: ENTER,
      [keyCodes.DOWN]: DOWN,
      [keyCodes.UP]: UP,
    } = this.input.keyboard!.keys;
    const { bpm } = this.metronome;
    const FPS = 60;
    const initialTimer = (FPS * 60) / bpm;
    if (A.isDown) {
      this.conductor.sound.play();
      this.conductor.reset();
    }
    this.conductor.update(() => {
      this.fillColor = [0, 0.5, 1];
    });
    this.metronome.update((beatIndex) => {
      this.beats.push({
        position: new Vector2(350, 50),
        timer: initialTimer,
        state: beatIndex % 4 === 1 ? '' : 'pass',
      });
      // this.synth.triggerAttackRelease('C2', '16n');
    });
    if (Phaser.Input.Keyboard.JustDown(ENTER) && this.lastPress === -1 && this.beats.length >= 2) {
      // this.lastPress = this.sound.get<PhaserSound>('theme').seek;
      const offset = this.metronome.getOffsetFromClosestBeat(Date.now() / 1000);
      const targetBeat = this.beats
        .filter((beat) => !beat.state)
        .reduce((prev, beat) => {
          return !prev || Math.abs(beat.timer) < Math.abs(prev.timer) ? beat : prev;
        }, null);
      if (targetBeat) {
        if (Math.abs(offset) <= 1) {
          targetBeat.state = 'perfect';
          this.synth2.triggerAttackRelease('F4', '16n');
        } else if (Math.abs(offset) <= 3) {
          targetBeat.state = 'good';
          this.synth.triggerAttackRelease('F3', '16n');
        } else {
          targetBeat.state = 'bad';
          this.synth.triggerAttackRelease('F2', '16n');
        }
      }
      console.log(this.metronome.getOffsetFromClosestBeat(Date.now() / 1000));
    }
    const color = parseInt(
      '0x' +
        this.fillColor
          .map((i) =>
            Math.ceil(i * 255)
              .toString(16)
              .padStart(2, '0')
          )
          .join(''),
      16
    );
    this.beats.forEach((beat, i) => {
      this.beats[i].timer -= 1;
      let color;
      switch (beat.state) {
        case 'bad':
          color = 0xff0000;
          break;
        case 'good':
          color = 0x0000ff;
          break;
        case 'perfect':
          color = 0x00ff00;
          break;
        default:
          color = 0xffffff;
          break;
      }
      this.debugDraw.circle(
        { x: beat.position.x, y: beat.position.y + (initialTimer - beat.timer) * 3, r: beat.state === 'pass' ? 5 : 15 },
        { fill: { color } }
      );
      beat.state !== 'pass' &&
        this.debugDraw.circle(
          {
            x: beat.position.x,
            y: beat.position.y + (initialTimer - beat.timer) * 3,
            r: Math.max(((75 - 15) / initialTimer) * beat.timer + 15, 15),
          },
          { lineWidth: 3 }
        );
    });
    this.beats = this.beats.filter((b) => b.timer >= -100);
    this.debugDraw.line(0, 3 * initialTimer + 50, 800, 3 * initialTimer + 50, {});
    this.debugDraw.rect({ x: 50, y: 100, width: 60, height: 60 }, { fill: { color }, lineWidth: 3 });
    this.debugDraw.circle({ x: 50, y: 50, r: 15 }, { fill: { color } });
    this.fillColor = this.fillColor.map((i) => Math.max(i - 0.01, 0.01));

    if (Phaser.Input.Keyboard.JustDown(UP)) {
      this.metronome.bpm += 5;
    } else if (Phaser.Input.Keyboard.JustDown(DOWN)) {
      this.metronome.bpm -= 5;
    }
  }

  public get debugDraw(): DebugDrawPlugin {
    return (<any>this.sys).debugDraw;
  }
}
const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.CANVAS,
  // parent: 'phaser-example',
  width: 800,
  height: 600,
  render: {
    pixelArt: true,
  },
  scene: new Scene(),
  input: {
    gamepad: true,
  },
  plugins: {
    scene: [
      { key: 'debugDraw', plugin: DebugDrawPlugin, mapping: 'debugDraw' },
      // { key: 'GI', plugin: GameInputPlugin, mapping: 'GI' },
      // { key: 'keyboard', plugin: KeyboardPluginPS, mapping: 'keyboard' }
    ],
  },
};

new Phaser.Game(gameConfig);
