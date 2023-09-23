const form = $("form")

const submit_button = $("#btn-submit")
const submit_button_text = $("#btn-submit-text")
const submit_button_spinner = $("#btn-submit .spinner-border")

const btn_upload_reset = () => {
    submit_button.prop("disabled", false)
    submit_button_text.html("Upload")
    submit_button_spinner.css({ "display": "none" })
}

const btn_upload_process = () => {
    submit_button.prop("disabled", true)
    submit_button_text.html("Uploading")
    submit_button_spinner.css({ "display": "" })
}

const upload = (e) => {
    e.preventDefault()
    btn_upload_process()

    validate(form).then((data) => {
        return insert_to_database(data)
    }).done((res) => {
        generate_link(res.link)
    }).catch((err) => {
        show_error(err.responseText || err)
    }).always(() => {
        btn_upload_reset()
    })
}
form.on("submit", upload)