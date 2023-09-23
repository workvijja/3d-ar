var variant_view = Backbone.View.extend({
    initialize: function(counter) {
        this.counter = counter
        this.$el = $(`<div id="variant-container-${this.counter}" class="d-grid gap-3"></div>`)
        _.templateSettings = {
            evaluate:    /\[%(.+?)%]/g,
            interpolate: /\[%=(.+?)%]/g,
            escape:      /\[%-(.+?)%]/g
        }
        this.template = _.template($("#variant-template").html())
    },

    set_events: function() {
        const self = this
        self.$(`#btn-delete-${self.counter}`)?.on("click", self, self.remove)
        self.$("input").each(function() {
            const input = $(this)
            input.on("change", () => {
                const el = $(`.error-message[for=${input.attr("id")}]`)
                input.removeClass("is-invalid")
                el.addClass("d-none")
            })
        })
    },

    render: function() {
        this.$el.html(this.template({title: "variant", counter: this.counter}))
        this.set_events()
        return this.$el
    },

    remove: function(e) {
        const self = e.data
        self.$el.trigger("remove", self)
    },

    validate: async function() {
        return new Promise((resolve, reject) => {
            const self = this
            let is_filled = true
            self.$('.error-message').each(function() {
                const el = $(this)
                const input = $(`#${el.attr('for')}`)
                const data = (input.attr("type") === "file") ? input.prop("files")[0] : input.val()
                if (!data) {
                    is_filled = false
                    el.removeClass("d-none")
                    input.addClass("is-invalid")
                }
            })
            resolve(is_filled)
        })
    }
})

var variants_view = Backbone.View.extend({
    el: "#variant",
    view: variant_view,
    list_view: [],

    initialize: function() {
        this.counter = 0
        this.set_events()
        this.$("#btn-add-row").click()
    },

    set_events: function() {
        this.$("#file-info").on("click", () => {vent.trigger("view-guide")})
        this.$("#btn-add-row").on("click", this, this.add)
    },

    add: function(e) {
        const self = e.data
        const view = new self.view(self.counter)
        self.list_view.push(view)
        self.$el.append(view.render())
        view.$el.on("remove", self, self.remove)
        self.counter++
    },

    remove: function(e, view) {
        const self = e.data
        self.list_view = _.without(self.list_view, view)
        view.$el.remove()
    },

    validate: async function() {
        return new Promise(async (resolve, reject) => {
            try {
                const is_filled = await Promise.all(_.map(this.list_view, (v) => {return v.validate()}))
                resolve(is_filled.every((i) => {return i}))
            } catch (e) {
                throw e
            }
        })
    }
})