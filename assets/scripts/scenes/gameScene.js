const PLAYER_FRAME_WIDTH = 63;
const PLAYER_FRAME_HEIGHT = 63;
const STAR_FRAME_WIDTH = 32;
const STAR_FRAME_HEIGHT = 32;

// Hex color codes: Red, Orange, Yellow, Green, Blue, Indigo, Violet


//SOMEHOW THE YELLOW HEX CODE TURNS INTO GREEN FOR SOMEREASON MIGHT BE FROM MY PLAYER SPRITE!!!!

const PLAYER_COLORS = [0xff0000, 0xff5733, 0xFFE500, 0x00ff00, 0x0000ff, 0x4b0082, 0xee82ee];

class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.player = null;
        this.stars = null;
        this.bombs = null;
        this.platforms = null;
        this.cursors = null;
        this.scoreText = null;
        this.starsCollectedText = null;
        
        this.score = 0;
        this.starsCollected = 0;
        this.starsForScaleBoost = 0;
        this.currentColorIndex = 0;
        this.gameOver = false;
    }

    preload() {
        this.load.image('game_background', 'assets/images/background.png');
        this.load.spritesheet('player_char', 'assets/images/player_spritesheet.png', { 
            frameWidth: PLAYER_FRAME_WIDTH, 
            frameHeight: PLAYER_FRAME_HEIGHT 
        });
        this.load.spritesheet('star_collectible', 'assets/images/star_spritesheet.png', { 
            frameWidth: STAR_FRAME_WIDTH, 
            frameHeight: STAR_FRAME_HEIGHT 
        });
        this.load.image('bomb_hazard', 'assets/images/bomb.png');
        
        this.load.image('new_platform_tile', 'assets/images/platform_tile_dark.png'); // Your new repeating tile
    }

    create() {
        // Reset state for potential restarts
        this.score = 0;
        this.starsCollected = 0;
        this.starsForScaleBoost = 0;
        this.currentColorIndex = 0;
        this.gameOver = false;

        this.add.image(0, 0, 'game_background').setOrigin(0, 0).setDisplaySize(config.width, config.height);

    
        
        // Platforms 
        this.platforms = this.physics.add.staticGroup();

        
        const groundHeight = 54; 
        let ground = this.add.tileSprite(
            config.width / 2,                
            config.height - (groundHeight / 2),
            config.width,                    
            groundHeight,                    
            'new_platform_tile'
        );
        this.platforms.add(ground); 

        
        const platformHeight = 54; 

        let plat1Width = 128 * 2;
        let plat1 = this.add.tileSprite(
            config.width * 0.75,     
            config.height * 0.65,    
            plat1Width,             
            platformHeight,         
            'new_platform_tile'
        );
        this.platforms.add(plat1);

        let plat2Width = 128 * 1.5;
        let plat2 = this.add.tileSprite(
            config.width * 0.2,      
            config.height * 0.45,    
            plat2Width,              
            platformHeight,         
            'new_platform_tile'
        );
        this.platforms.add(plat2);
        
        let plat3Width = 128 * 2.5;
        let plat3 = this.add.tileSprite(
            config.width * 0.5,      
            config.height * 0.25,    
            plat3Width,               
            platformHeight,           
            'new_platform_tile'
        );
        this.platforms.add(plat3);

        // Player
        this.player = this.physics.add.sprite(100, config.height - 150, 'player_char');
        this.player.setBounce(0.1);
        this.player.setCollideWorldBounds(true);
        this.player.setTint(PLAYER_COLORS[this.currentColorIndex]);
        
        const playerVisualScale = 2; 
        this.player.setScale(playerVisualScale);

        
        const hitboxWidth = PLAYER_FRAME_WIDTH * 0.5; 
        const hitboxHeight = PLAYER_FRAME_HEIGHT * 0.6;

        this.player.body.setSize(hitboxWidth, hitboxHeight);

        
        const offsetX = (PLAYER_FRAME_WIDTH - hitboxWidth) / 2;
        const offsetY = (PLAYER_FRAME_HEIGHT - hitboxHeight) / 2; //

        this.player.body.setOffset(offsetX, offsetY);

        // Player animations
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('player_char', { start: 26, end: 36 }),
            frameRate: 9,
            repeat: -1
        });
        this.anims.create({
            key: 'turn',
            frames: this.anims.generateFrameNumbers('player_char', { start: 39, end: 42 }),
            frameRate: 3,
            repeat: -1
        });
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('player_char', { start: 26, end: 36 }),
            frameRate: 9,
            repeat: -1
        });

        // Star collectible animation
        this.anims.create({
            key: 'star_spin',
            frames: this.anims.generateFrameNumbers('star_collectible', { start: 0, end: 11 }),
            frameRate: 12,
            repeat: -1
            
        });

        // Input
        this.cursors = this.input.keyboard.createCursorKeys();

        // Stars group
        this.stars = this.physics.add.group({});
        for (let i = 0; i < 8; i++) {
            this.spawnStar();
        }
        
        // Bombs group
        this.bombs = this.physics.add.group();
        this.spawnBomb();

        // UI Texts
        this.scoreText = this.add.text(16, 16, 'Score: 0', { 
            fontSize: '32px', 
            fill: '#FFFF00',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        });
        this.starsCollectedText = this.add.text(config.width - 400, 16, 'Stars Collected: 0', { 
            fontSize: '32px', 
            fill: '#FFFFFF',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3 
        }).setOrigin(0,0);

        // Colliders
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.stars, this.platforms);
        this.physics.add.collider(this.bombs, this.platforms);

        this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);
        this.physics.add.overlap(this.player, this.bombs, this.hitBomb, null, this);
    }

    update() {
        if (this.gameOver) {
            return;
        }

        // Player movement
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-200);
            this.player.anims.play('left', true);
            this.player.flipX = true;
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(200);
            this.player.anims.play('right', true);
            this.player.flipX = false;
        } else {
            this.player.setVelocityX(0);
            this.player.anims.play('turn', true);
        }

        if (this.cursors.up.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-420); 
        }

    }
    //star spawning
    spawnStar() {
        const x = Phaser.Math.Between(50, config.width - 50);
        const y = Phaser.Math.Between(0, config.height / 3);
        let star = this.stars.create(x, y, 'star_collectible');
        const starScale = 1.3; 
        star.setScale(starScale);

        star.setBounceY(Phaser.Math.FloatBetween(0.3, 0.5));
        star.setCollideWorldBounds(true);
        star.anims.play('star_spin', true);
        star.body.allowGravity = true;
        

    }

    spawnBomb() {
        const x = (this.player.x < config.width / 2) ? 
                  Phaser.Math.Between(config.width / 2, config.width - 50) : 
                  Phaser.Math.Between(50, config.width / 2);
        let bomb = this.bombs.create(x, 20, 'bomb_hazard');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-150, 150), 20);
        bomb.body.allowGravity = true;
    }

    collectStar(player, star) {
        star.disableBody(true, true);

        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);

        this.starsCollected++;
        this.starsCollectedText.setText('Stars Collected: ' + this.starsCollected);
        
        this.starsForScaleBoost++;
        if (this.starsForScaleBoost >= 5) {
            this.starsForScaleBoost = 0;
            let currentScaleX = player.scaleX;
            let currentScaleY = player.scaleY;

            player.setScale(currentScaleX * 1.10, currentScaleY * 1.10);
        }

        this.currentColorIndex = (this.currentColorIndex + 1) % PLAYER_COLORS.length;
        player.setTint(PLAYER_COLORS[this.currentColorIndex]);

        this.spawnStar();

        if (this.starsCollected % Phaser.Math.Between(3,6) === 0) {
            this.spawnBomb();
        }
    }

    hitBomb(player, bomb) {
        this.physics.pause();
        player.setTint(0xff0000);
        player.anims.stop();
        player.disableBody(true, true);
        
        this.gameOver = true;

        // Display "GAME OVER" message
        this.add.text(config.width / 2, config.height / 2 - 60, 'GAME OVER', { 
            fontSize: '72px', 
            fill: '#ff0000', 
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);

        // Display "Click to Restart" message
        this.add.text(config.width / 2, config.height / 2 + 20, 'Click to Restart', { 
            fontSize: '32px', 
            fill: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        // Display "Press ESC for Main Menu" message
        this.add.text(config.width / 2, config.height / 2 + 70, 'Press ESC for Main Menu', { 
            fontSize: '32px', 
            fill: '#ffffff', 
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Listener for mouse click to restart
        this.input.once('pointerdown', () => {
            if (this.gameOver) { 
                this.scene.restart();
            }
        });

        //Listener for ESC key press
        this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

        this.escKey.once('down', () => {
            if (this.gameOver) { 
                
                if (this.sys.game.backgroundMusicInstance && this.sys.game.isMusicPlaying) {
                    
                }
                
                this.scene.start('MenuScene');
            }
        });
    }
}