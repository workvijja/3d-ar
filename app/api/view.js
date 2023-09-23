const {get_store} = require("#service/view.js");

const get = async (req, res, next) => {
    try {
        const {store_id, cloth_id} = req.params
        const result = await get_store(store_id, cloth_id)
        // res.status(200).send(result)
        req.context = {
            title: "View",
            script_path: "./view/script",
            body_path: "./view/index",
            data: result
        }
        next()
    } catch (error) {
        // TODO OKE BRATI NNTI ARAHIN KE 404 AJA
        console.log(error)
        res.status(500).send(error?.message || error)
    }
}

module.exports = {get}