import { DebugDrawPlugin } from '@lawsumisu/phaser';
import * as Phaser from 'phaser';
import { Conductor } from 'src/conductor';

const keyCodes = Phaser.Input.Keyboard.KeyCodes;

class Scene extends Phaser.Scene {
  private conductor: Conductor;
  private fillColor = 0;

  public preload(): void {
    this.load.audio('theme', 'assets/audio/cryptic_marble.ogg');
  }
  public create(): void {
    const music = this.sound.add('theme');
    this.conductor = new Conductor(music, 134, 0);

    this.input.on('pointerup', () => {
      if (music.isPlaying) {
        music.pause();
      } else {
        music.resume();
      }
    });
  }

  public update(): void {
    if (this.input.keyboard!.addKey(keyCodes.A).isDown) {
      this.conductor.sound.play();
      this.conductor.reset();
    }
    this.conductor.update(() => {
      this.fillColor = parseInt(
        '0x' + [Math.random(), Math.random(), Math.random()].map((i) => Math.ceil(i * 255).toString(16)).join(''),
        16
      );
    });
    this.debugDraw.circle({ x: 50, y: 50, r: 15 }, { fill: { color: this.fillColor } });
  }

  public get debugDraw(): DebugDrawPlugin {
    return (<any>this.sys).debugDraw;
  }
}
const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.WEBGL,
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
