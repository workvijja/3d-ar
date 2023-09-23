var Variant = Backbone.Model.extend({
    initialize: function(data) {
        Object.entries(data).forEach(([k, v]) => {
            this[k] = v
        })
    }
})