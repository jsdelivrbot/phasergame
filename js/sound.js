sound = {
	json: null,
	background: {
		mood: 'default',
		state: 'fadeIn',
		playing: {
			mood: '',
			track: null,
			trackKey: ''
		},
		start: function(){
			window.setInterval(sound.background.update,225)
		},
		update: function(){
			s = sound.background
			if(s.mood === s.playing.mood){
				switch(s.state){
					case 'fadeIn':
						if(s.playing.track){
							if(s.playing.track.isDecoded){
								if(s.playing.track.volume < s.playing.track.maxVolume){
									s.playing.track.volume += (s.playing.track.maxVolume / 10);
								}
								else{
									s.playing.track.volume = s.playing.track.maxVolume

									s.state = 'playing'

									s.playing.track.onStop.addOnce(function(event){
										sound.background.state = 'fadeOut',
										s.playing.track.volume = 0
									})
								}
							}
						}
						break;
					case 'fadeOut':
						if(s.playing.track){
							if(s.playing.track.volume > 0){
								s.playing.track.volume -= (s.playing.track.maxVolume / 10);
							}
							else{
								s.playing.track.volume = 0
								s.playing.track.stop()

								//find a new track
								s.playing.trackKey = sound.json.background[s.mood][Math.round(Math.random() * (sound.json.background[s.mood].length-1))]
					
								//play
								if(!engin.sound.mute){
									s.playing.track = engin.sound.play(s.playing.trackKey.url,0)
									s.playing.track.volume = 0;
									s.playing.track.maxVolume = s.playing.trackKey.volume
									s.state = 'fadeIn';
								}
							}
						}
						else{
							if(!engin.sound.mute){
								s.playing.track = engin.sound.play(s.playing.trackKey.url,0)
								s.playing.track.volume = 0;
								s.playing.track.maxVolume = s.playing.trackKey.volume
								s.state = 'fadeIn';
							}
						}
						break;
				}
			}
			else{
				//change mood and find a new track
				if(sound.json.background[s.mood]){
					//change
					s.playing.mood = s.mood
					s.playing.trackKey = sound.json.background[s.mood][Math.round(Math.random() * (sound.json.background[s.mood].length-1))]
					s.state = 'fadeOut';
				}
				else{
					s.mood = s.playing.mood;
				}
			}
		}
	}
}