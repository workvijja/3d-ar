const { pool, insert_query, select_query, begin_transaction, commit } = require('../database.js')

const insert_store = (connection, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const results = await insert_query(connection, "store", data)
            console.log(results.message)
            resolve(results.data)
        } catch (error) {
            reject(error)
        }
    })
}

const select_store = (connection, select, filter=[], sort=[]) => {
    return new Promise(async (resolve, reject) => {
        try {
            const results = await select_query(connection, "store", select, filter, sort)
            console.log(results.message)
            resolve(results.data)
        } catch (error) {
            reject(error)
        }
    })
}

const insert_thumbnail = (connection, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const results = await insert_query(connection, "thumbnail", data)
            console.log(results.message)
            resolve(results.data)
        } catch (error) {
            reject(error)
        }
    })
}

const insert_cloth = (connection, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const results = await insert_query(connection, "cloth", data)
            console.log(results.message)
            resolve(results.data)
        } catch (error) {
            reject(error)
        }
    })
}

const insert_texture = (connection, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const results = await insert_query(connection, "texture", data)
            console.log(results.message)
            resolve(results.data)
        } catch (error) {
            reject(error)
        }
    })
}

const insert = (data) => {
    return new Promise(async (resolve, reject) => {
        await pool.getConnection(async (err, connection) => {
            try {
                if (err) throw { message: "Failed to connect to database. " + err.message }
                
                console.log(await begin_transaction(connection))

                const {store, cloth, texture} = data
                const results_store = await select_store(connection, ["id"], [{property: "name", operator: "LIKE", value: store.name}])
                const store_id = (results_store.length > 0) ? results_store[0].id : await insert_store(connection, store)
                console.log(store_id)

                const cloth_thumbnail_id = await insert_thumbnail(connection, { url: "data.object[0].thumbnail_save_path" })
                console.log(cloth_thumbnail_id);

                const cloth_id = await insert_cloth(connection, { store_id: store_id, thumbnail_id: cloth_thumbnail_id, name: "data.object[0].name", description: "data.object[0].description", url: "data.object[0].file_save_path" })
                console.log(cloth_id)

                const array_texture = ["texture 1", "texture 2", "texture 3"]
                for (const t of array_texture) {
                    console.log(t)
                    const texture_thumbnail_id = await insert_thumbnail(connection, { url: "t.thumbnail_save_path" })
                    console.log(texture_thumbnail_id);
                    const texture_id = await insert_texture(connection, { cloth_id: cloth_id, thumbnail_id: texture_thumbnail_id, name: t, url: "t.file_save_path" + t })
                    console.log(texture_id);
                }

                // TODO TAMBAHIN MODULE PINDAHIN DATA

                console.log(await commit(connection))
                resolve({message: "Upload Success", store_name: tes_store_name, cloth_id: cloth_id})
            } catch (error) {
                connection.rollback()
                reject(error.message || error)
            } finally {
                connection.release()
            }
        })
    })
}

module.exports = {insert}