const {Store} = require("#model/store.js")
const _ = require("underscore")
const fs = require("fs").promises

const insert_store = (data) => {
    return new Promise(async (resolve, reject) => {
        const {store_data, directories} = data
        try {
            for await (const d of directories) {
                await fs.rename(d.old_path, d.new_path)
            }
            let store
            try {
                store = new Store(store_data)
                await store.save()
            } catch (e) {
                store = await Store.findOne({name: store_data.name})
                store.clothes.push(store_data.clothes)
                await store.save()
            }
            const store_id = store.id
            const cloth_id = store.clothes[store.clothes.length - 1].id
            resolve({store_id: store_id, cloth_id: cloth_id})
        } catch (e) {
            reject(e)
        }
    })
}

module.exports = {insert_store}