import {VariantsView} from "/backbone/view/views/variant.view.js";
import {gsap, Draggable, InertiaPlugin} from "/javascripts/gsap/all.js"
gsap.registerPlugin(Draggable, InertiaPlugin)

var ClothView = Backbone.View.extend({
    model: Cloth,

    initialize: function(data) {
        this.model = new this.model(data)
        this.$el = $(`<div class="item"></div>`)
        _.templateSettings = {
            evaluate:    /\[%(.+?)%]/g,
            interpolate: /\[%=(.+?)%]/g,
            escape:      /\[%-(.+?)%]/g
        }
        this.template = _.template($("#slider-item").html())
    },

    set_timeline: function() {
        this.timeline = gsap.timeline({repeat: -1, paused: true})
        this.timeline.addLabel("scale", 0)
        this.timeline.addLabel("fade-in", 0)
        this.timeline.addLabel("fade-out", 1.5)
        this.timeline.from(this.$(`.spinner`).get(0), {opacity: 0, width: "0%", height: "0%"}, 0)
        this.timeline.to(this.$(`.spinner`).get(0), {duration: 2, width: "100%", height: "100%", ease: "power1.inOut"}, "scale")
        this.timeline.to(this.$(`.spinner`).get(0), {duration: 1.5, opacity: 0.7, ease: "power3.in"}, "fade-in")
        this.timeline.to(this.$(`.spinner`).get(0), {duration: 0.5, opacity: 0, ease: "power2.out"}, "fade-out")
    },

    set_events: function() {
        this.$el.on("click", () => {console.log("clicked"); vent.trigger("clothes:slide-to", -this.$el.get(0).offsetLeft)})
    },

    render: function() {
        this.$el.html(this.template({url: this.model.thumbnail?.url || ""}))
        this.$el.attr("data-clickable", true)
        this.set_events()
        this.set_timeline()
        return this.$el
    },

    loading: function() {
        this.timeline.play(0)
    },

    loaded: function() {
        vent.trigger("cloth:change-name", this.model.name)
        this.timeline.tweenTo(2, {ease: "power2.out"})
        this.timeline.pause(0)
    }
})

var ClothesView = Backbone.View.extend({
    el: "#cloth",
    view: ClothView,
    views: [],

    initialize: function() {
        this.variants = new VariantsView()
        this.modal = new ModalView()
        this.set_events()
        this.set_timeline()
        this.loading = false
        this.draggable = Draggable.create(this.$(".items").get(0), {
            type: "x",
            edgeResistance: 1,
            snap: this.offsets,
            inertia: true,
            bounds: this.el,
            onDragEnd: this.slide.bind(this),
            allowNativeTouchScrolling: false,
            zIndexBoost: false,
            dragClickables: false
        }).pop()
        // this.set(data)
    },

    set_events: function() {
        window.addEventListener("resize", this.recalibrate.bind(this))
        vent.on("clothes:enable", this.enable, this)
        vent.on("clothes:disable", this.disable, this)
        vent.on("cloth:clicked", this.click, this)
        vent.on("clothes:slide-to", this.slide_to, this)
    },

    set_timeline: function() {
        this.timeline = gsap.timeline({repeat: -1, paused: true, yoyo: true})
        this.timeline.from(this.el, {opacity: 1}, 0)
        this.timeline.to(this.el, {duration: 1, opacity: 0.5, ease: "power1.inOut"}, 0)
    },

    render: function() {
        const items = this.$(".items").html("")
        _.each(this.views, (v) => {items.append(v.render())})
    },

    set: function(data) {
        // debugger
        console.log(data)
        _.map(this.views, (v) => {v.remove()})
        this.views = _.map(data, (d) => {return new this.view(d)})
        this.render()
        this.old_slide = this.active_slide = 0
        this.recalibrate()
        this.change()
    },

    get_offsets: function() {
        return _.map(this.views, (v) => {return -v.$el.get(0).offsetLeft})
    },

    recalibrate: function() {
        this.offsets = this.get_offsets()
        if (this.draggable) this.draggable.vars.snap = this.offsets
        gsap.set(this.$(".items").get(0), { x: this.offsets[this.active_slide] })
    },

    set_active_slide: function(x) {
        this.old_slide = this.active_slide
        this.active_slide = this.offsets.indexOf(x)
        this.active_slide = (this.active_slide < 0) ? 0 : this.active_slide
        this.active_slide = (this.active_slide > this.views.length - 1) ? this.views.length - 1 : this.active_slide
    },

    slide: function(e) {
        this.set_active_slide(this.draggable.endX)
        if (this.loaded_slide === this.active_slide) return
        this.change()
    },

    slide_to: function(offset) {
        this.set_active_slide(offset)
        if (this.loaded_slide === this.active_slide) return
        gsap.to(this.$(".items").get(0), 1, { x: this.offsets[this.active_slide], ease: "power2.inOut" });
        this.change()
    },

    change: function() {
        if (!this.loading && !this.variants.loading) {
            vent.trigger("variants:disable")
            this.loading = true
            this.play_timeline()
            this.views[this.active_slide].loading()
            this.loaded_slide = this.active_slide
            this.variants.set(this.views[this.active_slide].model.variants)
            this.views[this.active_slide].loaded()
            this.pause_timeline()
            this.loading = false
            vent.trigger("variants:enable")
        }
    },

    disable: function() {
        if (this.draggable) this.draggable.disable()
    },

    enable: function() {
        if (this.draggable) this.draggable.enable()
    },

    click: function() {
        const {name, description} = this.views[this.active_slide].model
        this.modal.show(name, description)
    },

    play_timeline: function() {
        this.timeline.play(0)
    },

    pause_timeline: function() {
        this.timeline.tweenTo(0, {duration: 0.5, ease: "power2.inOut"})
        this.timeline.pause(0)
    }
})

export {ClothesView}