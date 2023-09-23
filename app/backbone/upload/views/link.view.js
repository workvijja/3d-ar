var link_view = Backbone.View.extend({
    initialize: function(link) {
        this.link = link
        this.$el = $("<div class='d-flex flex-column px-4 py-3'></div>")
        _.templateSettings = {
            evaluate:    /\[%(.+?)%]/g,
            interpolate: /\[%=(.+?)%]/g,
            escape:      /\[%-(.+?)%]/g
        }
        this.template = _.template($("#link-template").html())
    },

    set_events: function(self) {
        self.$("#btn-copy-link").on("click", self, this.copy)
        this.init_download(self)
    },

    render: function() {
        this.$el.html(this.template({link: this.link}))
        return $("<div></div>").append(this.$el).html()
    },

    copy: function(e) {
        const self = e.data
        const link_input = self.$("#link-input")
        navigator.clipboard.writeText(link_input.val())
            .then(() => {
                self.$("#btn-copy-link > i")
                    .removeClass("bi-clipboard")
                    .addClass("bi-clipboard-check")
                alert("Link copied!")
            })
    },

    init_download: function(self) {
        const btn_download_img = self.$("#btn-download-img")
        btn_download_img.prop("disabled", true)
        const img = self.$("#qr-img").get(0)
        img.onload = () => {
            const canvas = document.createElement("canvas")
            canvas.width = 600
            canvas.height = 600
            const ctx = canvas.getContext("2d")
            ctx.drawImage(img, 0, 0)
            const dataURL = canvas.toDataURL("image/png")
            btn_download_img
                .prop("href", dataURL)
                .prop("download", "qr-code.png")
                .prop("disabled", false)
        }
    }
})