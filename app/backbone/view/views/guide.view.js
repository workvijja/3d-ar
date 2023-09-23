import {gsap} from "/javascripts/gsap/all.js"

var GuideView = Backbone.View.extend({
    el: "#guide",

    initialize: function() {
        this.set_events()
        this.set_timeline()
    },

    set_timeline: function() {
        this.timeline = gsap.timeline({})
        this.timeline.to(this.el, {duration: 1, opacity: 1, ease: "power3.inOut"}, 0)
    },

    set_events: function() {
        // vent.on("guide:show", this.show, this)
        vent.once("guide:click-cloth", this.click_cloth, this)
        vent.once("guide:move-phone", this.move_phone, this)
        vent.once("guide:place-item", this.place_item, this)
    },

    show: function(text) {
        this.$("p").html(text)
        this.$el.removeClass("d-none")
        this.timeline
            .play(0)
            .then(() => {
                this.$el.one("click", this.hide.bind(this))
            })
    },

    hide: function() {
        this.timeline
            .reverse()
            .then(() => {
                this.$el.addClass("d-none")
            })
    },

    click_cloth: function() {
        this.show("Click cloth object to see detail")
    },

    move_phone: function() {
        this.show("Move phone to detect plane")
    },

    place_item: function() {
        this.show("Click screen to set closet placement")
    }
})

export {GuideView}