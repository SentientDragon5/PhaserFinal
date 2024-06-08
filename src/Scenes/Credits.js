class Credits extends Phaser.Scene {
    
    constructor(){
        super("Credits");

    }

    preload() {
        
    }

    create() {
        // Pixelify Sans
        var style = { font: "32px Verdana", fill: "#ffffff", align: "center" };
        var mainLabel = this.add.text(canvas_x/2 - 70, canvas_y/2-110, "Credits", style);
        
        style = { font: "8px Verdana", fill: "#ffffff", align: "center" };
        let y_offset = 0;

        let credits = [
        // "raccoontruck.itch.io/fluttering-tiger-moth",
        "luizmelo.itch.io/martial-hero-2",
        "luizmelo.itch.io/martial-hero",
        "luizmelo.itch.io/hero-knight",
        "luizmelo.itch.io/fantasy-warrior",
        "penusbmic.itch.io/free-dungeon-ruins-tileset",
        "karsiori.itch.io/free-pixel-art-gem-pack",
        "pixabay.com/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=36274",
        "pixabay.com/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=12809",
        "pixabay.com/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=43790",
        "pixabay.com/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=142837"
        ]

        credits.forEach(e => {
            this.add.text(110, canvas_y/2 - 50 + y_offset, e, style);
            y_offset += 10;//spacing
        });


        style = { font: "16px Verdana", fill: "#ffffff", align: "center" };
        this.add.text(canvas_x/2 - 90, canvas_y - 90, "press Q for Menu", style);
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