class Menu extends Phaser.Scene {
    
    constructor(){
        super("Menu");

    }

    preload() {
    }

    create() {
        // Pixelify Sans
        var style = { font: "32px Verdana", fill: "#ffffff", align: "center" };
        var mainLabel = this.add.text(canvas_x/2 - 130, canvas_y/2 - 90, "Gem Defender", style);
        
        let o = this.physics.add.staticSprite(canvas_x/2, canvas_y/2, "GEM8PURPLE", "GEM8PURPLE_0_0.png").setScale(4);
        o.anims.play('GEM8PURPLE_idle', true);

        style = { font: "12px Verdana", fill: "#ffffff", align: "center" };
        this.add.text(canvas_x/2 - 120, canvas_y/2 +60, "Controls: Arrow keys to move\nZ to attack, R to restart, Q to quit", style);
        
        style = { font: "16px Verdana", fill: "#ffffff", align: "center" };
        var message = this.add.text(canvas_x/2 - 90, canvas_y - 60, "press SPACE to play", style);
        this.add.text(canvas_x/2 - 90, canvas_y - 30, "press C for Credits", style);

        var spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        spaceBar.on('down', (event) => { this.scene.start('Game'); })
        var restartKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        restartKey.on('down', (event) => { this.scene.start('Game'); })
        var creditsKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
        creditsKey.on('down', (event) => { this.scene.start('Credits'); })
        var menuKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
        menuKey.on('down', (event) => { this.scene.start('Menu'); })
    }

    update() {

    }
}