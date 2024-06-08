class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/");

        // Load characters spritesheet
        this.load.atlas("Hero_Knight", "Hero_Knight.png", "Hero_Knight.json");
        this.load.atlas("Fantasy_Warrior", "Fantasy_Warrior.png", "Fantasy_Warrior.json");
        this.load.atlas("Martial_1", "Martial_1.png", "Martial_1.json");
        this.load.atlas("Martial_2", "Martial_2.png", "Martial_2.json");

        this.load.atlas("GEM8PURPLE", "GEM8PURPLE.png", "GEM8PURPLE.json");
        this.load.atlas("Dimensional_Portal", "Dimensional_Portal.png", "Dimensional_Portal.json");


        // Load tilemap information
        this.load.image("tilemap_packed", "Dungeon Ruins Tileset Day.png");            
        this.load.image("tilemap_night", "Dungeon Ruins Tileset Night.png");                  // Packed tilemap
        this.load.tilemapTiledJSON("tilemap_tiled", "ruins_map1.tmj");   // Tilemap in JSON
        this.load.tilemapTiledJSON("tilemap_tiled2", "ruins_map2.tmj");

        this.load.atlas("particles", "particles.png", "particles.json");

        this.load.spritesheet("tilemap_sheet", "Dungeon Ruins Tileset Night.png", {
            frameWidth: 16,
            frameHeight: 16
        });

        // sound
        //wind-blowing-sfx-12809.mp3
        this.load.audio('music', "medieval-fantasy-142837.mp3");
        this.load.audio('slashSFX', "sword-sound-2-36274.mp3");
        this.load.audio('landSFX', "land2-43790.mp3");
    }

    createAnim(character, anim, animName, frames,end=".png", loop=-1,frameStart=0,zeroPad=0){
        this.anims.create({
            key: character+anim,
            frames: this.anims.generateFrameNames(character, {
                prefix: animName,
                start: frameStart,
                end: frameStart+frames,
                suffix: end,
                zeroPad: zeroPad
            }),
            frameRate: 15,
            repeat: loop
        });
    }

    create() {
        this.createAnim("Hero_Knight","_walk", "Run_", 7,"_0.png");
        this.createAnim("Hero_Knight","_idle", "Idle_", 10,"_0.png");
        this.createAnim("Hero_Knight","_jump", "Jump_", 2,"_0.png");
        this.createAnim("Hero_Knight","_fall", "Fall_", 2,"_0.png");
        this.createAnim("Hero_Knight","_death", "Death_", 9,"_0.png");
        this.createAnim("Hero_Knight","_attack", "Attack1_", 6,"_0.png",0);
        this.createAnim("Hero_Knight","_hit", "Take Hit_", 2,"_0.png",0);

        this.createAnim("Fantasy_Warrior","_walk", "Run_", 7,"_0.png");
        this.createAnim("Fantasy_Warrior","_idle", "Idle_", 9,"_0.png");
        this.createAnim("Fantasy_Warrior","_jump", "Jump_", 2,"_0.png");
        this.createAnim("Fantasy_Warrior","_fall", "Fall_", 2,"_0.png");
        this.createAnim("Fantasy_Warrior","_death", "Death_", 6,"_0.png");
        this.createAnim("Fantasy_Warrior","_attack", "Attack1_", 6,"_0.png",0);
        this.createAnim("Fantasy_Warrior","_hit", "Take hit_", 2,"_0.png",0);
        
        this.createAnim("Martial_1","_walk", "Run_", 7,"_0.png");
        this.createAnim("Martial_1","_idle", "Idle_", 7,"_0.png");
        this.createAnim("Martial_1","_jump", "Jump_", 1,"_0.png");
        this.createAnim("Martial_1","_fall", "Fall_", 1,"_0.png");
        this.createAnim("Martial_1","_death", "Death_", 5,"_0.png");
        this.createAnim("Martial_1","_attack", "Attack1_", 5,"_0.png",0);
        this.createAnim("Martial_1","_hit", "Take Hit_", 2,"_0.png",0);

        this.createAnim("Martial_2","_walk", "Run_", 7,"_0.png");
        this.createAnim("Martial_2","_idle", "Idle_", 3,"_0.png");
        this.createAnim("Martial_2","_jump", "Jump_", 1,"_0.png");
        this.createAnim("Martial_2","_fall", "Fall_", 1,"_0.png");
        this.createAnim("Martial_2","_death", "Death_", 5,"_0.png");
        this.createAnim("Martial_2","_attack", "Attack1_", 3,"_0.png",0);
        this.createAnim("Martial_2","_hit", "Take hit_", 2,"_0.png",0);

        this.createAnim("GEM8PURPLE","_idle", "GEM8PURPLE_", 9,"_0.png");
        this.createAnim("Dimensional_Portal","_idle", "Dimensional_Portal_", 5,".png");


        this.createAnim("particles","0", "tile_", 4,".png",-1,0,4);
        this.createAnim("particles","1", "tile_", 4,".png",-1,4,4);
        this.createAnim("particles","2", "tile_", 4,".png",-1,8,4);
        this.createAnim("particles","3", "tile_", 4,".png",-1,11,4);
        
         // ...and pass to the next Scene
         this.scene.start("Menu");
    }

    // Never get here since a new scene is started in create()
    update() {
    }
}