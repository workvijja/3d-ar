const { Schema, model} = require("mongoose")
const {ThumbnailSchema} = require("#model/thumbnail.js")
const {VariantSchema} = require("#model/variant.js")

const ClothSchema = new Schema({
    name: {type: String, required: true},
    description: {type: String, required: true},
    thumbnail: {type: ThumbnailSchema, required: true, default: {}},
    variants: {type: [VariantSchema], required: true, default: []}
}, {
    timestamps: true
})

const Cloth = model("Cloth", ClothSchema)

module.exports = {Cloth, ClothSchema}