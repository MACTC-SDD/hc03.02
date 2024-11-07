/*
* A rough version of the classic DVD player idle animation
*
* Moves an HTMLElement (domMedia) in a parent container 
* (domContainer) at a certain speed. Reverses velocity,
* plays an external audio resource and changes container
* background color in the event of container bounds
* collision
*/
class DVDClassicAnimation {
	#_domMedia;
	#_domContainer;
	#_domFPSOutput;
	#_sfxContext;
	#_sfxSource;
	#_sfxAssetURL;
	#_sfxMuted = true;
	#_position;
	#_velocity;
	#_intervalDelay;
	#_intervalHandle;

	constructor(media, container, position, velocity, sfxAssetURL)
	{
		this.domMedia = media;
		this.domContainer = container;
		this.position = position;
		this.velocity = velocity;
		this.sfxAssetURL = sfxAssetURL;
	}

	// The media to animate
	set domMedia(_)
	{
		if (!(_ instanceof HTMLElement))
			this.#_domMedia = undefined;
		
		this.#_domMedia = _;
	}
	get domMedia() 
	{
		return this.#_domMedia;
	}

	// The parent container of the media to animate
	set domContainer(_)
	{
		if (!(_ instanceof HTMLElement))
			this.#_domContainer = undefined;
		
		this.#_domContainer = _;
	}
	get domContainer()
	{
		return this.#_domContainer;
	}

	// The field in which to print the estimated FPS of the animation
	set domFPSOutput(_)
	{
		if (!(_ instanceof HTMLElement))
			this.#_domFPSOutput = undefined;
		
		this.#_domFPSOutput = _;
	}
	get domFPSOutput()
	{
		return this.#_domFPSOutput;
	}

	// The URL of the sound effect asset to play on collision
	set sfxAssetURL(_)
	{
		this.#_sfxAssetURL = _;
		this.#_sfxSource = undefined;

		// Fetch audio asset via ArrayBuffer XHR request;
		if (!window.XMLHttpRequest)
			return;

		var xhr = new XMLHttpRequest();

		xhr.open(
			"GET",
			_
		);
		xhr.responseType = "arraybuffer";
		xhr.onreadystatechange = async function() {
			// Check server response;
			if (xhr.readyState == 4
			&&  xhr.status     <= 299
			&&  xhr.status     >= 200) {
				// Setup audio context with response data;
				this.#_sfxContext = new AudioContext();
				this.#_sfxSource = await this.#_sfxContext.decodeAudioData(xhr.response);
			}
		}.bind(this);

		xhr.send();
	}
	get sfxAssetURL()
	{
		return this.#_sfxAssetURL;
	}

	// Determines if the sound effect is allowed to play
	set sfxMuted(_)
	{
		if (typeof _ != "boolean")
			return;

		this.#_sfxMuted = _;
	}
	get sfxMuted()
	{
		return this.#_sfxMuted;
	}

	// The position of the media in the container
	set position(_)
	{
		if (!(_ instanceof Int16Array)
		||  !(_.length == 2))
			return;

		this.#_position = _;
	} 
	get position()
	{
		return this.#_position;
	}

	// The velocity at which the media moves per-update
	set velocity(_)
	{
		if (!(this.#_velocity instanceof Int16Array)) {
			if (_ instanceof Int16Array
			&&  _.length == 2)
				this.#_velocity = _;
			else
				this.#_velocity = new Int16Array(2);
			return;
		}

		if (!(_ instanceof Int16Array)
		||  !(_.length == 2))
			return;

		this.#_velocity.forEach((e, i) => {
			if (e == 0)
				this.#_velocity[i] = _[i]
			else
				// Preserve signature;
				this.#_velocity[i] = Math.abs(e) / e * _[i];
		});
	}
	get velocity()
	{
		return this.#_velocity;
	}

	// The amount of milliseconds between animation updates
	get delayMilliseconds()
	{
		return this.#_intervalDelay;
	}
	
	// Starts the animation, or adjusts delayMilliseconds if already started
	start(delayMilliseconds)
	{
		if (isNaN(delayMilliseconds))
			return false;

		if (this.#_intervalHandle)
			clearInterval(this.#_intervalHandle);

		this.#_intervalDelay = delayMilliseconds;
		this.#_intervalHandle = setInterval(
			this.update.bind(this),
			delayMilliseconds
		);

		return true;
	}

	// Stops the animation
	stop()
	{
		if (!this.#_intervalHandle)
			return false;

		clearInterval(this.#_intervalHandle);
		this.#_intervalDelay = this.#_intervalHandle = undefined;

		return true;
	}

	// Updates the animation state
	update()
	{
		// Check for valid DOM objects;
		if (!(this.domMedia     instanceof HTMLElement)
		||  !(this.domContainer instanceof HTMLElement))
			return false;

		// If the debug element is set, push the "FPS";
		// NOTE: Does absolutely nothing as there is no
		// change, but in normal scenarios where we actually
		// measure the FPS we would push it every frame,
		// so just for consistency I'm leaving it here
		if (this.domFPSOutput instanceof Element)
			this.domFPSOutput.innerText = Math.floor(
				1000 / this.delayMilliseconds
			) + "fps";

		// Update position by velocity;
		this.position[0] += this.velocity[0];
		this.position[1] += this.velocity[1];

		// Check axis collision and take action if needed;
		// NOTE: I hate these named fields that prevent me
		// from iterating one condition twice over both 
		// indexes and instead have me waste 11 lines
		var _ = false;
		if (this.position[0] + this.domMedia.width >= this.domContainer.offsetWidth
		||  this.position[0] <= 0) {
			this.position[0] = Math.min(
				Math.max(this.position[0] + this.domMedia.width, 0),
				this.domContainer.offsetWidth
			) - this.domMedia.width;
			this.#_velocity[0] *= -1;
			_ = true;
		}

		if (this.position[1] + this.domMedia.height >= this.domContainer.offsetHeight
		||  this.position[1] <= 0) {
			this.position[1] = Math.min(
				Math.max(this.position[1] + this.domMedia.height, 0),
				this.domContainer.offsetHeight
			) - this.domMedia.height;
			this.#_velocity[1] *= -1;
			_ = true;
		}

		if (_) {
			// Play collision SFX;
			if (this.#_sfxSource instanceof AudioBuffer
			&&  !this.#_sfxMuted) {
				_ = this.#_sfxContext.createBufferSource();
				_.buffer = this.#_sfxSource;
				_.connect(this.#_sfxContext.destination);
				_.start();
			}

			// Randomize background on container;
			this.domContainer.style.background = `
				rgb(
					${Math.floor(Math.random()*255)},
					${Math.floor(Math.random()*255)},
					${Math.floor(Math.random()*255)}
				)
			`;
		}

		// Position the DOM media;
		this.domMedia.style.cssText = `
			position: absolute;
			left: ${Math.abs(this.position[0])}px;
			top:  ${Math.abs(this.position[1])}px
		`;

		return true;
	}
}
