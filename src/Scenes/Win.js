class Win extends Phaser.Scene {
    
    constructor(){
        super("Win");

    }

    preload() {
    }

    create() {
        // Pixelify Sans

        respawnX=game.config.width/4;
        respawnY=game.config.height/4;

        
        var style = { font: "32px Verdana", fill: "#ffffff", align: "center" };
        var mainLabel = this.add.text(canvas_x/2 - 110, canvas_y/2, "You Win!!", style);
        
        
        style = { font: "24px Verdana", fill: "#ffffff", align: "center" };
        var score_text = this.add.text(canvas_x/2 - 110, canvas_y/2 + 50, "Score: " + score, style);
        var deaths_text = this.add.text(canvas_x/2 - 110, canvas_y/2 + 80, "Deaths: " + deaths, style);
        
        style = { font: "16px Verdana", fill: "#ffffff", align: "center" };
        var message = this.add.text(canvas_x/2 - 90, canvas_y - 60, "press SPACE to restart", style);

        var spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        spaceBar.on('down', (event) => { this.scene.start('platformerScene'); })
        var restartKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        restartKey.on('down', (event) => { this.scene.start('platformerScene'); })
    }

    update() {

    }
}