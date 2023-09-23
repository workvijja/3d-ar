var form_view = Backbone.View.extend({
    list_view: [],
    el: "form",
    modal: new modal_view(),

    initialize: function() {
        this.set_events()
        this.list_view.push(new store_view(), new cloth_view(), new variants_view())
    },

    set_events: function() {
        const submit_button = this.$("#btn-submit")
        submit_button.on("disable", this, this.disable_button)
        submit_button.on("reset", this, this.reset_button)
        this.$el.on("submit", this, this.upload)
        vent.on("view-guide", this.view_guide, this)
    },

    view_guide: function() {
        this.modal.show("3D Object File Guide", $("#guide-template").html())
    },

    disable_button: function(e) {
        const self = e.data
        self.$("#btn-submit").prop("disabled", true)
        self.$("#btn-submit > p").html("Uploading")
        self.$("#btn-submit > .spinner-border").toggleClass("d-none")
    },

    reset_button: function(e) {
        const self = e.data
        self.$("#btn-submit").prop("disabled", false)
        self.$("#btn-submit > p").html("Upload")
        self.$("#btn-submit > .spinner-border").toggleClass("d-none")
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
    },

    compile: function() {
        this.form_data = new FormData(this.el)
        for (const f of this.form_data.entries()) {
            console.log(f)
        }
    },

    post: function() {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: "/upload",
                type: "POST",
                enctype: 'multipart/form-data',
                data: this.form_data,
                processData: false,
                contentType: false,
                success: function (res) {
                    console.log(res)
                    resolve(res)
                },
                error: function (err) {
                    console.log(err)
                    reject(err)
                }
            })
        })
    },

    upload: async function(e) {
        e.preventDefault()
        const self = e.data
        const submit_button = self.$("#btn-submit")
        try {
            submit_button.trigger("disable")
            if (await self.validate()) {
                self.compile()
                const link_result = await self.post()
                self.modal.generate_link(link_result)
                self.reset()
            }
        } catch(e) {
            console.log(e)
            self.modal.show("Error", e)
        } finally {
            submit_button.trigger("reset")
        }
    },

    reset: function() {
        this.el.reset()
    }
})