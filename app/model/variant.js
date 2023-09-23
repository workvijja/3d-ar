const { Schema, model} = require("mongoose")
const {ThumbnailSchema} = require("#model/thumbnail.js")

const VariantSchema = new Schema({
    name: {type: String, required: true},
    thumbnail: ThumbnailSchema,
    url: {type: String}
}, {
    timestamps: true
})

const Variant = model("Variant", VariantSchema)

module.exports = {Variant, VariantSchema}