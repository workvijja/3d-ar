const {folder} = require("#config.js")
const _ = require("underscore")
const formidable = require('formidable')
const path = require("path")
const shortid = require("shortid");
const {insert_store} = require("#service/upload.js")

const parse_form = (req) => {
    return new Promise(async (resolve, reject) => {
        const form = new formidable.IncomingForm()
        form.uploadDir = folder.temp

        await form.parse(req,     (err, fields, files) => {
            if (err) throw (err)
            resolve(Object.assign(fields, files))
        })
    })
}

const convert_file = (type, file) => {
    const file_object = {
        old_path: file.filepath,
        new_path: path.join(folder[type], `${shortid.generate()}.${file.originalFilename.split(".").pop()}`)
    }
    const directories = file_object.new_path.split("\\")
    const save_path = "/" + directories.slice(directories.indexOf("items")).join("/")

    return {save_path: save_path, file_object: file_object}
}

const init_data = (fields) => {
    return new Promise((resolve, reject) => {
        const data = {
            store_data: {
                name: fields["store_name"].pop()
            },
            directories: []
        }

        const cloth = {
            name: fields["cloth_name"].pop(),
            description: fields["cloth_description"].pop(),
            thumbnail: {}
        }

        const cloth_thumbnail_convert_result = convert_file("thumbnail", fields["cloth_thumbnail"].pop())
        cloth.thumbnail.url = cloth_thumbnail_convert_result.save_path
        data.directories.push(cloth_thumbnail_convert_result.file_object)

        // const cloth_file_convert_result = convert_file("file", fields["cloth_file"].pop())
        // cloth.url = cloth_file_convert_result.save_path
        // data.directories.push(cloth_file_convert_result.file_object)

        const variant_keys = _.groupBy(_.filter(_.keys(fields), (k) => {return k.includes("variant")}), (k) => {
            return k.split("_")[0].split("-")[1]
        })
        const variants = []
        _.each(_.values(variant_keys), (keys) => {
            const variant = {}
            _.each(keys, (k) => {
                const v = fields[k].pop()
                const key = k.split("_")[1]
                if (key === "file" || key === "thumbnail") {
                    const convert_result = convert_file(key, v)
                    data.directories.push(convert_result.file_object)
                    if (key === "thumbnail") variant.thumbnail = {url: convert_result.save_path}
                    else variant.url = convert_result.save_path
                } else {
                    variant[key] = v
                }
            })
            variants.push(variant)
        })
        cloth.variants = variants
        data.store_data.clothes = cloth
        resolve(data)
    })
}

const get = (req, res, next) => {
    req.context = {
        title: "Upload",
        script_path: "./upload/script_new",
        body_path: "./upload/index_new"
    }
    next()
}

const post = async (req, res) => {
    try {
        const parsed_form = await parse_form(req)
        console.log(parsed_form)
        const data = await init_data(parsed_form)
        console.log(data)
        const result = await insert_store(data)
        const link = `${req.protocol}://${req.get('host')}/view/${result.store_id}/${result.cloth_id}`
        res.status(200).send(link)
    } catch (error) {
        console.log(error)
        res.status(500).send(error?.message || error)
    }
}

module.exports = {get, post}