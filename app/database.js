module.exports = function() {
    const mongoose = require("mongoose")

    const uri = process.env.DATABASE_URL || "mongodb+srv://vijjasena:FHS3mn16kIqH8WPa@cluster0.jhav9ph.mongodb.net/?retryWrites=true&w=majority"
    mongoose.connect(uri, {useNewUrlParser: true})

    const db = mongoose.connection;
    db.on("error", console.error.bind(console, "connection error: "));
    db.once("open", function () {
        console.log("Connected successfully");
    });
}