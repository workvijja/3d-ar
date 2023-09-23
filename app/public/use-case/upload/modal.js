const modal = new bootstrap.Modal($('#modal'))
const modal_title = $('.modal-title')
const modal_body = $('.modal-body')

const show_modal = (content) => {
    modal_title.html(content.title || "")
    modal_body.html(content.body || "")
    modal.show()
}
