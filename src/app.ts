import { DebugDrawPlugin } from '@lawsumisu/phaser';
import { GameInput, GameInputPlugin } from 'src/gameInput.plugin';
import * as Phaser from 'phaser';
import { Metronome } from 'src/conductor';
import * as Tone from 'tone';
import { Vector2 } from '@lawsumisu/common-utilities';

type PhaserSound = Phaser.Sound.HTML5AudioSound | Phaser.Sound.NoAudioSound | Phaser.Sound.WebAudioSound;

class Scene extends Phaser.Scene {
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
    this.sound.add('theme');
    const bpm = 133;
    this.metronome = new Metronome(bpm);
    Tone.getContext().lookAhead = 0;
  }

  public update(): void {
    const sound = this.sound.get<PhaserSound>('theme');
    const inputHistory = this.gameInput.for(0);
    const { bpm } = this.metronome;
    const FPS = 60;
    const initialTimer = (FPS * 60) / bpm;
    if (inputHistory.isInputPressed(GameInput.INPUT3)) {
      sound.play();
      this.metronome.start(() => sound.seek);
    } else if (inputHistory.isInputPressed(GameInput.INPUT4)) {
      sound.isPlaying ? sound.pause() : sound.resume();
    }
    sound.isPlaying &&
      this.metronome.update((beatIndex) => {
        this.fillColor = [0, 0.5, 1];
        if (beatIndex >= 3) {
          this.beats.push({
            position: new Vector2(350, 50),
            timer: initialTimer,
            state: beatIndex % 4 === 3 ? '' : 'pass',
          });
        }
        // this.synth.triggerAttackRelease('C2', '16n');
      });
    if (inputHistory.isInputPressed(GameInput.INPUT1) && this.lastPress === -1 && this.beats.length >= 2) {
      // this.lastPress = this.sound.get<PhaserSound>('theme').seek;
      const offset = this.metronome.getOffsetFromClosestBeat();
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
      console.log(this.metronome.getOffsetFromClosestBeat());
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
      if (sound.isPlaying) {
        this.beats[i].timer -= 1;
      }
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

    // if (Phaser.Input.Keyboard.JustDown(UP)) {
    //   this.metronome.bpm += 5;
    // } else if (Phaser.Input.Keyboard.JustDown(DOWN)) {
    //   this.metronome.bpm -= 5;
    // }
    // sound.rate = this.metronome.bpm / 133;
  }
  public get debugDraw(): DebugDrawPlugin {
    return (<any>this.sys).debugDraw;
  }

  public get gameInput(): GameInputPlugin {
    return (<any>this.sys).GI;
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
      { key: 'GI', plugin: GameInputPlugin, mapping: 'GI' },
    ],
  },
};

new Phaser.Game(gameConfig);
