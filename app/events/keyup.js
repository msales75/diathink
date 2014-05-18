///<reference path="../views/View.ts"/>
m_require("app/views/View.js");
$(function () {
    // Note: input and paste do not bubble, so these don't work.
    $(document.body).on('keyup change input paste', 'textarea', function (e) {
        var view = View.get($(this).attr('id'));
        view.setValueFromDOM();
        view.resizeUp();
    });
});
//# sourceMappingURL=keyup.js.map
