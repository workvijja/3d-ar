const { Schema, model} = require("mongoose")
const {ClothSchema} = require("#model/cloth.js")

const StoreSchema = new Schema({
    name: {type: String, required: true, unique: true},
    clothes: {type: [ClothSchema], required: true, default: []}
}, {
    timestamps: true
})

const Store = model("Store", StoreSchema)

module.exports = {Store, StoreSchema}