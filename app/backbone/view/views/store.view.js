import {gsap} from "/javascripts/gsap/all.js"
import {ClothesView} from "/backbone/view/views/cloth.view.js";

var StoreView = Backbone.View.extend({
    el: "#store",
    model: Store,

    initialize: function(data) {
        this.model = new this.model(data)
        this.set_store_name()
        this.set_events()
        this.cloth = new ClothesView()
    },

    set_events: function() {
        vent.once("progress:loaded", this.fade_in, this)
        vent.once("scene:created", this.set_cloth, this)
        vent.on("cloth:change-name", this.set_cloth_name, this)
        vent.on("variant:change-name", this.set_variant_name, this)
    },

    fade_in: function() {
        gsap.to(this.el, {opacity: 1, duration: 1, ease: "power2.in"})
    },

    set_cloth: function() {
        // console.log(this.model.clothes)
        this.cloth.set(this.model.clothes)
    },

    set_store_name: function() {
        this.$("#store-name").html(this.model.name)
    },

    set_cloth_name: function(name) {
        this.$("#cloth-name").html(name)
    },

    set_variant_name: function(name) {
        this.$("#variant-name").html(name)
    }
})

export {StoreView}