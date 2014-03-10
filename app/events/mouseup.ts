///<reference path="../views/View.ts"/>
m_require("app/views/View.js");
$(function() {
    var vmouseup:string = 'mouseup';
    var tap:string = 'click';
    if ($D.is_touch_device) {
        vmouseup = 'touchend';
        tap = 'tap';
    }
    $(document.body).on(tap, '.undo-button span', function(e) {
        $D.ActionManager.undo()
    });
    $(document.body).on(tap, '.redo-button span', function(e) {
        $D.ActionManager.redo()
    });
    $(document.body).on(tap, '.disclose', function(e) {
        var now = (new Date()).getTime();
        // $('input.ui-disable-scroll').removeClass('ui-disable-scroll');
        var view = View.get(this.id);
        var liElem = $('#' + view.parentView.parentView.id);
        if (view.lastClicked && (view.lastClicked > now - 500) && !view.lastDouble) {
            // process double-click
            // liElem.toggleClass('expanded').toggleClass('collapsed');
            view.lastDouble = true;
            var li = View.get(view.parentView.parentView.id);
            // todo-here
            $D.ActionManager.schedule(
                function() {
                    return $D.Action.checkTextChange(li.header.name.text.id);
                },
                function() {
                    return {
                        action: $D.RootAction,
                        activeID: li.value.cid,
                        oldRoot: li.nodeRootView.id,
                        newRoot: 'new'
                    };
                });
        } else { // single-click
            view.lastClicked = now;
            // todo-here
            $D.ActionManager.schedule(
                function() {
                    return $D.Action.checkTextChange(view.parentView.parentView.header.name.text.id);
                },
                function() {
                    if (!liElem.hasClass('branch')) {
                        return false;
                    }
                    return {
                        action: $D.CollapseAction,
                        activeID: view.parentView.parentView.value.cid,
                        collapsed: !liElem.hasClass('collapsed'),
                        oldRoot: view.parentView.parentView.nodeRootView.id,
                        newRoot: view.parentView.parentView.nodeRootView.id,
                        focus: false
                    };
                });
        }
    });
    $(document.body).on(tap, '.left-button', function(e) {
        $D.ActionManager.schedule(
            function() {
                if ($D.focused) {
                    return $D.Action.checkTextChange($D.focused.header.name.text.id);
                } else {
                    return null;
                }
            },
            function() {
                return {
                    action: $D.SlideAction,
                    direction: 'right',
                    focus: false
                };
            });
    });
    $(document.body).on(tap, '.right-button', function(e) {
        $D.ActionManager.schedule(
            function() {
                if ($D.focused) {
                    return $D.Action.checkTextChange($D.focused.header.name.text.id);
                } else {
                    return null;
                }
            },
            function() {
                return {
                    action: $D.SlideAction,
                    direction: 'left',
                    focus: false
                };
            });
    });
    $(document.body).on(tap, '.ui-breadcrumb-link', function(e) {
        // $('input.ui-disable-scroll').removeClass('ui-disable-scroll');
        var view = View.get($(this).parent().attr('id'));
        var now = (new Date()).getTime();
        if (!view.lastClicked || (view.lastClicked < now - 1000)) {
            view.lastClicked = now;
            var modelid = $(this).attr('data-href');
            var panelview = View.get($(this).parent().attr('id')).parentView;
            if (modelid === 'home') {
                modelid = null;
            }
            // todo-here - see if text changes appropriately.
            $D.ActionManager.schedule(
                function() {
                    return {
                        action: $D.RootAction,
                        activeID: modelid,
                        oldRoot: panelview.outline.alist.nodeRootView.id,
                        newRoot: 'new'
                    };
                });
        }
    });
});
