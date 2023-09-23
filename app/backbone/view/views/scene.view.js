import * as THREE from '/javascripts/three.module.js';
import { APP } from '/use-case/view/app.js';
import { ARButton } from '/use-case/view/ARButton.js';
import { GLTFLoader } from '/javascripts/GLTFLoader.js';
import {DRACOLoader} from "/javascripts/DRACOLoader.js";

window.THREE = THREE; // Used by APP Scripts.
// window.VRButton = VRButton; // Used by APP Scripts.
window.ARButton = ARButton; // Used by APP Scripts.

// const gltfLoader = THREE.gltfLoader()
var gltfLoader = new GLTFLoader()
var dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath("/javascripts/draco/")
gltfLoader.setDRACOLoader(dracoLoader)

var SceneView = Backbone.View.extend({
    el: "#scene",

    initialize: async function() {
        try {
            // vent = vent
            // TODO: NNTI LANJUT TES AR DI ANDROID DLU
            // PLAN
            // ON SELECT
            // SET SCENE POSITION CLOSET POSITION KE RETICLE NYA
            // SESSION END BALIKIN POSISINYA

            this.player = new APP.Player();
            if (await this.load()) {
                this.animations = this.player.getAnimations()
                this.closet = this.player.getObjectByName(this.player.getScene(), "closet")
                this.cloth = this.player.getObjectByName(this.player.getScene(), "cloth")
                // console.log(this.cloth)
                this.opened = false
                this.render()
                this.set_events()
                vent.trigger("scene:created")
                // vent.trigger("open-animation")
            }
        } catch(e) {
            console.log(e)
        }
    },

    set_events: function() {
        window.addEventListener( 'resize', () => {
            this.player.setSize(window.innerWidth, window.innerHeight);
        });
        vent.on("scene:change-cloth", this.change_cloth, this)
        vent.on("ar:start", this.start_ar, this)
    },

    render: function() {
        this.player.setSize(window.innerWidth, window.innerHeight);
        this.player.play();
        this.$el.append(this.player.dom)
    },

    load: function() {
        return new Promise((resolve, reject) => {
            var loader = new THREE.FileLoader();
            loader.load(
                '/assets/world.json',
                (text) => {
                    this.player.load(JSON.parse( text ))
                    resolve(true)
                },
                (xhr) => {
                    vent.trigger("progress:loading", xhr.loaded / xhr.total)
                }
            );
        })
    },

    change_cloth: async function(url) {
        console.log(url)
        if (!["", null, undefined].includes(url)) {
            if (this.opened) await this.animations.close()
            await this.load_cloth(url)
            await this.animations.open()
            this.opened = true
            vent.trigger("scene:changed-cloth")
        }
    },

    load_cloth: function(url) {
        return new Promise(async (resolve, reject) => {
            console.log(this.cloth)
            this.cloth.children.forEach((c) => {this.cloth.remove(c)})
            this.cloth.add(await this.load_gltf(url))
            resolve()
        })
    },

    load_gltf: function(url) {
        return new Promise((resolve, reject) => {
            gltfLoader.load(url, (gltf) => {
                console.log(gltf)
                resolve(gltf.scene)
            })
        })
    },

    start_ar: function() {
        this.player.onSessionStart()
    }
})

export {SceneView}