var ModalView = Backbone.View.extend({
    el: "#modal",

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
    }
})