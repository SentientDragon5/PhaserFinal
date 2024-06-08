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
        this.JUMP_SUSUTAIN = 18;//21 was too high

        this.ENEMY_ATTACK_DIST = 60;
        this.ENEMY_FORGET_DIST = 400;
        this.ENEMY_ATTACK_DELAY = 300;

        this.dead = false;
        this.lost = false;
        this.frame = 0;
    }
    dist(x1,y1,x2,y2){
        return Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
    }
    distobjs(o1,o2){
        return this.dist(o1.x,o1.y,o2.x,o2.y);
    }
    preload(){

        this.load.image("tilemap_packed", "Dungeon Ruins Tileset Night.png");
    }

    poof(x,y){
        var p = this.add.particles(x,y,'particles',{
            scale: {start: 1, end:1},
            alpha: {start: 1, end:0},
            lifespan: 500,
            frequency: 5,
            speedY: {min:-25,max:10},
            maxParticles: 20,
            speedX: {min:-80,max:80},
            // maxVelocityX: 200,
            // maxVelocityY: 200,
            anim: ["particles0","particles1","particles2","particles3"]
        });

        p.start();
    }

    closestobj(me, list){
        if(list.length < 1){
            return null;
        }
        let max_dist = this.distobjs(me, list[0]);
        let max_obj = list[0]
        list.forEach(e => {
            let dist = this.distobjs(me,e);
            if(dist < max_dist){
                max_obj = e;
                max_dist = dist;
            }
        });
        return max_obj;
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

    createEnemy(type,x,y){
        let enemy = this.physics.add.sprite(x, y, type, "Attack1_0_0.png").setScale(SCALE);
        enemy.unitType = type;
        enemy.setCollideWorldBounds(true);
        if(type == "Fantasy_Warrior"){
            enemy.setBodySize(30, 40);
            enemy.mhp = 3;
            enemy.speed = 80;
        } else if (type == "Martial_1"){
            enemy.setBodySize(30, 45);
            enemy.mhp = 7;
            enemy.speed = 40;
        } else if (type == "Martial_2"){
            enemy.setBodySize(30, 52);
            enemy.mhp = 2;
            enemy.speed = 120;
        }
        enemy.on('animationcomplete', () => {
            // console.log("anim over" +  (enemy.hp))
            
            enemy.attacking = false;
            enemy.hit = false;
        });

        enemy.target = this.gems[0];
        enemy.attackFreq = 50;
        enemy.attackTimer = enemy.attackFreq;

        enemy.hp = enemy.mhp;
        this.createHealthbar(enemy);

        this.physics.add.collider(enemy, this.groundLayer);
        this.enemies.push(enemy);
    }
    updateEnemy(enemy){
        // AI update
        if(enemy.target == my.sprite.player){
            if(this.distobjs(enemy, my.sprite.player) > this.ENEMY_FORGET_DIST){
                enemy.target = this.closestobj(enemy, this.gems);
            }
        }
        // mon 1:30 and tues 4-5 
        if(enemy.target == null){
            if(this.gems.length > 1){
                enemy.target = this.closestobj(enemy, this.gems);
            }
            enemy.target = my.sprite.player;
        }

        if(enemy.target == null){
            console.log("No target");
            return;
        }
        
        if(enemy.body.x - enemy.target.x > -enemy.speed && enemy.body.x - enemy.target.x < enemy.speed){
            if(enemy.attackTimer < 1){
                enemy.attackTimer += enemy.attackFreq;
                enemy.attacking = true;
                enemy.body.velocity.x = 0;
                // console.log(enemy.body.x - enemy.target.x + " fight");

                // attack 
                
                this.time.delayedCall(this.ENEMY_ATTACK_DELAY,()=>{
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
            enemy.attackTimer = enemy.attackFreq;
            // jump
            if(enemy.body.blocked.down && (enemy.body.blocked.left || enemy.body.blocked.right)) {
                enemy.body.setVelocityY(this.JUMP_VELOCITY);
                this.poof(enemy.x,enemy.y+30);
                // this.jumpsfx.play();
            }

            if(enemy.body.x < enemy.target.x){
                enemy.body.velocity.x = enemy.speed;
                enemy.facingDir = 1;
            } else if(enemy.body.x > enemy.target.x){
                enemy.body.velocity.x = -enemy.speed;
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
        let enemyName = enemy.unitType;
        if(enemy.hp <= 0){
            enemy.anims.play(enemyName+'_death',true);
            if(enemy.anims.currentFrame.index > 5){
                this.enemies = this.enemies.filter(function(e) { return e != enemy; }); 
                this.destroyHealthbar(enemy);
                enemy.destroy();
            }
        }else if(enemy.hit){
            enemy.anims.play(enemyName+'_hit', true);
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

        o.spawnTimer = 50; //initial delay
        o.waitTimes = this.waitTimes;
        o.enemyTypes = this.enemyTypes;
        o.i = 0; //index in wait times
    }
    updatePortal(portal){
        if(portal.spawnTimer < 1){
            portal.spawnTimer+=portal.waitTimes[portal.i];
            if(portal.enemyTypes[portal.i] == "m1"){
                this.createEnemy("Martial_1",portal.x,portal.y);
            } else if(portal.enemyTypes[portal.i] == "m2"){
                this.createEnemy("Martial_2",portal.x,portal.y);
            }else{
                this.createEnemy("Fantasy_Warrior",portal.x,portal.y);
            }
            portal.i++;
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
                this.poof(e.x,e.y);

                // console.log("hit " + e.name + " doing " + dmg + " leaving them at " + e.hp);
                e.hit = true;
                e.target = me;
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

        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        if(level == 1){
            this.map = this.add.tilemap("tilemap_tiled", PPU, PPU, mapW, mapH);
            this.tileset = this.map.addTilesetImage("Dungeon Ruins Tileset Night", "tilemap_packed");
            this.cameras.main.setBackgroundColor("#94b8d6");
            this.waitTimes = [50, 100, 200, 10, 10];
            this.enemyTypes = ["f","f","f","f","f","m1"];
        }
        if(level == 2){
            mapW = 128;
            this.map = this.add.tilemap("tilemap_tiled2", PPU, PPU, mapW, mapH);
            this.tileset = this.map.addTilesetImage("Dungeon Ruins Tileset Night", "tilemap_night");
            this.cameras.main.setBackgroundColor("#4b70ad");
            this.waitTimes = [50, 150, 100, 200, 200, 100];
            this.enemyTypes = ["m2","f","f","m1","f","m2"];
        }


        this.bgfLayer = this.map.createLayer("BackgroundFar", this.tileset, 0, 0);
        this.bgLayer = this.map.createLayer("Background", this.tileset, 0, 0);


        // set up player avatar
        // console.log("load respawn "+respawnX + " " + respawnY);
        my.sprite.player = this.physics.add.sprite(mapW*PPU*0.5, mapH*PPU*0.75, "Hero_Knight", "Attack1_0_0.png").setScale(SCALE);
        my.sprite.player.setCollideWorldBounds(true);
        my.sprite.player.setBodySize(30, 48);
        my.sprite.player.on('animationcomplete', () => {
            my.sprite.player.attacking = false;
            my.sprite.player.hit = false;
        });

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
        

        var restartKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        restartKey.on('down', (event) => { this.scene.start('Game'); })
        var creditsKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
        creditsKey.on('down', (event) => { this.scene.start('Credits'); })
        var menuKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
        menuKey.on('down', (event) => { this.scene.start('Menu'); })

        this.cameras.main.setBounds(0, 0, PPU*mapW*SCALE, PPU*mapH*SCALE);
        this.physics.world.setBounds(0,0,PPU*mapW*SCALE,PPU*mapH*SCALE);

        this.cameras.main.startFollow(my.sprite.player);

        this.won = false;
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
            // Lose
            if(my.sprite.player.hp<1 || this.gems.length<1 ){
                this.scene.start("Lose");
            }
            // Win
            if(this.portals.length<1 && this.enemies.length<1){
                console.log(level);
                if(level == 1){
                    level = 2;
                    this.scene.start('Game');
                }else{
                    this.scene.start("Win");
                }
                
            }
        })

        // this.cameras.main.fadeIn(1000, 255, 255, 255)
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
        if((my.sprite.player.hp<1 || this.gems.length<1) && !this.lost){
            console.log("Lose");
            this.lost = true;
            my.sprite.player.anims.play('Hero_Knight_death', true);
            this.cameras.main.fadeOut(1000, 255, 255, 255);
            // this.time.delayedCall(300,()=>this.scene.start("Lose"));
        }
        // Win
        if(this.portals.length<1 && this.enemies.length<1){
            // this.cameras.main.fadeOut(1000, 255, 255, 255);
            this.time.delayedCall(300,()=>{
                if(!this.won){
                    console.log(level);
                    if(level == 1){
                        level = 2;
                        this.scene.start('Game');
                    }else{
                        this.scene.start("Win");
                    }
                    this.won = true;
                }
                
                
            });
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
                    // this.poof(my.sprite.player.x,my.sprite.player.y+20);
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
                    // this.poof(my.sprite.player.x,my.sprite.player.y+20);
                }
    
            } else {
                my.sprite.player.body.setAccelerationX(0);
                my.sprite.player.body.setDragX(this.DRAG);

                // my.vfx_walking.stop();
                
            }
    
            // player jump
            // note that we need body.blocked rather than body.touching b/c the former applies to tilemap tiles and the latter to the "ground"
            if(!my.sprite.player.body.blocked.down) {
                my.sprite.player.airborne = true;
                // my.vfx_walking.stop();
            }
            if(my.sprite.player.body.blocked.down){
                if(my.sprite.player.airborne){
                    // Landed
                    this.poof(my.sprite.player.x,my.sprite.player.y+30);
                }
                my.sprite.player.airborne = false;
            }
            if(my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up)) {
                my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
                this.poof(my.sprite.player.x,my.sprite.player.y+30);
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

        this.frame++;
    }
}