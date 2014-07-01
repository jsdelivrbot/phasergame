var game = new Phaser.Game(800,600,Phaser.AUTO,'game', { preload: preload, create: create, update: update, render: render } )

function preload(){
	game.load.image('player','imgs/player/player.gif')
}

function create(){
	player = game.add.sprite(32,32,'player')
}

function update(){

}

function render(){

}