const insert_to_database = (payload) => {
    const d = $.Deferred()
    $.ajax({
        url: "/upload",
        type: "POST",
        enctype: 'multipart/form-data',
        data: payload,
        processData: false,
        contentType: false,
        success: function (res) {
            d.resolve(res)
        },
        error: function (err) {
            d.reject(err)
        }
    })
    return d.promise()
}