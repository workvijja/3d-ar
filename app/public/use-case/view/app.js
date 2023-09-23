var APP = {

	Player: function () {

		var renderer = new THREE.WebGLRenderer( { antialias: true } );
		renderer.setPixelRatio( window.devicePixelRatio ); // TODO: Use player.setPixelRatio()

		var loader = new THREE.ObjectLoader();
		var camera, scene, scene_objects = [], ar_objects = [], target_object, reticle, controller, current_session, selected = false;
		var animations = {
			initialize: function(mixer, clips) {
				this.mixer = mixer
				this.clips = clips
				this.clock = new THREE.Clock()
				this.running = false
			},

			update: function() {
				this.mixer.update(this.clock.getDelta())
			},

			open: function() {
				return new Promise((resolve, reject) => {
					if (!this.running) {
						const finished = (e) => {
							this.mixer.removeEventListener("finished", finished)
							// console.log(e)
							this.running = false
							resolve()
						}
						this.mixer.addEventListener("finished", finished)
						this.clips.forEach((c) => {
							this.action = this.mixer.clipAction(c);
							this.action.reset()
							this.action.timeScale = 1.5;
							this.action.setLoop(THREE.LoopOnce);
							this.action.clampWhenFinished = true;
							this.action.play();
						})
						this.running = true
					}
				})
			},

			close: function() {
				return new Promise((resolve, reject) => {
					if (!this.running) {
						const finished = (e) => {
							this.mixer.removeEventListener("finished", finished)
							// console.log(e)
							this.running = false
							resolve()
						}
						this.mixer.addEventListener("finished", finished)
						this.clips.forEach((c) => {
							this.action = this.mixer.clipAction(c);
							this.action.paused = false;
							this.action.timeScale = -1.5;
							this.action.setLoop(THREE.LoopOnce);
							this.action.play();
						})
						this.running = true
					}
				})
			}
		}
		var raycaster = new THREE.Raycaster();
		var pointer = new THREE.Vector2();

		// var vrButton = VRButton.createButton( renderer ); // eslint-disable-line no-undef
		var arButton = ARButton.createButton( renderer, {requiredFeatures: ['hit-test', 'dom-overlay'], domOverlay: {root: $("#overlay").get(0)}} ); // eslint-disable-line no-undef
		var hit_test_source = null;
		var hit_test_source_requested = false;

		var events = {};

		var dom = document.createElement( 'div' );
		dom.appendChild( renderer.domElement );

		this.dom = dom;

		this.width = 500;
		this.height = 500;

		this.load = function ( json ) {

			var project = json.project;

			// if ( project.vr !== undefined ) renderer.xr.enabled = project.vr;
			renderer.xr.enabled = true;
			if ( project.shadows !== undefined ) renderer.shadowMap.enabled = project.shadows;
			if ( project.shadowType !== undefined ) renderer.shadowMap.type = project.shadowType;
			if ( project.toneMapping !== undefined ) renderer.toneMapping = project.toneMapping;
			if ( project.toneMappingExposure !== undefined ) renderer.toneMappingExposure = project.toneMappingExposure;

			this.setScene( loader.parse( json.scene ) );
			this.setAnimation(scene, "closet_w_anim.glb");
			this.setCamera( loader.parse( json.camera ) );
			// camera_position = this.getCameraPosition()
			this.setRaycastEvent()
			this.setSceneObjects()
			this.setArObjects()
			this.setTargetObjects()
			this.setReticle()
			this.setController()

			vent.on("player:set-size", this.setSize, this)
			vent.on("ar:reset", reset)

			events = {
				init: [],
				start: [],
				stop: [],
				keydown: [],
				keyup: [],
				pointerdown: [],
				pointerup: [],
				pointermove: [],
				update: []
			};

			var scriptWrapParams = 'player,renderer,scene,camera';
			var scriptWrapResultObj = {};

			for ( var eventKey in events ) {

				scriptWrapParams += ',' + eventKey;
				scriptWrapResultObj[ eventKey ] = eventKey;

			}

			var scriptWrapResult = JSON.stringify( scriptWrapResultObj ).replace( /\"/g, '' );

			for ( var uuid in json.scripts ) {

				var object = scene.getObjectByProperty( 'uuid', uuid, true );

				if ( object === undefined ) {

					console.warn( 'APP.Player: Script without object.', uuid );
					continue;

				}

				var scripts = json.scripts[ uuid ];

				for ( var i = 0; i < scripts.length; i ++ ) {

					var script = scripts[ i ];

					var functions = ( new Function( scriptWrapParams, script.source + '\nreturn ' + scriptWrapResult + ';' ).bind( object ) )( this, renderer, scene, camera );

					for ( var name in functions ) {

						if ( functions[ name ] === undefined ) continue;

						if ( events[ name ] === undefined ) {

							console.warn( 'APP.Player: Event type not supported (', name, ')' );
							continue;

						}

						events[ name ].push( functions[ name ].bind( object ) );

					}

				}

			}

			dispatch( events.init, arguments );

		};

		this.setCamera = function ( value ) {

			camera = value;
			camera.aspect = this.width / this.height;
			camera.updateProjectionMatrix();

		};

		this.setScene = function ( value ) {
			scene = value;
		};

		this.getScene = function() {
			return scene;
		}

		this.setAnimation = function (object, name) {
			const mesh = this.getObjectByName(object, name)
			const mixer = new THREE.AnimationMixer(mesh)
			const clips = mesh.animations
			animations.initialize(mixer, clips)
		}

		this.getAnimations = function () {
			return animations
		}

		this.getObjectByName = function(object, name) {
			return object.getObjectByName(name)
		}

		this.setRaycastEvent = function() {
			const cloth = this.getObjectByName(scene, "cloth")
			document.addEventListener("pointerdown", function(e) {
				pointer.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
				raycaster.setFromCamera(pointer, camera);
				const intersect = raycaster.intersectObject(cloth, true);
				if (intersect.length > 0) vent.trigger("cloth:clicked")
			})
		}

		this.setSceneObjects = function() {
			['SceneLight', 'spotlights', 'environment.glb'].map((o) => {
				scene_objects.push(this.getObjectByName(scene, o))
			})
			// console.log(scene_objects)
		}

		this.setArObjects = function() {
			['ArLight'].map((o) => {
				ar_objects.push(this.getObjectByName(scene, o))
			})
			// console.log(ar_objects)
		}

		this.setTargetObjects = function() {
			target_object = this.getObjectByName(scene, 'closet')
		}

		this.setReticle = function() {
			reticle = new THREE.Mesh(
				new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2),
				new THREE.MeshStandardMaterial({ color: 0xffffff })
			)
			reticle.visible = false;
			reticle.matrixAutoUpdate = false;
			scene.add(reticle)
		}

		this.setController = function() {
			controller = renderer.xr.getController(0);
			controller.addEventListener('select', onSelect);
			scene.add(controller)
		}

		// this.getCameraPosition = function() {
		// 	return camera.position
		// }

		this.setPixelRatio = function ( pixelRatio ) {

			renderer.setPixelRatio( pixelRatio );

		};

		this.setSize = function ( width, height ) {

			this.width = width;
			this.height = height;

			if ( camera ) {

				camera.aspect = this.width / this.height;
				camera.updateProjectionMatrix();

			}

			renderer.setSize( width, height );

		};

		function dispatch( array, event ) {

			for ( var i = 0, l = array.length; i < l; i ++ ) {
				// console.log(event)
				array[ i ]( event );

			}

		}

		var time, startTime, prevTime;

		function animate(timestamp, frame) {
			if (frame) {
				const reference_space = renderer.xr.getReferenceSpace();
				const session = renderer.xr.getSession();

				if (hit_test_source_requested === false) {
					// console.log("hit test false")
					session.requestReferenceSpace('viewer')
						.then((referenceSpace) => {
							session.requestHitTestSource({ space: referenceSpace })
								.then((source) => hit_test_source = source)
						})

					hit_test_source_requested = true;

					session.addEventListener("end", onSessionEnd)
					current_session = session
				}

				if (hit_test_source) {
					const hitTestResults = frame.getHitTestResults(hit_test_source);
					if (hitTestResults.length > 0 && !selected) {
						const hit = hitTestResults[0];
						reticle.visible = true;
						reticle.matrix.fromArray(hit.getPose(reference_space).transform.matrix)
						vent.trigger("guide:place-item")
					} else {
						reticle.visible = false
					}
				}
			}

			time = performance.now();

			try {

				dispatch( events.update, { time: time - startTime, delta: time - prevTime } );
				animations.update()

			} catch ( e ) {

				console.error( ( e.message || e ), ( e.stack || '' ) );

			}

			renderer.render( scene, camera );

			prevTime = time;

		}

		this.play = function () {

			if ( renderer.xr.enabled ) $("#btn-container").append( arButton );

			startTime = prevTime = performance.now();

			document.addEventListener( 'keydown', onKeyDown );
			document.addEventListener( 'keyup', onKeyUp );
			document.addEventListener( 'pointerdown', onPointerDown );
			document.addEventListener( 'pointerup', onPointerUp );
			document.addEventListener( 'pointermove', onPointerMove );

			// console.log(arguments)
			dispatch( events.start, arguments );

			renderer.setAnimationLoop( animate );

		};

		this.stop = function () {

			if ( renderer.xr.enabled ) arButton.remove();

			document.removeEventListener( 'keydown', onKeyDown );
			document.removeEventListener( 'keyup', onKeyUp );
			document.removeEventListener( 'pointerdown', onPointerDown );
			document.removeEventListener( 'pointerup', onPointerUp );
			document.removeEventListener( 'pointermove', onPointerMove );

			dispatch( events.stop, arguments );

			renderer.setAnimationLoop( null );

		};

		this.render = function ( time ) {

			dispatch( events.update, { time: time * 1000, delta: 0 /* TODO */ } );

			renderer.render( scene, camera );

		};

		this.dispose = function () {

			renderer.dispose();

			camera = undefined;
			scene = undefined;

		};

		//

		this.onSessionStart = function() {
			scene_objects.map((o) => {
				o.visible = false
			})
			ar_objects.map((o) => {
				o.visible = true
			})
			target_object.visible = false
			vent.trigger("guide:move-phone")
		}

		function onSessionEnd() {
			hit_test_source_requested = false;
			hit_test_source = null;

			scene_objects.map((o) => {
				o.visible = true
			})
			ar_objects.map((o) => {
				o.visible = false
			})
			target_object.position.set(0,0,0)
			target_object.rotation.set(0,0,0)
			target_object.scale.set(1,1,1)
			target_object.visible = true

			camera.position.set(0,3,9)
			camera.rotation.set(0,0,0)

			vent.trigger("player:set-size", window.innerWidth, window.innerHeight)
			vent.trigger("ar:end")

			selected = false

			current_session.removeEventListener('end', onSessionEnd);
		}

		function onKeyDown( event ) {

			dispatch( events.keydown, event );

		}

		function onKeyUp( event ) {

			dispatch( events.keyup, event );

		}

		function onPointerDown( event ) {

			dispatch( events.pointerdown, event );

		}

		function onPointerUp( event ) {

			dispatch( events.pointerup, event );

		}

		function onPointerMove( event ) {

			dispatch( events.pointermove, event );

		}

		function onSelect() {
			if (reticle.visible && !selected) {
				reticle.matrix.decompose( target_object.position, target_object.quaternion, target_object.scale );
				const rescale = _.map(target_object.scale.toArray(), (v) => {return v * 0.4})
				target_object.scale.set(...rescale)
				target_object.visible = true
				vent.trigger("ar:selected")
				selected = true
			}
		}

		function reset() {
			target_object.visible = false
			selected = false
		}

	}

};

export { APP };
