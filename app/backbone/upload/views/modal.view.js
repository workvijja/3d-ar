var modal_view = Backbone.View.extend({
    el: "#modal",
    view: link_view,

    initialize: function() {
        this.modal = new bootstrap.Modal(this.$el)
    },

    render: function(title="", body="") {
        this.$(".modal-title").html(title || "")
        this.$(".modal-body").html(body || "")
    },

    show: function(title="", body="") {
        this.render(title, body)
        this.modal.show()
    },

    generate_link: function(link) {
        const view = new this.view(link)
        this.show("Upload success", view.render())
        view.set_events(this)
        this.$el.one("hidden.bs.modal", () => {view.remove()})
    }
})