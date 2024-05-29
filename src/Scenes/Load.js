class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/");

        // Load characters spritesheet
        this.load.atlas("Hero_Knight_2", "Hero_Knight_2.png", "Hero_Knight_2.json");

        // Load tilemap information
        this.load.image("tilemap_packed", "Dungeon Ruins Tileset Night.png");                         // Packed tilemap
        this.load.tilemapTiledJSON("tilemap_tiled", "ruins_map.tmj");   // Tilemap in JSON

        // this.load.image("particles", "particles.png");  
        // this.load.atlas("particles", "particles.png", "particles.json");

        this.load.spritesheet("tilemap_sheet", "Dungeon Ruins Tileset Night.png", {
            frameWidth: 16,
            frameHeight: 16
        });
    }

    createAnim(character, anim, animName, frames, loop=-1){
        this.anims.create({
            key: character+anim,
            frames: this.anims.generateFrameNames(character, {
                prefix: animName,
                start: 0,
                end: frames,
                suffix: ".png",
                zeroPad: 0
            }),
            frameRate: 15,
            repeat: loop
        });
    }

    create() {
        this.createAnim("Hero_Knight_2","_walk", "Run.png_", 7);
        this.createAnim("Hero_Knight_2","_idle", "Idle.png_", 10);
        this.createAnim("Hero_Knight_2","_jump", "Jump.png_", 2);
        this.createAnim("Hero_Knight_2","_attack", "Attack1.png_", 6,0);

         // ...and pass to the next Scene
         this.scene.start("Game");
    }

    // Never get here since a new scene is started in create()
    update() {
    }
}