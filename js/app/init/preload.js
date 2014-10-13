function preload(){
	//engin settings
	engin.stage.disableVisibilityChange = true;

	//image
	engin.load.image('door','imgs/other/door.png')

	//player
	engin.load.spritesheet('player/1','imgs/player/001-Fighter01.png',32,48)
	engin.load.spritesheet('player/2','imgs/player/002-Fighter02.png',32,48)
	engin.load.spritesheet('player/3','imgs/player/003-Fighter03.png',32,48)
	engin.load.spritesheet('player/4','imgs/player/004-Fighter04.png',32,48)
	engin.load.spritesheet('player/5','imgs/player/005-Fighter05.png',32,48)
	engin.load.spritesheet('player/6','imgs/player/006-Fighter06.png',32,48)
	engin.load.spritesheet('player/7','imgs/player/007-Fighter07.png',32,48)
	engin.load.spritesheet('player/8','imgs/player/008-Fighter08.png',32,48)
	engin.load.spritesheet('player/9','imgs/player/009-Lancer01.png',32,48)
	engin.load.spritesheet('player/10','imgs/player/010-Lancer02.png',32,48)
	engin.load.spritesheet('player/11','imgs/player/011-Lancer03.png',32,48)
	engin.load.spritesheet('player/12','imgs/player/012-Lancer04.png',32,48)
	engin.load.spritesheet('player/13','imgs/player/013-Warrior01.png',32,48)
	engin.load.spritesheet('player/14','imgs/player/014-Warrior02.png',32,48)
	engin.load.spritesheet('player/16','imgs/player/016-Thief01.png',32,48)
	engin.load.spritesheet('player/17','imgs/player/017-Thief02.png',32,48)
	engin.load.spritesheet('player/18','imgs/player/018-Thief03.png',32,48)
	engin.load.spritesheet('player/20','imgs/player/020-Hunter01.png',32,48)
	engin.load.spritesheet('player/21','imgs/player/021-Hunter02.png',32,48)
	engin.load.spritesheet('player/22','imgs/player/022-Hunter03.png',32,48)
	engin.load.spritesheet('player/23','imgs/player/023-Gunner01.png',32,48)
	engin.load.spritesheet('player/24','imgs/player/024-Gunner02.png',32,48)
	engin.load.spritesheet('player/25','imgs/player/025-Cleric01.png',32,48)
	engin.load.spritesheet('player/26','imgs/player/026-Cleric02.png',32,48)
	engin.load.spritesheet('player/27','imgs/player/027-Cleric03.png',32,48)
	engin.load.spritesheet('player/28','imgs/player/028-Cleric04.png',32,48)
	engin.load.spritesheet('player/29','imgs/player/029-Cleric05.png',32,48)
	engin.load.spritesheet('player/30','imgs/player/030-Cleric06.png',32,48)
	engin.load.spritesheet('player/31','imgs/player/031-Cleric07.png',32,48)
	engin.load.spritesheet('player/32','imgs/player/032-Cleric08.png',32,48)
	engin.load.spritesheet('player/33','imgs/player/033-Mage01.png',32,48)
	engin.load.spritesheet('player/34','imgs/player/034-Mage02.png',32,48)
	engin.load.spritesheet('player/35','imgs/player/035-Mage03.png',32,48)
	engin.load.spritesheet('player/36','imgs/player/036-Mage04.png',32,48)
	engin.load.spritesheet('player/37','imgs/player/037-Mage05.png',32,48)
	engin.load.spritesheet('player/38','imgs/player/038-Mage06.png',32,48)
	engin.load.spritesheet('player/39','imgs/player/039-Mage07.png',32,48)
	engin.load.spritesheet('player/40','imgs/player/040-Mage08.png',32,48)
	engin.load.spritesheet('player/41','imgs/player/041-Mage09.png',32,48)
	engin.load.spritesheet('player/42','imgs/player/042-King01.png',32,48)
	engin.load.spritesheet('player/43','imgs/player/043-Queen01.png',32,48)
	engin.load.spritesheet('player/44','imgs/player/044-Trader01.png',32,48)
	engin.load.spritesheet('player/45','imgs/player/045-Fortuneteller01.png',32,48)
	engin.load.spritesheet('player/46','imgs/player/046-Grappler01.png',32,48)
	engin.load.spritesheet('player/47','imgs/player/047-Grappler02.png',32,48)
	engin.load.spritesheet('player/48','imgs/player/048-Fairy01.png',32,48)
	engin.load.spritesheet('player/49','imgs/player/049-Soldier01.png',32,48)
	engin.load.spritesheet('player/50','imgs/player/050-Soldier02.png',32,48)
	engin.load.spritesheet('player/51','imgs/player/051-Undead01.png',32,48)
	engin.load.spritesheet('player/52','imgs/player/052-Undead02.png',32,48)
	engin.load.spritesheet('player/53','imgs/player/053-Undead03.png',32,48)
	engin.load.spritesheet('player/54','imgs/player/054-Undead04.png',32,48)
	engin.load.spritesheet('player/55','imgs/player/055-Snake01.png',32,48)
	engin.load.spritesheet('player/56','imgs/player/056-Snake02.png',32,48)
	engin.load.spritesheet('player/57','imgs/player/057-Snake03.png',32,48)
	engin.load.spritesheet('player/58','imgs/player/058-Snake04.png',32,48)
	engin.load.spritesheet('player/59','imgs/player/059-Aquatic01.png',32,48)
	engin.load.spritesheet('player/60','imgs/player/060-Aquatic02.png',32,48)
	engin.load.spritesheet('player/61','imgs/player/061-Aquatic03.png',32,48)
	engin.load.spritesheet('player/62','imgs/player/062-Aquatic04.png',32,48)
	engin.load.spritesheet('player/63','imgs/player/063-Beast01.png',32,48)
	engin.load.spritesheet('player/64','imgs/player/064-Beast02.png',32,48)
	engin.load.spritesheet('player/65','imgs/player/065-Beast03.png',32,48)
	engin.load.spritesheet('player/66','imgs/player/066-Beast04.png',32,48)
	engin.load.spritesheet('player/67','imgs/player/067-Goblin01.png',32,48)
	engin.load.spritesheet('player/68','imgs/player/068-Goblin02.png',32,48)
	engin.load.spritesheet('player/69','imgs/player/069-Goblin03.png',32,48)
	engin.load.spritesheet('player/70','imgs/player/070-Goblin04.png',32,48)
	engin.load.spritesheet('player/71','imgs/player/071-Bird01.png',32,48)
	engin.load.spritesheet('player/73','imgs/player/073-Bird03.png',32,48)
	engin.load.spritesheet('player/74','imgs/player/074-Bird04.png',32,48)
	engin.load.spritesheet('player/75','imgs/player/075-Devil01.png',32,48)
	engin.load.spritesheet('player/76','imgs/player/076-Devil02.png',32,48)
	engin.load.spritesheet('player/77','imgs/player/077-Devil03.png',32,48)
	engin.load.spritesheet('player/78','imgs/player/078-Devil04.png',32,48)
	engin.load.spritesheet('player/79','imgs/player/079-Angel01.png',32,48)
	engin.load.spritesheet('player/80','imgs/player/080-Angel02.png',32,48)
	engin.load.spritesheet('player/81','imgs/player/081-Angel03.png',32,48)
	engin.load.spritesheet('player/87','imgs/player/087-Monster01.png',32,48)
	engin.load.spritesheet('player/88','imgs/player/088-Monster02.png',32,48)
	engin.load.spritesheet('player/89','imgs/player/089-Monster03.png',32,48)
	engin.load.spritesheet('player/90','imgs/player/090-Monster04.png',32,48)
	engin.load.spritesheet('player/92','imgs/player/092-Monster06.png',32,48)
	engin.load.spritesheet('player/93','imgs/player/093-Monster07.png',32,48)
	engin.load.spritesheet('player/94','imgs/player/094-Monster08.png',32,48)
	engin.load.spritesheet('player/95','imgs/player/095-Monster09.png',32,48)
	engin.load.spritesheet('player/96','imgs/player/096-Monster10.png',32,48)
	engin.load.spritesheet('player/97','imgs/player/097-Monster11.png',32,48)
	engin.load.spritesheet('player/98','imgs/player/098-Monster12.png',32,48)
	engin.load.spritesheet('player/99','imgs/player/099-Monster13.png',32,48)
	engin.load.spritesheet('player/101','imgs/player/101-Civilian01.png',32,48)
	engin.load.spritesheet('player/102','imgs/player/102-Civilian02.png',32,48)
	engin.load.spritesheet('player/103','imgs/player/103-Civilian03.png',32,48)
	engin.load.spritesheet('player/104','imgs/player/104-Civilian04.png',32,48)
	engin.load.spritesheet('player/105','imgs/player/105-Civilian05.png',32,48)
	engin.load.spritesheet('player/106','imgs/player/106-Civilian06.png',32,48)
	engin.load.spritesheet('player/107','imgs/player/107-Civilian07.png',32,48)
	engin.load.spritesheet('player/108','imgs/player/108-Civilian08.png',32,48)
	engin.load.spritesheet('player/109','imgs/player/109-Civilian09.png',32,48)
	engin.load.spritesheet('player/110','imgs/player/110-Civilian10.png',32,48)
	engin.load.spritesheet('player/111','imgs/player/111-Civilian11.png',32,48)
	engin.load.spritesheet('player/112','imgs/player/112-Civilian12.png',32,48)
	engin.load.spritesheet('player/113','imgs/player/113-Civilian13.png',32,48)
	engin.load.spritesheet('player/114','imgs/player/114-Civilian14.png',32,48)
	engin.load.spritesheet('player/115','imgs/player/115-Civilian15.png',32,48)
	engin.load.spritesheet('player/116','imgs/player/116-Civilian16.png',32,48)
	engin.load.spritesheet('player/117','imgs/player/117-Civilian17.png',32,48)
	engin.load.spritesheet('player/118','imgs/player/118-Civilian18.png',32,48)
	engin.load.spritesheet('player/119','imgs/player/119-Civilian19.png',32,48)
	engin.load.spritesheet('player/120','imgs/player/120-Civilian20.png',32,48)
	engin.load.spritesheet('player/121','imgs/player/121-Civilian21.png',32,48)
	engin.load.spritesheet('player/122','imgs/player/122-Civilian22.png',32,48)
	engin.load.spritesheet('player/123','imgs/player/123-Civilian23.png',32,48)
	engin.load.spritesheet('player/124','imgs/player/124-Civilian24.png',32,48)
	engin.load.spritesheet('player/125','imgs/player/125-Baby01.png',32,48)
	engin.load.spritesheet('player/126','imgs/player/126-Noble01.png',32,48)
	engin.load.spritesheet('player/127','imgs/player/127-Noble02.png',32,48)
	engin.load.spritesheet('player/128','imgs/player/128-Noble03.png',32,48)
	engin.load.spritesheet('player/129','imgs/player/129-Noble04.png',32,48)
	engin.load.spritesheet('player/130','imgs/player/130-Noble05.png',32,48)
	engin.load.spritesheet('player/131','imgs/player/131-Noble06.png',32,48)
	engin.load.spritesheet('player/132','imgs/player/132-Noble07.png',32,48)
	engin.load.spritesheet('player/133','imgs/player/133-Noble08.png',32,48)
	engin.load.spritesheet('player/134','imgs/player/134-Butler01.png',32,48)
	engin.load.spritesheet('player/135','imgs/player/135-Maid01.png',32,48)
	engin.load.spritesheet('player/136','imgs/player/136-Bartender01.png',32,48)
	engin.load.spritesheet('player/137','imgs/player/137-BunnyGirl01.png',32,48)
	engin.load.spritesheet('player/138','imgs/player/138-Cook01.png',32,48)
	engin.load.spritesheet('player/139','imgs/player/139-Clown01.png',32,48)
	engin.load.spritesheet('player/140','imgs/player/140-Dancer01.png',32,48)
	engin.load.spritesheet('player/141','imgs/player/141-Bard01.png',32,48)
	engin.load.spritesheet('player/142','imgs/player/142-Scholar01.png',32,48)
	engin.load.spritesheet('player/143','imgs/player/143-Farmer01.png',32,48)
	engin.load.spritesheet('player/144','imgs/player/144-Farmer02.png',32,48)
	engin.load.spritesheet('player/145','imgs/player/145-Prisoner01.png',32,48)
	engin.load.spritesheet('player/146','imgs/player/146-Prisoner02.png',32,48)
	engin.load.spritesheet('player/147','imgs/player/147-Storekeeper01.png',32,48)
	engin.load.spritesheet('player/148','imgs/player/148-Storekeeper02.png',32,48)
	engin.load.spritesheet('player/149','imgs/player/149-Captain01.png',32,48)
	engin.load.spritesheet('player/150','imgs/player/150-Sailor01.png',32,48)
	engin.load.spritesheet('player/151','imgs/player/151-Animal01.png',32,48)
	engin.load.spritesheet('player/152','imgs/player/152-Animal02.png',32,48)
	engin.load.spritesheet('player/153','imgs/player/153-Animal03.png',32,48)
	engin.load.spritesheet('player/154','imgs/player/154-Animal04.png',32,48)
	engin.load.spritesheet('player/155','imgs/player/155-Animal05.png',32,48)
	engin.load.spritesheet('player/156','imgs/player/156-Animal06.png',32,48)
	engin.load.spritesheet('player/157','imgs/player/157-Animal07.png',32,48)
	engin.load.spritesheet('player/158','imgs/player/158-Animal08.png',32,48)
	engin.load.spritesheet('player/159','imgs/player/159-Small01.png',32,48)
	engin.load.spritesheet('player/160','imgs/player/160-Small02.png',32,48)
	engin.load.spritesheet('player/161','imgs/player/161-Small03.png',32,48)
	engin.load.spritesheet('player/162','imgs/player/162-Small04.png',32,48)
	engin.load.spritesheet('player/163','imgs/player/163-Small05.png',32,48)
	engin.load.spritesheet('player/164','imgs/player/164-Small06.png',32,48)
	engin.load.spritesheet('player/165','imgs/player/165-Small07.png',32,48)
	engin.load.spritesheet('player/166','imgs/player/166-Small08.png',32,48)
	engin.load.spritesheet('player/167','imgs/player/167-Small09.png',32,48)
	engin.load.spritesheet('player/168','imgs/player/168-Small10.png',32,48)
	engin.load.spritesheet('player/169','imgs/player/169-Small11.png',32,48)
	engin.load.spritesheet('player/187','imgs/player/187-Lorry01.png',32,48)
	engin.load.spritesheet('player/188','imgs/player/188-Wagon01.png',32,48)
	engin.load.spritesheet('player/189','imgs/player/189-Down01.png',32,48)
	engin.load.spritesheet('player/190','imgs/player/190-Down02.png',32,48)
	engin.load.spritesheet('player/191','imgs/player/191-Down03.png',32,48)
	engin.load.spritesheet('player/192','imgs/player/192-Down04.png',32,48)


	// //items
	engin.load.image('item/001','imgs/items/001-Weapon01.png')
	engin.load.image('item/002','imgs/items/002-Weapon02.png')
	engin.load.image('item/003','imgs/items/003-Weapon03.png')
	engin.load.image('item/004','imgs/items/004-Weapon04.png')
	engin.load.image('item/005','imgs/items/005-Weapon05.png')
	engin.load.image('item/006','imgs/items/006-Weapon06.png')
	engin.load.image('item/007','imgs/items/007-Weapon07.png')
	engin.load.image('item/008','imgs/items/008-Weapon08.png')
	engin.load.image('item/009','imgs/items/009-Shield01.png')
	engin.load.image('item/010','imgs/items/010-Head01.png')
	engin.load.image('item/011','imgs/items/011-Head02.png')
	engin.load.image('item/012','imgs/items/012-Head03.png')
	engin.load.image('item/013','imgs/items/013-Body01.png')
	engin.load.image('item/014','imgs/items/014-Body02.png')
	engin.load.image('item/015','imgs/items/015-Body03.png')
	engin.load.image('item/016','imgs/items/016-Accessory01.png')
	engin.load.image('item/017','imgs/items/017-Accessory02.png')
	engin.load.image('item/018','imgs/items/018-Accessory03.png')
	engin.load.image('item/019','imgs/items/019-Accessory04.png')
	engin.load.image('item/020','imgs/items/020-Accessory05.png')
	engin.load.image('item/021','imgs/items/021-Potion01.png')
	engin.load.image('item/022','imgs/items/022-Potion02.png')
	engin.load.image('item/023','imgs/items/023-Potion03.png')
	engin.load.image('item/024','imgs/items/024-Potion04.png')
	engin.load.image('item/025','imgs/items/025-Herb01.png')
	engin.load.image('item/026','imgs/items/026-Herb02.png')
	engin.load.image('item/027','imgs/items/027-Herb03.png')
	engin.load.image('item/028','imgs/items/028-Herb04.png')
	engin.load.image('item/029','imgs/items/029-Key01.png')
	engin.load.image('item/030','imgs/items/030-Key02.png')
	engin.load.image('item/031','imgs/items/031-Key03.png')
	engin.load.image('item/032','imgs/items/032-Item01.png')
	engin.load.image('item/033','imgs/items/033-Item02.png')
	engin.load.image('item/034','imgs/items/034-Item03.png')
	engin.load.image('item/035','imgs/items/035-Item04.png')
	engin.load.image('item/036','imgs/items/036-Item05.png')
	engin.load.image('item/037','imgs/items/037-Item06.png')
	engin.load.image('item/038','imgs/items/038-Item07.png')
	engin.load.image('item/039','imgs/items/039-Item08.png')
	engin.load.image('item/040','imgs/items/040-Item09.png')
	engin.load.image('item/041','imgs/items/041-Item10.png')
	engin.load.image('item/042','imgs/items/042-Item11.png')
	engin.load.image('item/043','imgs/items/043-Item12.png')
	engin.load.image('item/044','imgs/items/044-Skill01.png')
	engin.load.image('item/045','imgs/items/045-Skill02.png')
	engin.load.image('item/046','imgs/items/046-Skill03.png')
	engin.load.image('item/047','imgs/items/047-Skill04.png')
	engin.load.image('item/048','imgs/items/048-Skill05.png')
	engin.load.image('item/049','imgs/items/049-Skill06.png')
	engin.load.image('item/050','imgs/items/050-Skill07.png')

	//sound

	//load the background sound
	for (var k in sound.json.background) {
		for (var i = 0; i < sound.json.background[k].length; i++) {
			s = sound.json.background[k][i]
			engin.load.audio(s.url,'snd/background/'+s.url,true)
		};
	};


	//tile sets
	engin.load.image('tileset/land','imgs/land.png')
	engin.load.image('tileset/misc','imgs/misc.png')
	engin.load.image('tileset/col','imgs/col.png')

	//land
	engin.load.image('tileset/CastleTown','imgs/CastleTown.png')
	engin.load.image('tileset/CastleTown2','imgs/CastleTown2.png')

	engin.load.image('tileset/Cave','imgs/Cave.png')

	engin.load.image('tileset/DesertTown','imgs/DesertTown.png')
	engin.load.image('tileset/DesertTown2','imgs/DesertTown2.png')

	engin.load.image('tileset/FarmVillage','imgs/FarmVillage.png')
	engin.load.image('tileset/FarmVillage2','imgs/FarmVillage2.png')

	engin.load.image('tileset/Forest','imgs/Forest.png')
	engin.load.image('tileset/ForestTown','imgs/ForestTown.png')
	engin.load.image('tileset/ForestTown2','imgs/ForestTown2.png')

	engin.load.image('tileset/grassland','imgs/grassland.png')

	engin.load.image('tileset/MineTown','imgs/MineTown.png')
	engin.load.image('tileset/MineTown2','imgs/MineTown2.png')

	engin.load.image('tileset/Mountain','imgs/Mountain.png')	

	engin.load.image('tileset/PortTown','imgs/PortTown.png')
	engin.load.image('tileset/PortTown2','imgs/PortTown2.png')

	engin.load.image('tileset/PostTown','imgs/PostTown.png')
	engin.load.image('tileset/PostTown2','imgs/PostTown2.png')

	engin.load.image('tileset/Snowfield','imgs/Snowfield.png')
	engin.load.image('tileset/SnowTown','imgs/SnowTown.png')
	engin.load.image('tileset/SnowTown2','imgs/SnowTown2.png')

	engin.load.image('tileset/Swamp','imgs/Swamp.png')	

	engin.load.image('tileset/Woods','imgs/Woods.png')	

	//loading
	engin.load.onLoadStart.add(function(){
		$('#loading-overlay').show()
	})

	engin.load.onFileComplete.add(function(){
		$('#loading-bar>span').css('width',engin.load.progressFloat + '%')
	})

	engin.load.onLoadComplete.add(function(){
		$('#loading-overlay').hide()
		engin.load.onLoadStart.removeAll()
		engin.load.onFileComplete.removeAll()
		engin.load.onLoadComplete.removeAll()

		$("#connect-module").foundation('reveal', 'open')
	})
}