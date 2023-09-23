const validate = (form) => {
    const d = $.Deferred()

    const payload = new FormData()

    const section = form.children("div")
    section.each(function (i) {
        const item = $(this)
        const item_id = item.attr("id")
        const containers = item.find("div[id|='" + item_id + "']")
        let index = i
        containers.each(function (i) {
            index += i
            const container = $(this)
            const inputs = container.find("input[id|='" + item_id + "']")
            inputs.each(function (i) {
                const input = $(this)
                const input_name = input.attr("id").split("-").pop()
                let input_value = (input.attr("type") === "file") ? input.prop("files")[0] : input.val();
                if (!input_value) {
                    d.reject(["Please fill", item_id, input_name, "field"].join(" "))
                    return false
                }
                payload.append([index, item_id, input_name].join("_"), input_value)
            })
            if (d.state() === "rejected") return false
        })
        if (d.state() === "rejected") return false
    })
    if (d.state() === "pending") d.resolve(payload)

    return d.promise()
}