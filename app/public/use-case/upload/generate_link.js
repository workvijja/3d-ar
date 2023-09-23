const init_body = (view_link) => {
    const content = `
        <div class="d-flex flex-column px-4 py-3">
            <h2 class="text-center fw-bold mb-4">Copy link or download QR</h2>
            <div class="input-group mb-4">
                <input type="text" readonly class="form-control" id="link-input"
                    value="${view_link}">
                <div class="input-group-append">
                    <button id="btn-copy-link" class="btn btn-outline-secondary" type="button"><i class="bi bi-clipboard"></i></button>
                </div>
            </div>
            <div class="p-4 border rounded-2 mb-4">
                <img id="qr-img" crossorigin="anonymous" class="w-100" src="https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${view_link}">
            </div>
            <a id="btn-download-img" class="btn btn-primary">Download QR</a>
        </div>
    `
    return content
}

const copy = () => {
    const btn_copy_link = $("#btn-copy-link")
    btn_copy_link.on("click", function (e) {
        const link_input = $("#link-input")
        navigator.clipboard.writeText(link_input.val())
            .then(() => {
                const icon = btn_copy_link.children("i")
                icon.removeClass("bi-clipboard")
                icon.addClass("bi-clipboard-check")
            })
    })
}

const download_image = () => {
    const btn_download_img = $("#btn-download-img")
    btn_download_img.prop("disabled", true)
    const img = document.getElementById("qr-img")
    img.onload = () => {
        const canvas = document.createElement("canvas")
        canvas.width = 600
        canvas.height = 600
        const ctx = canvas.getContext("2d")
        ctx.drawImage(img, 0, 0)
        const dataURL = canvas.toDataURL("image/png")

        btn_download_img.prop("href", dataURL)
        btn_download_img.prop("download", "qr-code.png")
    }
}

const generate_link = (link) => {
    $.when(show_modal({title: "Upload Success", body: init_body(link)}))
        .then(() => {
            copy()
            download_image()
        })
}