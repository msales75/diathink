///<reference path="../views/View.ts"/>
m_require("app/views/View.js");
$(function () {
    var vmousedown = 'mousedown';
    if ($D.is_touch_device) {
        vmousedown = 'touchstart';
    }
    $(document.body).on(vmousedown, 'textarea', function (e) {
        // todo: does this have performance issues (on Firefox) - stop using this?
        //  eventually vmousedown instead?
        // console.log('Check call-count: calling '+ e.type+' for textarea');
        if (e.type == 'focusout') {
            // does this occur on manual keyboard-close?
            // console.log('blurring keyboard from focusout');
            // $D.keyboard.blur();
            if ($D.focused) {
                $D.focused.header.name.text.blur();
            }
            $D.focused = null;
            return;
        }
        if ($D.focused) {
            $D.focused.header.name.text.blur();
        }
        if (e.target && e.target.nodeName && e.target.nodeName.toLowerCase() === 'textarea') {
            //console.log('focusing keyboard from focusin');
            $D.focused = View.getFromElement(e.target).nodeView;

            // check if keyboard opened
            // $D.keyboard.focus();
            $D.focused.header.name.text.focus();
        } else {
            // check if keyboard closed
            // console.log('blurring keyboard from focusin');
            // $D.keyboard.blur();
            if ($D.focused) {
                $D.focused.header.name.text.blur();
            }
            $D.focused = null;
        }
    });
    $(document.body).on(vmousedown, '.disclose', function (e) {
        var targetView = View.get(this.id).parentView.name.text;

        // add a class for non-text focus
        $(targetView.elem).addClass('hide-selection').selectText().focus().selectText();
    });
    $(document.body).on(vmousedown, 'textarea', function (e) {
        $(this).removeClass('hide-selection');
    });
});
//# sourceMappingURL=mousedown.js.map
