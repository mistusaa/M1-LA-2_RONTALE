class CreditsScene extends Phaser.Scene {
    constructor() {
        super('CreditsScene');
    }

    preload() {
        this.load.image('background', 'assets/images/background.png');
    }

    create() {
        this.add.image(0, 0, 'background').setOrigin(0);
        this.add.text(300, 300, 'FULL NAME: Rovil Jesus Rontale', { fontSize: '32px', fill: '#FFFFFF' });
        this.add.text(300, 350, 'SECTION: A224', { fontSize: '32px', fill: '#FFFFFF' });
        this.add.text(300, 400, 'PROGRAM: EMC', { fontSize: '32px', fill: '#FFFFFF' });

        const backBtn = this.add.text(550, 500, 'BACK', { fontSize: '36px', fill: '#FF0000' });
        backBtn.setInteractive().on('pointerdown', () => this.scene.start('MenuScene'));
    }
}
