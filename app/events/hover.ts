///<reference path="../views/View.ts"/>
m_require("app/views/View.js");

$(function() {
// handle hovering-class, also retain class for 500ms in case it's followed by focus class
    $D.hoverItem = null, $D.hoverTimer = null;
    if (!$D.is_touch_device) {
        $(document.body).on('mouseover mouseout', function (e) {
            // find the closest li to the target
            var li:NodeView = View.getFromElement(<HTMLElement>e.target).nodeView;
            if (!li) {
                return;
            }
            if ($D.timer) {
                clearTimeout($D.timer);
            }
            if (e.type === 'mouseover') {
                if ($D.hoverItem && $D.hoverItem.elem && (li !== $D.hoverItem)) {
                    $D.hoverItem.removeClass('ui-btn-hover-c');
                }
                li.addClass('ui-btn-hover-c');
                $D.hoverItem = li;
            } else if (e.type === 'mouseout') {
                if (li === $D.hoverItem) {
                    $D.timer = setTimeout(function () {
                        if (li.elem) {
                            li.removeClass('ui-btn-hover-c');
                        }
                    }, 500);
                } else { // if a different item is hovering do nothing
                }
            }
        });
    }
});
