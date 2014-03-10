///<reference path="../views/View.ts"/>
m_require("app/views/View.js");

$D.setFocus = function (view) {
    var nView = null;
    if (view) {
        nView = view.nodeView;
    }
    if ($D.focused && (nView !== $D.focused)) {
        if ($D.focused && $D.focused.elem && $D.focused.elem.parentNode) {
            $D.focused.header.name.text.blur();
        }
    }
    if (nView && (nView !== $D.focused)) {
        $D.focused = nView;
        nView.header.name.text.focus();
    } else if (!nView) {
        $D.focused = null;
    }
};
//# sourceMappingURL=focus.js.map
