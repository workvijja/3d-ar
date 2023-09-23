const {Store} = require("#model/store.js")
const _ = require("underscore")

const to_object = (doc) => {
    return doc.toObject({virtuals: true, transform: (doc, ret) => {delete ret._id; delete ret.__v; return ret}})
}

const get_store = (store_id, cloth_id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const store = await Store.findById(store_id)
            let cloth
            if (cloth_id) cloth = to_object(store.clothes.id(cloth_id))
            to_object(store)
            if (cloth) {
                store.clothes.splice(_.map(store.clothes, (c) => {return c.id}).indexOf(cloth_id), 1)
                store.clothes.unshift(cloth)
            }
            resolve(JSON.stringify(store))
        } catch (e) {
            reject(e)
        }
    })
}

module.exports = {get_store}