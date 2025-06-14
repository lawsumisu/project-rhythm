import * as Phaser from 'phaser';

const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.WEBGL,
  // parent: 'phaser-example',
  width: 800,
  height: 600,
  render: {
    antialias: false,
  },
  scene: {
    preload,
    create,
  },
  input: {
    gamepad: true,
  },
  plugins: {
    scene: [
      // { key: 'debugDraw', plugin: DebugDrawPlugin, mapping: 'debugDraw' },
      // { key: 'GI', plugin: GameInputPlugin, mapping: 'GI' },
      // { key: 'keyboard', plugin: KeyboardPluginPS, mapping: 'keyboard' }
    ],
  },
};

new Phaser.Game(gameConfig);

function preload(this: Phaser.Scene) {
  // this.load.image('logo', logoImg);
}

function create(this: Phaser.Scene) {
  const logo = this.add.image(400, 150, 'logo');

  this.tweens.add({
    targets: logo,
    y: 450,
    duration: 2000,
    ease: 'Power2',
    yoyo: true,
    loop: -1,
  });
}