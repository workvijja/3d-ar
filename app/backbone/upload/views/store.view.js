var store_view = Backbone.View.extend({
    el: "#store",

    initialize: function() {
        this.set_events()
    },

    set_events: function() {
        const self = this
        self.$("input").each(function() {
            const input = $(this)
            input.on("change", () => {
                const el = $(`.error-message[for=${input.attr("id")}]`)
                input.removeClass("is-invalid")
                el.addClass("d-none")
            })
        })
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