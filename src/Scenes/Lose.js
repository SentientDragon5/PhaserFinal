class Win extends Phaser.Scene {
    
    constructor(){
        super("Win");

    }

    preload() {
    }

    create() {
        // Pixelify Sans
        
        var style = { font: "32px Verdana", fill: "#ffffff", align: "center" };
        var mainLabel = this.add.text(canvas_x/2 - 110, canvas_y/2, "You Lose", style);
        
        style = { font: "16px Verdana", fill: "#ffffff", align: "center" };
        var message = this.add.text(canvas_x/2 - 90, canvas_y - 60, "press SPACE to play again", style);
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