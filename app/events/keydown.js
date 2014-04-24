///<reference path="../views/View.ts"/>
m_require("app/views/View.js");

// only handle non-ascii characters in keydown
function scheduleKey(simulated, id, opts) {
    var schedule;
    if (simulated) {
        ActionManager.subschedule(function () {
            return Action.checkTextChange(id);
        }, opts);
    } else {
        ActionManager.schedule(function () {
            return Action.checkTextChange(id);
        }, opts);
    }
}
;
$D.handleKeydown = function (view, e) {
    var id = view.id;
    var liView, collection, sel;
    liView = view.nodeView;
    if (e.which === 9) {
        collection = liView.parentView.value;

        // validate not first in list
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
    } else if (e.which === 8) {
        sel = view.getSelection();
        if (sel && (sel[0] === 0) && (sel[1] === 0)) {
            // get parent-collection and rank
            collection = liView.parentView.value;

            // if it is the last item in its collection
            if ((liView.parentView.nodeView instanceof NodeView) && (collection.next[liView.value.cid] === '')) {
                // make it the next child of its parent
                scheduleKey(e.simulated, id, function () {
                    return {
                        actionType: OutdentAction,
                        anim: 'indent',
                        activeID: liView.value.cid,
                        referenceID: liView.value.attributes.parent.cid,
                        oldRoot: liView.nodeRootView.id,
                        newRoot: liView.nodeRootView.id,
                        focus: true
                    };
                });
                e.preventDefault();
                return;
            } else {
                if ($('#' + id).val() === "") {
                    if (liView.value.get('children').count === 0) {
                        scheduleKey(e.simulated, id, function () {
                            return {
                                actionType: DeleteAction,
                                anim: 'delete',
                                activeID: liView.value.cid,
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
        }
    } else if (e.which === 13) {
        // todo: split line if in middle of text
        scheduleKey(e.simulated, id, function () {
            return {
                actionType: InsertAfterAction,
                anim: 'create',
                referenceID: liView.value.cid,
                oldRoot: liView.nodeRootView.id,
                newRoot: liView.nodeRootView.id,
                focus: true
            };
        });
        e.preventDefault();
        // var scrollid = $('#'+id).closest('.ui-scrollview-clip').attr('id');
        // View.get(scrollid).themeUpdate();
    }
    e.stopPropagation();
    if (e.simulated && (e.which === 8)) {
        if (sel) {
            var start = sel[0];
            var end = sel[1];
            var value = view.getValue();
            if (end > 0) {
                view.setValue(value.substr(0, start - 1) + value.substr(end));
                view.setCursor(start - 1);
            }
        }
        // console.log("simulate backspace");
    }
};
$(function () {
    $(window).on('keydown', function (e) {
        var keyDownCodes = { 8: 8, 9: 9, 13: 13 };
        if (!keyDownCodes[e.which]) {
            return true;
        }
        console.log('Acknowledging keydown, code=' + e.which);

        /*
        if (e.target.nodeName.toLowerCase()!=='textarea') {
        if (e.which === 8) { // prevent backspace-back
        e.preventDefault();
        e.stopPropagation();
        return;
        } else {
        return true; // don't modify other keyboard strokes?
        }
        } */
        if (ActionManager.queue.length === 0) {
            // retain browser-default behavior
            if (View.focusedView) {
                $D.handleKeydown(View.focusedView.header.name.text, e);
                console.log('Handled keydown, code=' + e.which);
            } else {
                console.log('Missed keydown, nothing focused');
            }
        } else {
            console.log('Delaying keydown, code=' + e.which);
            ActionManager.schedule(function () {
                if (View.focusedView) {
                    e.simulated = true;
                    $D.handleKeydown(View.focusedView.header.name.text, e);
                    console.log('Handled delayed keydown, code=' + e.which);
                } else {
                    console.log('Missed delayed keydown, nothing focused');
                }
                return null;
            });
            e.preventDefault();
        }
        e.stopPropagation();
        return true;
    });
});
//# sourceMappingURL=keydown.js.map
