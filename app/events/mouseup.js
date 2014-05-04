///<reference path="../views/View.ts"/>
m_require("app/views/View.js");
$(function () {
    var tap = 'click';
    if ($D.is_touch_device) {
        tap = 'tap';
    }
    $(document.body).on(tap, '.ui-breadcrumb-link', function (e) {
        // $('input.ui-disable-scroll').removeClass('ui-disable-scroll');
        var view = View.get($(this).parent().attr('id'));
        var now = (new Date()).getTime();
        if (!view.lastClicked || (view.lastClicked < now - 1000)) {
            view.lastClicked = now;
        }
        var modelid = $(this).attr('data-href');
        var panelview = View.getFromElement(this).panelView;
        if (modelid === 'home') {
            modelid = null;
        }

        // todo-here - see if text changes appropriately.
        ActionManager.schedule(function () {
            if (!View.focusedView) {
                return null;
            }
            return Action.checkTextChange(View.focusedView.header.name.text.id);
        }, function () {
            return {
                actionType: PanelRootAction,
                activeID: modelid,
                oldRoot: panelview.outline.alist.nodeRootView.id,
                newRoot: 'new'
            };
        });
    });
});
//# sourceMappingURL=mouseup.js.map
