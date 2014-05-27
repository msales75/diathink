///<reference path="../views/View.ts"/>
m_require("app/views/View.js");

// only handle non-ascii characters in keydown
function scheduleKey(simulated, id, opts) {
    var schedule;
    if (!View.focusedView || !View.focusedView.elem) {
        ActionManager.schedule(opts);
    } else {
        if (simulated) {
            ActionManager.subschedule(function () {
                return Action.checkTextChange(View.focusedView.header.name.text.id);
            }, opts);
        } else {
            ActionManager.schedule(function () {
                return Action.checkTextChange(View.focusedView.header.name.text.id);
            }, opts);
        }
    }
}
;
$D.handleLineBackspace = function (view, subschedule) {
    var liView = view.nodeView;

    // get parent-collection and rank
    var collection = liView.parentView.value;

    // if it is the last item in its collection
    if ((liView.parentView.nodeView instanceof NodeView) && (collection.next[liView.value.cid] === '')) {
        if (subschedule) {
            assert(view === View.focusedView.header.name.text, "");
            if (View.focusedView.value.get('text') !== View.focusedView.header.name.text.value) {
                console.log('handleLineBackspace 1, change being processed before outdent');
            } else {
                console.log('handleLineBackspace 2, no text change found before outdent');
            }
        }

        // make it the next child of its parent
        scheduleKey(subschedule, '', function () {
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
        return;
    } else {
        var isEmpty = false;
        if ($D.is_android) {
            if (view.elem.value === " ") {
                isEmpty = true;
            }
        } else {
            if (view.elem.value === "") {
                isEmpty = true;
            }
        }
        if (isEmpty) {
            if (liView.value.get('children').count === 0) {
                if (((liView.value.attributes.links == null) || (liView.value.attributes.links.count === 0)) && ((liView.value.attributes.backLinks == null) || (liView.value.attributes.backLinks.count === 0))) {
                    if (subschedule) {
                        assert(view === View.focusedView.header.name.text, "");
                        if (View.focusedView.value.get('text') !== View.focusedView.header.name.text.value) {
                            console.log('handleLineBackspace 3, change being processed before delete');
                        } else {
                            // TESTED ON ANDROID
                            console.log('handleLineBackspace 4, no text change found before delete');
                        }
                    }
                    scheduleKey(subschedule, '', function () {
                        return {
                            actionType: DeleteAction,
                            anim: 'delete',
                            activeID: liView.value.cid,
                            oldRoot: liView.nodeRootView.id,
                            newRoot: liView.nodeRootView.id,
                            focus: true
                        };
                    });

                    // e.preventDefault();
                    return;
                } else {
                    if (subschedule) {
                        console.log('handleLineBackspace 5, Cannot outdent, text content has links');
                    }
                }
            } else {
                if (subschedule) {
                    console.log('handleLineBackspace 6, Cannot outdent, text content has children');
                }
            }
        } else {
            if (subschedule) {
                console.log('handleLineBackspace 7, Cannot outdent, text content is not empty');
            }
        }
    }
    // if no action was taken, bounce the cursor back
    // view.elem.value = ' '+view.elem.value;
};

function profileIndent(id) {
    var view = View.get(id);
    var liView, collection;
    liView = view.nodeView;
    collection = liView.parentView.value;

    // validate not first in list
    if (collection.prev[liView.value.cid] !== '') {
        // make it the last child of its previous sibling
        scheduleKey(false, id, function () {
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
    }
}
function profileOutdent(id) {
    var view = View.get(id);
    var liView = view.nodeView;

    // get parent-collection and rank
    var collection = liView.parentView.value;

    // if it is the last item in its collection
    if ((liView.parentView.nodeView instanceof NodeView) && (collection.next[liView.value.cid] === '')) {
        // make it the next child of its parent
        scheduleKey(false, id, function () {
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
    }
}
function profileDelete(id) {
    var liView = View.get(id).nodeView;
    if ($('#' + id).val() === "") {
        if (liView.value.get('children').count === 0) {
            if (((liView.value.attributes.links == null) || (liView.value.attributes.links.count === 0)) && ((liView.value.attributes.backLinks == null) || (liView.value.attributes.backLinks.count === 0))) {
                scheduleKey(false, id, function () {
                    return {
                        actionType: DeleteAction,
                        anim: 'delete',
                        activeID: liView.value.cid,
                        oldRoot: liView.nodeRootView.id,
                        newRoot: liView.nodeRootView.id,
                        focus: true
                    };
                });
            }
        }
    }
}
function profileCreate(id) {
    var liView = View.get(id).nodeView;
    scheduleKey(false, id, function () {
        return {
            actionType: InsertAfterAction,
            anim: 'create',
            referenceID: liView.value.cid,
            oldRoot: liView.nodeRootView.id,
            newRoot: liView.nodeRootView.id,
            focus: true
        };
    });
}
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
    } else if ((e.which === 8) && (!$D.is_android)) {
        sel = view.getSelection();
        var firstchar = 0;
        if ($D.is_android) {
            firstchar = 1;
        }
        if (sel && (sel[0] === sel[1]) && (sel[1] === firstchar)) {
            $D.handleLineBackspace(view, e.simulated);
            e.preventDefault();
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
    if (e.simulated && (e.which === 8) && (!$D.is_android)) {
        if (sel) {
            var start = sel[0];
            var end = sel[1];
            var value = view.getValue();
            if (end > 0) {
                console.log("Simulating backspace in text " + view.id);
                view.setValue(value.substr(0, start - 1) + value.substr(end));
                view.setCursor(start - 1);
            } else {
            }
        } else {
        }
        // console.log("simulate backspace");
    }
};
$(function () {
    $(window).on('keydown', function (e) {
        var keyDownCodes = { 8: 8, 9: 9, 13: 13 };
        if ($D.is_android) {
            if ((!keyDownCodes[e.which]) && (e.which !== 0)) {
                return true;
            }
        } else {
            if (!keyDownCodes[e.which]) {
                return true;
            }
        }

        //console.log('Acknowledging keydown, code=' + e.which);
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
                //console.log('Handled keydown, code=' + e.which);
            } else {
                //console.log('Missed keydown, nothing focused');
            }
        } else {
            //console.log('Delaying keydown, code=' + e.which);
            ActionManager.schedule(function () {
                if (View.focusedView) {
                    e.simulated = true;
                    $D.handleKeydown(View.focusedView.header.name.text, e);
                    //console.log('Handled delayed keydown, code=' + e.which);
                } else {
                    //console.log('Missed delayed keydown, nothing focused');
                }
                ActionManager.schedule(function () {
                    if (!View.focusedView) {
                        return null;
                    }
                    return Action.checkTextChange(View.focusedView.header.name.text.id);
                });
                return null;
            });
            e.preventDefault();
        }
        e.stopPropagation();
        return true;
    });
});
//# sourceMappingURL=keydown.js.map
