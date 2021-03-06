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
    if ((liView.parentView.nodeView instanceof NodeView) && (collection.next[liView.value.cid] === '') && (liView.parentView.nodeView.value.attributes.parent.attributes.owner === $D.userID)) {
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
                name: 'Keyboard outdent',
                activeID: liView.value.cid,
                referenceID: liView.value.attributes.parent.cid,
                oldRoot: liView.nodeRootView.id,
                newRoot: liView.nodeRootView.id,
                focus: true,
                cursor: [0, 0]
            };
        });
        return;
    } else {
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
                        name: 'Keyboard delete',
                        anim: 'delete',
                        activeID: liView.value.cid,
                        oldRoot: liView.nodeRootView.id,
                        newRoot: liView.nodeRootView.id,
                        focus: true,
                        cursor: [0, 0]
                    };
                });

                // e.preventDefault();
                return;
            } else {
                if (subschedule) {
                    console.log('handleLineBackspace 5, Cannot delete, text content has links');
                }
            }
        } else {
            if (subschedule) {
                console.log('handleLineBackspace 7, Cannot delete, content has children');
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
                name: 'Keyboard indent',
                activeID: liView.value.cid,
                referenceID: collection.prev[liView.value.cid],
                oldRoot: liView.nodeRootView.id,
                newRoot: liView.nodeRootView.id,
                focus: true,
                cursor: [0, 0]
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
                name: 'Keyboard outdent',
                activeID: liView.value.cid,
                referenceID: liView.value.attributes.parent.cid,
                oldRoot: liView.nodeRootView.id,
                newRoot: liView.nodeRootView.id,
                focus: true,
                cursor: [0, 0]
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
                        name: 'Keyboard delete',
                        activeID: liView.value.cid,
                        oldRoot: liView.nodeRootView.id,
                        newRoot: liView.nodeRootView.id,
                        focus: true,
                        cursor: [0, 0]
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
            name: 'Keyboard newline',
            referenceID: liView.value.cid,
            oldRoot: liView.nodeRootView.id,
            newRoot: liView.nodeRootView.id,
            focus: true,
            cursor: [0, 0]
        };
    });
}
$D.handleKeydown = function (view, e) {
    var id = view.id;
    var liView, collection, sel, pos, newNode;
    liView = view.nodeView;
    if (liView.readOnly) {
        return;
    }
    if (liView instanceof ChatBoxView) {
        if (e.which === 13) {
            var chatroot = OutlineNodeModel.getById('chatroot');
            if (chatroot.attributes.children.count === 0) {
                scheduleKey(e.simulated, id, function () {
                    return {
                        actionType: InsertIntoAction,
                        copyID: liView.value.cid,
                        anim: 'create',
                        name: 'Chat entry',
                        referenceID: chatroot.cid,
                        focus: false,
                        nolog: true
                    };
                });
            } else {
                scheduleKey(e.simulated, id, function () {
                    return {
                        actionType: InsertAfterAction,
                        copyID: liView.value.cid,
                        anim: 'create',
                        name: 'Chat entry',
                        referenceID: chatroot.attributes.children.last(),
                        focus: false,
                        nolog: true
                    };
                });
            }
            ActionManager.schedule(function () {
                view.setValue("");
                OutlineNodeModel.chatbox.attributes.text = "";
                view.nodeView.value.attributes.text = "";

                var node = liView.value;
                var links = liView.header.name.listItems;
                var l;
                while (links.first() !== '') {
                    l = links.first();
                    var linkm = View.get(l).value;
                    node.attributes.links.remove(linkm.cid);
                    linkm.attributes.backLinks.remove(node.cid);

                    liView.header.name.listItems.remove(l);
                    View.get(l).destroy();
                    liView.header.name.text.resizeUp();
                }

                return null;
            });
            e.preventDefault();
        }
        return;
    }
    sel = view.getSelection();
    if ($D.is_android) {
        if (sel[0] > 0) {
            sel[0] = sel[0] - 1;
        }
        if (sel[1] > 0) {
            sel[1] = sel[1] - 1;
        }
    }
    if (e.which === 9) {
        collection = liView.parentView.value;

        // validate not first in list
        if ((collection.prev[liView.value.cid] !== '') && (OutlineNodeModel.getById(collection.prev[liView.value.cid]).attributes.owner === $D.userID)) {
            // make it the last child of its previous sibling
            scheduleKey(e.simulated, id, function () {
                return {
                    actionType: MoveIntoAction,
                    name: 'Keyboard indent',
                    anim: 'indent',
                    activeID: liView.value.cid,
                    referenceID: collection.prev[liView.value.cid],
                    oldRoot: liView.nodeRootView.id,
                    newRoot: liView.nodeRootView.id,
                    focus: true,
                    cursor: sel
                };
            });
            e.preventDefault();
            return;
        }
    } else if ((e.which === 8) && (!$D.is_android)) {
        var firstchar = 0;
        if ($D.is_android) {
            firstchar = 1;
        }
        if (sel && (sel[0] === sel[1]) && (sel[1] === firstchar)) {
            $D.handleLineBackspace(view, e.simulated);
            e.preventDefault();
        }
    } else if (e.which === 13) {
        // if we own the parent
        if (liView.value.attributes.parent.attributes.owner === $D.userID) {
            scheduleKey(e.simulated, id, function () {
                return {
                    actionType: InsertAfterAction,
                    anim: 'create',
                    name: 'Keyboard newline',
                    referenceID: liView.value.cid,
                    oldRoot: liView.nodeRootView.id,
                    newRoot: liView.nodeRootView.id,
                    focus: true,
                    cursor: sel
                };
            });
        } else if (liView.isCollapsed === false) {
            scheduleKey(e.simulated, id, function () {
                return {
                    actionType: InsertIntoAction,
                    anim: 'create',
                    name: 'Keyboard newline indent',
                    referenceID: liView.value.cid,
                    oldRoot: liView.nodeRootView.id,
                    newRoot: liView.nodeRootView.id,
                    focus: true,
                    cursor: sel
                };
            });
        }
        e.preventDefault();
        // var scrollid = $('#'+id).closest('.ui-scrollview-clip').attr('id');
        // View.get(scrollid).themeUpdate();
    } else if (e.which === 38) {
        newNode = view.nodeView.prevVisibleNode();
        if (newNode && (!newNode.readOnly)) {
            pos = View.focusedView.header.name.text.getSelection()[0];
            if ($D.is_android && (pos === 0)) {
                pos = 1;
            }
            View.setFocus(newNode);
            newNode.header.name.text.elem.focus();
            console.log("Setting cursor to position " + pos);
            newNode.header.name.text.setCursor(pos);
        } else {
            pos = 0;
            if ($D.is_android) {
                ++pos;
            }
            view.setCursor(pos);
        }
        e.preventDefault();
    } else if (e.which === 40) {
        newNode = view.nodeView.nextVisibleNode();
        if (newNode && (!newNode.readOnly)) {
            pos = View.focusedView.header.name.text.getSelection()[0];
            if ($D.is_android && (pos === 0)) {
                pos = 1;
            }
            View.setFocus(newNode);
            newNode.header.name.text.elem.focus();
            console.log("Setting cursor to position " + pos);
            newNode.header.name.text.setCursor(pos);
        } else {
            pos = view.value.length;
            if ($D.is_android) {
                ++pos;
            }
            view.setCursor(pos);
        }
        e.preventDefault();
    } else if (e.which === 37) {
        pos = view.getSelection()[0];
        if ($D.is_android && (pos > 0)) {
            --pos;
        }
        if (pos === 0) {
            newNode = view.nodeView.prevVisibleNode();
            if (newNode && (!newNode.readOnly)) {
                var pos = newNode.header.name.text.value.length;
                if ($D.is_android) {
                    ++pos;
                }
                View.setFocus(newNode);
                newNode.header.name.text.elem.focus();
                newNode.header.name.text.setCursor(pos);
            }
            e.preventDefault();
        }
    } else if (e.which === 39) {
        pos = view.getSelection()[0];
        if ($D.is_android && (pos > 0)) {
            --pos;
        }
        if (pos === view.value.length) {
            newNode = view.nodeView.nextVisibleNode();
            if (newNode && (!newNode.readOnly)) {
                var pos = 0;
                if ($D.is_android) {
                    ++pos;
                }
                View.setFocus(newNode);
                newNode.header.name.text.elem.focus();
                newNode.header.name.text.setCursor(pos);
            }
            e.preventDefault();
        }
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
        var keyDownCodes = { 8: 8, 9: 9, 13: 13, 37: 37, 38: 38, 39: 39, 40: 40 };
        if (!keyDownCodes[e.which]) {
            return true;
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
