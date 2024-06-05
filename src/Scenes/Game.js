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

        this.ENEMY_SPEED = 80;
        this.ENEMY_ATTACK_DIST = 60;

        this.dead = false;

        this.frame = 0;
    }
    dist(x1,y1,x2,y2){
        return Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
    }
    distobjs(o1,o2){
        return this.dist(o1.x,o1.y,o2.x,o2.y);
    }

    createHealthbar(parent){
        parent.hbmw = 20
        parent.healthbarbg = this.add.rectangle(parent.x, parent.y - 25, 21, 5, 0x5c5c5c, 1);
        parent.healthbar = this.add.rectangle(parent.x, parent.y - 25, parent.hbmw, 4, 0xd66c65, 1);
    }

    updateHealthbar(parent){
        parent.healthbar.x = parent.x
        parent.healthbar.y = parent.y - 25;
        parent.healthbar.width = 0+(parent.hp-0) * (parent.hbmw-0) / (parent.mhp-0)
        parent.healthbarbg.x = parent.x;
        parent.healthbarbg.y = parent.y - 25;
    }

    destroyHealthbar(parent){
        parent.healthbarbg.destroy();
        parent.healthbar.destroy();
    }

    createEnemy(x,y){
        let enemy = this.physics.add.sprite(x, y, "Fantasy_Warrior", "Attack1_0_0.png").setScale(SCALE);
        enemy.setCollideWorldBounds(true);
        enemy.setBodySize(30, 40);
        enemy.on('animationcomplete', () => {
            console.log("anim over" +  (enemy.hp))
            
            if(enemy.attacking){
                enemy.attacking = false
            } 
        });

        enemy.target = this.gems[0];
        enemy.attackTimer = 0;

        enemy.mhp = 2;
        enemy.hp = enemy.mhp;
        this.createHealthbar(enemy);

        this.physics.add.collider(enemy, this.groundLayer);
        this.enemies.push(enemy);
    }
    updateEnemy(enemy){
        // AI update

        // mon 1:30 and tues 4-5 

        if(enemy.body.x - enemy.target.x > -this.ENEMY_ATTACK_DIST && enemy.body.x - enemy.target.x < this.ENEMY_ATTACK_DIST){
            if(enemy.attackTimer < 1){
                enemy.attackTimer += 50;
                enemy.attacking = true;
                enemy.body.velocity.x = 0;
                // console.log(enemy.body.x - enemy.target.x + " fight");

                // attack 
                
                this.time.delayedCall(200,()=>{
                    if(enemy != null && enemy.hp > 0){
                        let players = [my.sprite.player];
                        this.attack(enemy, players, 1);
                        this.attack(enemy, this.gems, 1);
                        console.log("attacked");
                    }
                });

            }
        }
        else{
            if(enemy.body.x < enemy.target.x){
                enemy.body.velocity.x = this.ENEMY_SPEED;
                enemy.facingDir = 1;
            } else if(enemy.body.x > enemy.target.x){
                enemy.body.velocity.x = -this.ENEMY_SPEED;
                enemy.facingDir = -1;
            }
            // console.log(enemy.body.x - enemy.target.x + " walk");
        }
        if(enemy.attackTimer > 0){
            enemy.attackTimer -= 1;
        }
        // movement

        // healthbar update
        this.updateHealthbar(enemy);

        // Anim update 
        let enemyName = "Fantasy_Warrior";
        if(enemy.hp <= 0){
            enemy.anims.play(enemyName+'_death',true);
            if(enemy.anims.currentFrame.index > 5){
                this.enemies = this.enemies.filter(function(e) { return e != enemy; }); 
                this.destroyHealthbar(enemy);
                enemy.destroy();
            }
        } else if(enemy.attacking){
            enemy.anims.play(enemyName+'_attack', true);
        } else if(!enemy.body.blocked.down) {
            if(enemy.body.velocity.y < 0){
                enemy.anims.play(enemyName+'_jump');
            }
            else{
                enemy.anims.play(enemyName+'_fall');
            }
        } else if(enemy.body.velocity.x < -0.5) {
            enemy.setFlip(true, false);
            enemy.anims.play(enemyName+'_walk', true);
        } else if(enemy.body.velocity.x > 0.5) {
            enemy.resetFlip();
            enemy.anims.play(enemyName+'_walk', true);
        } else {
            enemy.anims.play(enemyName+'_idle',true);
        }
    }

    createGem(x,y){
        let o = this.physics.add.staticSprite(x,y, "GEM8PURPLE", "GEM8PURPLE_0_0.png").setScale(SCALE);
        // this.physics.add.collider(my.sprite.player, o);
        o.anims.play('GEM8PURPLE_idle', true);

        o.mhp = 12;
        o.hp = o.mhp;
        this.createHealthbar(o);

        this.gems.push(o);
    }
    updateGem(gem){
        this.updateHealthbar(gem);

        if(gem.hp < 1){
            this.gems = this.gems.filter(function(e) { return e != gem; }); 
            this.destroyHealthbar(gem);
            gem.destroy();
        }
    }

    createPortal(x,y){
        let o = this.physics.add.staticSprite(x,y, "Dimensional_Portal", "Dimensional_Portal_0.png").setScale(SCALE);
        // this.physics.add.collider(my.sprite.player, o);
        o.anims.play('Dimensional_Portal_idle', true);
        this.portals.push(o);

        o.spawnTimer = 50;
        o.waitTimes = [50, 100, 10, 10, 200, 10, 10, 10];
        o.i = 0;
    }
    updatePortal(portal){
        if(portal.spawnTimer < 1){
            portal.spawnTimer+=portal.waitTimes[portal.i];
            portal.i++;
            this.createEnemy(portal.x,portal.y);
        }
        else{
            portal.spawnTimer--;
        }
        if(portal.i > portal.waitTimes.length){
            this.portals = this.portals.filter(function(e) { return e != portal; }); 
            portal.destroy();
        }
    }

    attack(me, targets, dmg, range_x=100){
        let range_y = 100;
        let offset_x = 50 * me.facingDir;
        let offset_y = 0;
        targets.forEach(e => {
            if(e.x>me.x+offset_x-range_x*0.5 && e.x<me.x+offset_x+range_x*0.5
                && e.y>me.y+offset_y-range_y*0.5 && e.y<me.y+offset_y+range_y*0.5){
                e.hp -= dmg;
            }
        });
    }

    create() {
        this.physics.world.drawDebug = false;
        // figure out debug

        // my.sprite.gem = this.physics.add.staticSprite(50*16*0.5, 24*16, "GEM8PURPLE", "GEM8PURPLE_0_0.png").setScale(SCALE);
        // this.physics.add.collider(my.sprite.player, my.sprite.gem);

        let mapW = 64;
        let mapH = 32;
        this.map = this.add.tilemap("tilemap_tiled", PPU, PPU, mapW, mapH);

        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("Dungeon Ruins Tileset Night", "tilemap_packed");

        this.bgfLayer = this.map.createLayer("BackgroundFar", this.tileset, 0, 0);
        this.bgLayer = this.map.createLayer("Background", this.tileset, 0, 0);


        // set up player avatar
        // console.log("load respawn "+respawnX + " " + respawnY);
        my.sprite.player = this.physics.add.sprite(mapW*PPU*0.5, mapH*PPU*0.5, "Hero_Knight", "Attack1_0_0.png").setScale(SCALE);
        my.sprite.player.setCollideWorldBounds(true);
        my.sprite.player.setBodySize(30, 48);
        my.sprite.player.on('animationcomplete', () => my.sprite.player.attacking = false);

        my.sprite.player.mhp = 6;
        my.sprite.player.hp = my.sprite.player.mhp;
        this.createHealthbar(my.sprite.player);

        this.enemies = [];

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
                this.createGem(e.x,e.y);
            } else {
                this.createPortal(e.x,e.y);
            }
            
        });
        
        //Debug enemy
        // this.createEnemy(160,80);

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
            if(!my.sprite.player.attacking){
                my.sprite.player.attacking = true;
                // attack
                this.attack(my.sprite.player,this.enemies,2,150);
            }
        }, this);
        

        this.cameras.main.setBounds(0, 0, PPU*mapW*SCALE, PPU*mapH*SCALE);
        this.physics.world.setBounds(0,0,PPU*mapW*SCALE,PPU*mapH*SCALE);

        this.cameras.main.startFollow(my.sprite.player);
    }

    death(){
        if(!this.dead){
            this.poof(my.sprite.player.x,my.sprite.player.y);
            this.dead= true;
            my.sprite.player.anims.play('Hero_Knight_death');
            this.time.delayedCall(200,()=>this.scene.start("Lose"));
            deaths++;
        }
    }

    update() {
        // Lose
        if(my.sprite.player.hp<1 || this.gems.length<1 ){
            this.scene.restart();
        }
        // Win
        if(this.portals.length<1 && this.enemies.length<1){
            this.time.delayedCall(200,()=>this.scene.restart());
            
        }

        this.updateHealthbar(my.sprite.player);
        if(!this.dead){
            if(my.sprite.player.attacking){
                my.sprite.player.body.setAccelerationX(0);
                my.sprite.player.body.setDragX(this.DRAG);
            } else if(cursors.left.isDown) {
                my.sprite.player.body.setAccelerationX(-this.ACCELERATION);
                if(my.sprite.player.body.velocity.x < -this.MAX_SPEED) my.sprite.player.setVelocity(-this.MAX_SPEED,my.sprite.player.body.velocity.y);
                my.sprite.player.facingDir = -1;
                my.sprite.player.setFlip(true, false);


                // my.vfx_walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);
                // my.vfx_walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
                if (my.sprite.player.body.blocked.down) {
                    // my.vfx_walking.start();
                }
    
            } else if(cursors.right.isDown) {
                my.sprite.player.body.setAccelerationX(this.ACCELERATION);
                if(my.sprite.player.body.velocity.x > this.MAX_SPEED) my.sprite.player.setVelocity(this.MAX_SPEED,my.sprite.player.body.velocity.y);
                my.sprite.player.facingDir = 1;
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
                    my.sprite.player.anims.play('Hero_Knight_jump',true);
                }
                else{
                    my.sprite.player.anims.play('Hero_Knight_fall',true);
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
            
            this.enemies.forEach(e => {
                this.updateEnemy(e);
            });

            this.gems.forEach(e => {
                this.updateGem(e);
            });

            this.portals.forEach(e => {
                this.updatePortal(e);
            });
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