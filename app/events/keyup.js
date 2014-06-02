///<reference path="../views/View.ts"/>
///<reference path="../events/keydown.ts"/>
m_require("app/views/View.js");
$(function () {
    function firstDiffs(s1, s2) {
        var i = 0;
        var l1 = s1.length;
        var l2 = s2.length;
        var continue1 = true;
        var continue2 = true;
        var d1, d2;
        var len = l1;
        if (l2 < len) {
            len = l2;
        }
        for (i = 0; i < len; ++i) {
            if (continue1) {
                if (s1.substr(i, 1) !== s2.substr(i, 1)) {
                    d1 = i;
                    continue1 = false;
                }
            }
            if (continue2) {
                if (s1.substr(l1 - i - 1, 1) !== s2.substr(l2 - i - 1, 1)) {
                    d2 = i;
                    continue2 = false;
                }
            }
            if (!continue1 && !continue2) {
                break;
            }
        }
        if (continue1) {
            d1 = i;
        }
        if (continue2) {
            d2 = i;
        }
        if (d1 + d2 > len) {
            d2 = len - d1;
        }
        return [d1, d2];
    }

    var androidKeypress = function (view, oldVal, newVal) {
        var sel = view.getSelection();
        if (newVal.substr(0, 1) !== ' ') {
            newVal = ' ' + newVal;
            view.elem.value = newVal;
            view.setCursor(1);
            if (oldVal === newVal) {
                if (ActionManager.queue.length === 0) {
                    $D.handleLineBackspace(view, false);
                } else {
                    ActionManager.schedule(function () {
                        if (View.focusedView) {
                            // TESTED on android, seems ok
                            console.log('androidKeypress 1 backspace ');
                            $D.handleLineBackspace(View.focusedView.header.name.text, true);
                        } else {
                            console.log('androidKeypress 2 backspace delayed keypress with nothing focused');
                        }

                        // in case the prior action is the last one but it doesn't do anything,
                        //  so it never calls checkTextChange
                        ActionManager.schedule(function () {
                            if (!View.focusedView) {
                                console.log('androidKeypress 3, backspace nothing focused for text change');
                                return null;
                            }
                            if (View.focusedView.value.get('text') !== View.focusedView.header.name.text.value) {
                                console.log('androidKeypress 4, backspace text change being processed');
                            } else {
                                // TESTED ON ANDROID
                                console.log('androidKeypress 5, backspace no text change found');
                            }
                            return Action.checkTextChange(View.focusedView.header.name.text.id);
                        });
                        return null;
                    });
                }
                return;
            }
        }
        var pos = firstDiffs(oldVal, newVal);
        var nmatches = pos[0] + pos[1];
        var l1 = oldVal.length;
        var l2 = newVal.length;
        var mesg = '';
        if (nmatches === l1) {
            assert(nmatches < l2, "new value equals old value");
            if (l2 - nmatches === 1) {
                mesg = newVal.substr(pos[0], 1);
                // console.log('androidKeypress 6, one new char');
                // this happens frequently
            } else {
                // send all the keystrokes as a paste message
                mesg = newVal.substr(pos[0], l2 - nmatches);
                console.log('androidKeypress 7, multiple new chars');
            }
        } else if (nmatches === l2) {
            assert(nmatches < l1, "new value equals old value");
            if (l1 - nmatches === 1) {
                console.log('androidKeypress 8, one deleted char');
                mesg = '\b';
            } else {
                console.log('androidKeypress 9, multiple deleted chars');
                mesg = '\b'; // multi-delete of whatever was selected
            }
        } else {
            // just propagate paste, not backspace, for now
            mesg = newVal.substr(pos[0], l2 - nmatches);
            console.log('androidKeypress 10, mixed text replacement');
        }

        // set cursor at end of new message
        if (ActionManager.queue.length === 0) {
            // no pending actions, so current text-view must be the focusedView
            assert(View.focusedView && (view === View.focusedView.header.name.text), "Text change view is not focusedView!");
            if ((mesg === ' ') && (pos[0] === 1)) {
                var liView = view.nodeView;

                // get parent-collection and rank
                var collection = liView.parentView.value;

                // validate rank >0
                if (collection.prev[liView.value.cid] !== '') {
                    // make it the last child of its previous sibling
                    view.elem.value = ' ' + view.value; // revert text before indenting
                    scheduleKey(false, '', function () {
                        return {
                            actionType: MoveIntoAction,
                            anim: 'indent',
                            name: 'Keyboard indent',
                            activeID: liView.value.cid,
                            referenceID: collection.prev[liView.value.cid],
                            oldRoot: liView.nodeRootView.id,
                            newRoot: liView.nodeRootView.id,
                            focus: true,
                            cursor: [pos[0] - 1, pos[1] - 1]
                        };
                    });
                    return;
                } else {
                    view.elem.value = ' ' + view.value;
                    view.setCursor(1);
                }
            } else {
                view.setValueFromDOM();
                view.resizeUp();
            }
        } else {
            // revert text-changes
            view.elem.value = ' ' + view.value;
            view.setCursor(oldVal.length - pos[1]);
            if ((mesg !== '') && (mesg !== '\n')) {
                ActionManager.schedule(function () {
                    if (View.focusedView) {
                        var nview = View.focusedView.header.name.text;
                        var sel = nview.getSelection();
                        if ((mesg === ' ') && (sel[0] === 1)) {
                            var liView = View.focusedView;
                            var collection = liView.parentView.value;
                            if (View.focusedView.value.get('text') !== View.focusedView.header.name.text.value) {
                                console.log('androidKeypress 11, delayed indent with textchange');
                            } else {
                                console.log('androidKeypress 12, delayed indent with no text change');
                            }
                            scheduleKey(true, '', function () {
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
                        } else if (mesg === '\b') {
                            if ((sel[0] !== 1) || (sel[0] !== sel[1])) {
                                if (sel[0] === sel[1]) {
                                    nview.setValue(nview.value.substr(0, sel[0] - 1) + nview.value.substr(sel[1]));
                                    nview.setCursor(sel[0] - 1);
                                    console.log('androidKeypress 13, simulated backspace one character');
                                } else {
                                    nview.setValue(nview.value.substr(0, sel[0]) + nview.value.substr(sel[1]));
                                    nview.setCursor(sel[0]);
                                    console.log('androidKeypress 14, simulated backspace of selection');
                                }
                                ActionManager.schedule(function () {
                                    if (View.focusedView.value.get('text') !== View.focusedView.header.name.text.value) {
                                        console.log('androidKeypress 15, deleted text with also checkTextChange');
                                    } else {
                                        console.log('androidKeypress 16, deleted text with no other change');
                                    }
                                    return Action.checkTextChange(nview.id);
                                });
                            } else {
                                console.log('androidKeypress 17, skipping backspace it was handled earlier');
                            }
                        } else {
                            // append mesg to focused view and set cursor there
                            nview.setValue(nview.value.substr(0, sel[0]) + mesg + nview.value.substr(sel[1]));
                            nview.setCursor(sel[0] + mesg.length);
                            ActionManager.schedule(function () {
                                if (View.focusedView.value.get('text') !== View.focusedView.header.name.text.value) {
                                    // TESTED THIS OK
                                    console.log('androidKeypress 18, appended text with also checkTextChange');
                                } else {
                                    // TESTED THIS OK
                                    console.log('androidKeypress 19, appended text with no other change');
                                }
                                return Action.checkTextChange(nview.id);
                            });
                        }
                    } else {
                        console.log('androidKeypress 20 Missed delayed keypress, nothing focused');
                    }
                    ActionManager.schedule(function () {
                        if (!View.focusedView) {
                            console.log('androidKeypress 21, keypress nothing focused for text change');
                            return null;
                        }
                        if (View.focusedView.value.get('text') !== View.focusedView.header.name.text.value) {
                            console.log('androidKeypress 22, keypress text change being processed');
                        } else {
                            console.log('androidKeypress 23, keypress no text change found');
                        }
                        return Action.checkTextChange(View.focusedView.header.name.text.id);
                    });
                    return null;
                });
            }
        }
    };

    // Note: input and paste do not bubble, so these don't work.
    $(document.body).on('blur', function (e) {
        console.log("Blur event received");
    });
    if ($D.is_android) {
        $(document.body).on('input', 'textarea', function (e) {
            var view = View.get($(this).attr('id'));
            var newValue = view.elem.value;
            var oldValue = ' ' + view.value;
            var sel = view.getSelection();
            if (sel[0] < 1) {
                sel[0] = 1;
                if (sel[1] === 0) {
                    sel[1] = 1;
                }
                view.setSelection(sel[0], sel[1]);
            }
            if (newValue !== oldValue) {
                //console.log("Updating value of textarea "+view.id+" from '"+view.elem.value+
                //    "' to '"+view.value+"' based on event-type "+ e.type);
                androidKeypress(view, oldValue, newValue);
                return;
            }

            // console.log("Got e.which=0, testing for android");
            view.setValueFromDOM();
            view.resizeUp();
        });
    } else {
        $(document.body).on('keyup change input paste', 'textarea', function (e) {
            var view = View.get($(this).attr('id'));

            // console.log("Got e.which=0, testing for android");
            view.setValueFromDOM();
            view.resizeUp();
        });
    }
});
//# sourceMappingURL=keyup.js.map
