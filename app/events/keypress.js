///<reference path="../views/View.ts"/>
///<reference path="keydown.ts"/>
m_require("app/views/View.js");
$D.handleKeypress = function (view, e) {
    var id = view.id;
    var key = String.fromCharCode(e.charCode);
    var liView, collection, sel;
    liView = View.get(id).parentView.parentView.parentView;
    if (key === ' ') {
        sel = view.getSelection();

        // check if cursor is on far left of textbox
        if (sel && (sel[0] === 0) && (sel[1] === 0)) {
            // get parent-collection and rank
            collection = liView.parentView.value;

            // validate rank >0
            if (collection.prev[liView.value.cid] !== '') {
                // make it the last child of its previous sibling
                scheduleKey(e.simulated, id, function () {
                    return {
                        actionType: MoveIntoAction,
                        anim: 'indent',
                        activeID: liView.value.cid,
                        referenceID: collection.prev[liView.value.cid],
                        oldRoot: liView.nodeRootView.id,
                        newRoot: liView.nodeRootView.id,
                        focus: true
                    };
                });
                e.preventDefault();
                return;
            }
        }
    }
    if (e.simulated) {
        sel = view.getSelection();

        // console.log("simulate keypress = "+key);
        // todo: manually draw char and move cursor
        if (sel) {
            var start = sel[0];
            var end = sel[1];
            var value = view.getValue();
            view.setValue(value.substr(0, start) + key + value.substr(end));
            view.setCursor(start + 1);
        }
    }
};
$(function () {
    $(window).on('keypress', function (e) {
        console.log('Acknowledging keypress, char="' + String.fromCharCode(e.charCode) + '"');
        if (ActionManager.queue.length === 0) {
            // retain browser-default behavior
            if (View.focusedView) {
                $D.handleKeypress(View.focusedView.header.name.text, e);
                console.log('Handled keypress, char=' + String.fromCharCode(e.charCode));
            } else {
                console.log('Lost keypress with nothing focused');
            }
        } else {
            console.log("Delaying keypress, char=" + String.fromCharCode(e.charCode));
            ActionManager.schedule(function () {
                if (View.focusedView) {
                    e.simulated = true;
                    $D.handleKeypress(View.focusedView.header.name.text, e);
                    console.log('Handled delayed keypress, char=' + String.fromCharCode(e.charCode));
                } else {
                    console.log('Lost keypress with nothing focused');
                }
                return null;
            });
            e.preventDefault();
        }
        e.stopPropagation();
    });
});
//# sourceMappingURL=keypress.js.map
