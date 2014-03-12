///<reference path="../views/View.ts"/>
m_require("app/views/View.js");
$(function() {
    var vmousedown:string = 'mousedown';
    if ($D.is_touch_device) {
        vmousedown = 'touchstart';
    }
    $(document.body).on(vmousedown, 'textarea', function(e) {
        // todo: does this have performance issues (on Firefox) - stop using this?
        //  eventually vmousedown instead?
        // console.log('Check call-count: calling '+ e.type+' for textarea');
        $(this).removeClass('hide-selection');
        if (e.type == 'focusout') {
            // does this occur on manual keyboard-close?
            // console.log('blurring keyboard from focusout');
            // $D.keyboard.blur();
            if ($D.focused && $D.focused.elem) {
                $D.focused.header.name.text.blur();
            }
            $D.focused = null;
            return;
        }
        if ($D.focused && $D.focused.elem) {
            $D.focused.header.name.text.blur();
        }
        if (<HTMLElement>e.target && (<HTMLElement>e.target).nodeName && (<HTMLElement>e.target).nodeName.toLowerCase() === 'textarea') {
            //console.log('focusing keyboard from focusin');
            $D.focused = View.getFromElement(<HTMLElement>e.target).nodeView;
            // check if keyboard opened
            // $D.keyboard.focus();
            $D.focused.header.name.text.focus();
        } else {
            // check if keyboard closed
            // console.log('blurring keyboard from focusin');
            // $D.keyboard.blur();
            if ($D.focused && $D.focused.elem) {
                $D.focused.header.name.text.blur();
            }
            $D.focused = null;
        }
    });
    $(document.body).on(vmousedown, '.disclose', function(e) {
        var targetView = View.get(this.id).parentView.name.text;
        // add a class for non-text focus
        $(targetView.elem).addClass('hide-selection').selectText().focus().selectText();
    });
});
