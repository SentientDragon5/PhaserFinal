class Game extends Phaser.Scene {
    constructor() {
        super("Game");
    }

    init() {
        // variables and settings
        this.ACCELERATION = 3500;
        this.DRAG = 7000;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 2000;
        this.JUMP_VELOCITY = -600;
        this.MAX_SPEED = 350;
        this.JUMP_SUSUTAIN = 21;

        this.dead = false;

        this.frame = 0;
    }

    create() {
        this.physics.world.drawDebug = false;


        // my.sprite.gem = this.physics.add.staticSprite(50*16*0.5, 24*16, "GEM8PURPLE", "GEM8PURPLE_0_0.png").setScale(SCALE);
        // this.physics.add.collider(my.sprite.player, my.sprite.gem);

        let mapW = 64;
        let mapH = 32;
        this.map = this.add.tilemap("tilemap_tiled", 16, 16, mapW, mapH);

        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("Dungeon Ruins Tileset Night", "tilemap_packed");

        this.bgfLayer = this.map.createLayer("BackgroundFar", this.tileset, 0, 0);
        this.bgLayer = this.map.createLayer("Background", this.tileset, 0, 0);


        // set up player avatar
        console.log("load respawn "+respawnX + " " + respawnY);
        my.sprite.player = this.physics.add.sprite(respawnX, respawnY, "Hero_Knight", "Attack1_0_0.png").setScale(SCALE);
        my.sprite.player.setCollideWorldBounds(true);
        my.sprite.player.setBodySize(30, 48);
        my.sprite.player.on('animationcomplete', () => my.sprite.player.attacking = false);

        // Create a layer
        this.groundLayer = this.map.createLayer("Ground", this.tileset, 0, 0);
        this.groundLayer.setScale(SCALE);
        this.groundLayer.setCollisionByProperty({
            collides: true
        });

        this.physics.add.collider(my.sprite.player, this.groundLayer);

        this.groundLayer.forEachTile((tile) => {
            if (tile.properties.platform) {
                tile.setCollision(false, false, true, false);
            }
        });


        this.propsLayer = this.map.createLayer("Props", this.tileset, 0, 0);

        
        // this.platformLayer = this.map.createLayer("Platforms", this.tileset, 0, 0);
        // this.platformLayer.setScale(SCALE);
        // this.platformLayer.setCollisionByProperty({
        //     collides: true
        // });
        // this.physics.add.collider(my.sprite.player, this.platformLayer);
        // this.platformLayer.forEachTile((tile) => {
        //     if (tile.properties.platform) {
        //         tile.setCollision(false, false, true, false);
        //     }
        // });


        // Enable collision handling


        // this.gems = this.map.createFromObjects("Gems", {
        //     name: "Gem",
        //     key: "tilemap_sheet",
        //     frame: 62
        // });
        // this.gems.map((obj) => {
        //     obj.x *= SCALE;
        //     obj.y *= SCALE;
        //     obj.setScale(SCALE);
        // });
        // this.physics.world.enable(this.gems, Phaser.Physics.Arcade.STATIC_BODY);
        // this.gemGroup = this.add.group(this.gems);
        // this.physics.add.overlap(my.sprite.player, this.gemGroup, (obj1, obj2) => {
        //     obj2.destroy(); // remove coin on overlap
        //     score++;
        // });
        // this.objects = this.physics.add.group({
        //     classType: Lizard,
        //     createCallback: (go) => {
        //         const 
        //     }
        // })
        // this.objectGroup = this.add.group();
        this.portals = [];
        this.gems = [];
        this.map.getObjectLayer("Objects").objects.forEach(e => {
            console.log(e);
            if(e.name == "Gem"){
                let o = this.physics.add.staticSprite(e.x,e.y, "GEM8PURPLE", "GEM8PURPLE_0_0.png").setScale(SCALE);
                this.physics.add.collider(my.sprite.player, o);
                o.anims.play('GEM8PURPLE_idle', true);
                this.gems.push(o);
            } else {
                let o = this.physics.add.staticSprite(e.x,e.y, "Dimensional_Portal", "Dimensional_Portal_0.png").setScale(SCALE);
                this.physics.add.collider(my.sprite.player, o);
                o.anims.play('Dimensional_Portal_idle', true);
                this.portals.push(o);
            }
            
        });
        

        // this.objects = this.map.createFromObjects("Objects", {
        //     name: "Portal",
        //     key: "tilemap_sheet",
        //     frame: 103
        // });
        // this.objects.map((obj) => {
        //     obj.x *= SCALE;
        //     obj.y *= SCALE;
        //     obj.setScale(SCALE);
        // });

        // this.physics.world.enable(this.objects, Phaser.Physics.Arcade.STATIC_BODY);
        // this.objectsGroup = this.add.group(this.objects);
        // this.physics.add.collider(my.sprite.player, this.objectsGroup);
        


        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        // debug key listener (assigned to D key)
        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
        }, this);

        this.input.keyboard.on('keydown-R', () => {
            this.death();
        }, this);

        this.input.keyboard.on('keydown-Z', () => {
            my.sprite.player.attacking = true;
        }, this);
        

        this.cameras.main.setBounds(0, 0, PPU*mapW*SCALE, PPU*mapH*SCALE);
        this.physics.world.setBounds(0,0,PPU*mapW*SCALE,PPU*mapH*SCALE);

        this.cameras.main.startFollow(my.sprite.player);
    }

    death(){
        if(!this.dead){
            this.poof(my.sprite.player.x,my.sprite.player.y);
            this.dead= true;
            this.time.delayedCall(200,()=>this.scene.start("platformerScene"));
            deaths++;
        }
    }

    update() {
        if(!this.dead){
            if(my.sprite.player.attacking){
                my.sprite.player.body.setAccelerationX(0);
                my.sprite.player.body.setDragX(this.DRAG);
            } else if(cursors.left.isDown) {
                my.sprite.player.body.setAccelerationX(-this.ACCELERATION);
                if(my.sprite.player.body.velocity.x < -this.MAX_SPEED) my.sprite.player.setVelocity(-this.MAX_SPEED,my.sprite.player.body.velocity.y);
                
                my.sprite.player.setFlip(true, false);


                // my.vfx_walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);
                // my.vfx_walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
                if (my.sprite.player.body.blocked.down) {
                    // my.vfx_walking.start();
                }
    
            } else if(cursors.right.isDown) {
                my.sprite.player.body.setAccelerationX(this.ACCELERATION);
                if(my.sprite.player.body.velocity.x > this.MAX_SPEED) my.sprite.player.setVelocity(this.MAX_SPEED,my.sprite.player.body.velocity.y);
    
                my.sprite.player.resetFlip();

                // my.vfx_walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);
                // my.vfx_walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
                if (my.sprite.player.body.blocked.down) {
                    // my.vfx_walking.start();
                }
    
            } else {
                my.sprite.player.body.setAccelerationX(0);
                my.sprite.player.body.setDragX(this.DRAG);

                // my.vfx_walking.stop();
            }
    
            // player jump
            // note that we need body.blocked rather than body.touching b/c the former applies to tilemap tiles and the latter to the "ground"
            if(!my.sprite.player.body.blocked.down) {

                // my.vfx_walking.stop();
            }
            if(my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up)) {
                my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);

                // this.jumpsfx.play();
            }
            if(my.sprite.player.body.velocity.y < 0 && cursors.up.isDown){
                my.sprite.player.body.velocity.y -= this.JUMP_SUSUTAIN;
            }
            if(my.sprite.player.body.velocity.y < 0 && cursors.down.isDown){
                my.sprite.player.body.velocity.y += this.JUMP_SUSUTAIN;
            }

            // update anim
            if(my.sprite.player.attacking){
                my.sprite.player.anims.play('Hero_Knight_attack', true);
            } else if(!my.sprite.player.body.blocked.down) {
                if(my.sprite.player.body.velocity.y < 0){
                    my.sprite.player.anims.play('Hero_Knight_jump');
                }
                else{
                    my.sprite.player.anims.play('Hero_Knight_fall');
                }
            } else if(cursors.left.isDown) {
                my.sprite.player.setFlip(true, false);
                my.sprite.player.anims.play('Hero_Knight_walk', true);
            } else if(cursors.right.isDown) {
                my.sprite.player.resetFlip();
                my.sprite.player.anims.play('Hero_Knight_walk', true);
            } else {
                my.sprite.player.anims.play('Hero_Knight_idle',true);
            }
    
            // my.sprite.gem.anims.play('GEM8PURPLE_idle', true);
            
        }

        // var tile = this.groundLayer.getTileAtWorldXY(my.sprite.player.x,my.sprite.player.y);
        // if(tile != null){
        //     if(tile.properties.gem){
        //         this.gems++;
        //         this.groundLayer.removeTileAtWorldXY(my.sprite.player.x,my.sprite.player.y);
        //     }
        //     if(tile.properties.danger){
        //         this.death();
        //     }

        //     if(tile.properties.respawn){
        //         var pos = this.cameras.main.getWorldPoint(my.sprite.player.x,my.sprite.player.y);
        //         if(respawnX != tile.getCenterX(this.cameras.main) && respawnY != tile.getCenterY(this.cameras.main)){
        //             respawnX = tile.getCenterX(this.cameras.main);
        //             respawnY = tile.getCenterY(this.cameras.main);
        //             console.log("set respawn "+respawnX + " " + respawnY);
        //             this.poof(respawnX,respawnY);
        //         }
        //     }
        // }

        this.frame++;
    }
}