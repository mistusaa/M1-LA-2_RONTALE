let config = {
    type: Phaser.AUTO,
    width: 1280, 
    height: 720, 
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 }, 
            debug: false 
        }
    },
    scene: [MenuScene, GameScene, CreditsScene] 
};

let game = new Phaser.Game(config);