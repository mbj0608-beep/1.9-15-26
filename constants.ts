
export const ASSETS = {
  BACKGROUND: 'https://gz-vchar-pub.nosdn.127.net/4bab7961-263d-4658-846a-a41d413e809e.png',
  PLAYER: 'https://gz-vchar-pub.nosdn.127.net/afec0fd8-fde5-41b2-9b14-873d76f37608.png',
  ENEMY1: 'https://gz-vchar-pub.nosdn.127.net/31f53d7b-ec35-4262-a9ce-46c7aea5e1de.png',
  ENEMY2: 'https://gz-vchar-pub.nosdn.127.net/b2bfaa0c-a25f-402e-8f62-d98daad29289.png',
  ENEMY3: 'https://gz-vchar-pub.nosdn.127.net/c9a1152b-587a-4054-aa8e-845ca2be46c5.png',
};

export const GAME_WIDTH = 450;
export const GAME_HEIGHT = 800;

export const STAGE_LENGTH = 30000; // 30 seconds per stage

export const ENEMY_CONFIGS = [
  { type: 1, width: 50, height: 50, hp: 2, speed: 2.2, scoreValue: 100, fireRate: 2000, asset: ASSETS.ENEMY1 },
  { type: 2, width: 65, height: 65, hp: 5, speed: 1.8, scoreValue: 250, fireRate: 1500, asset: ASSETS.ENEMY2 },
  { type: 3, width: 85, height: 85, hp: 10, speed: 1.2, scoreValue: 500, fireRate: 3000, asset: ASSETS.ENEMY3 },
];
