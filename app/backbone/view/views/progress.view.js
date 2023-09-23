import {gsap} from "/javascripts/gsap/all.js"

var ProgressView = Backbone.View.extend({
    el: "#progress",

    initialize: function() {
        // this.vent = vent
        this.set_events()
        this.set_timeline()
    },

    set_timeline: function() {
        this.current_duration = 0
        this.duration = 3
        this.timeline = gsap.timeline()
        this.timeline.to(".progress-bar", {width: "100%", duration: this.duration}, 0)
    },

    set_events: function() {
        vent.on("progress:loading", this.loading, this)
        vent.once("scene:created", this.loaded, this)
    },

    loading: function(value) {
        const duration = this.duration * (value % 1)
        this.current_duration = (duration < this.current_duration) ? this.current_duration : duration
        if (!this.timeline.isActive()) this.timeline.tweenTo(this.current_duration, {ease: "power3.inOut"})
    },

    loaded: function() {
        vent.off("progress:loading")
        this.timeline.tweenTo(this.duration, {ease: "power3.inOut"})
            .then(() => {
                vent.trigger("progress:loaded")
                gsap.to(this.el, {opacity: 0, duration: 2, ease: "power2.out"})
                    .then(() => {
                        vent.trigger("guide:click-cloth")
                        this.$el.addClass("d-none")
                    })
            })
    }
})

export {ProgressView}