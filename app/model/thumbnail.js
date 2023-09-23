const { Schema, model} = require("mongoose")

const ThumbnailSchema = new Schema({
    url: {type: String}
}, {
    timestamps: true
})

const Thumbnail = model("Thumbnail", ThumbnailSchema)

module.exports = {Thumbnail, ThumbnailSchema}