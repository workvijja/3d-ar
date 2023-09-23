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
        this.$("#reset > button").on("click", this.reset.bind(this))
        vent.once("progress:loaded", this.fade_in, this)
        vent.once("scene:created", this.set_cloth, this)
        vent.on("cloth:change-name", this.set_cloth_name, this)
        vent.on("variant:change-name", this.set_variant_name, this)
        vent.on("ar:start", this.show_reset, this)
        vent.on("ar:end", this.hide_reset, this)
        vent.on("ar:selected", this.increase_opacity, this)
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
    },

    show_reset: function() {
        this.decrease_opacity()
        this.$("#reset").removeClass("d-none")
    },

    hide_reset: function() {
        this.increase_opacity()
        this.$("#reset").addClass("d-none")
    },

    decrease_opacity: function() {
        this.$el.addClass("opacity-50")
    },

    reset: function() {
        this.decrease_opacity()
        vent.trigger("ar:reset")
    },

    increase_opacity: function() {
        this.$el.removeClass("opacity-50")
    }


})

export {StoreView}