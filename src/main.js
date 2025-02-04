// debug with extreme prejudice
"use strict"

var canvas_x = 600;
var canvas_y = 400;

// game config
let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: true  // prevent pixel art from getting blurred when scaled
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: {
                x: 0,
                y: 0
            }
        }
    },
    width: canvas_x,
    height: canvas_y,
    fps:30,
    backgroundColor: '#94b8d6',
    scene: [Load, Game, Win, Menu, Credits, Lose],
    audio: {
        disableWebAudio: true
    }
}

var cursors;
const SCALE = 1.0;
const PPU = 16;
var my = {sprite: {}, text: {}};
var level=1;

const game = new Phaser.Game(config);