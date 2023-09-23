var OverlayView = Backbone.View.extend({
    el: "#overlay",

    initialize: function() {
        this.set_events()
        // this.resize()
    },

    set_events: function() {
        window.addEventListener('resize', this.resize.bind(this))
    },

    resize: function() {
        this.$el.css({width: window.innerWidth, height: window.innerHeight})
    }
})