///<reference path="actions/Action.ts"/>
///<reference path="models/OutlineNodeModel.ts"/>
function validate() {
    if ($('body').hasClass('drop-mode') || $('body').hasClass('transition-mode')) {
        console.log('Skipping validation because in drag mode');
        return;
    }

    var models = OutlineNodeModel.modelsById;
    var views = View.viewList;
    var panels = PanelView.panelsById;
    var deadviews = DeadView.viewList;
    var outlines = OutlineRootView.outlinesById;
    var nodes = NodeView.nodesById;
    var actions = ActionManager.actions;
    var lastaction = ActionManager.lastAction;

    var o, m, v, k, cp, cm;

    assert(View.currentPage instanceof PageView, "Page " + View.currentPage.id + " is not a PageView");
    assert(View.currentPage === views[View.currentPage.id], "Page " + View.currentPage.id + " is not in views list");
    for (o in outlines) {
        assert(outlines[o] instanceof OutlineRootView, "Outline ID " + o + " is not an OutlineRootView");
        assert(outlines[o] === views[o], "Outline ID " + o + " is not in the views list");
    }
    for (o in panels) {
        assert(panels[o] instanceof PanelView, "Panel is not of type PanelView");
        assert(views[o] === panels[o], "Panel not in views list " + o);
    }
    for (o in nodes) {
        assert(nodes[o] instanceof NodeView, "Node is not of type NodeView");
        assert(views[o] === nodes[o], "Node is not in views list " + o);
    }
    for (o in deadviews) {
        deadviews[o].validate();
    }
    assert(OutlineNodeModel.root instanceof OutlineNodeModel, "Root model is not of correct type");
    assert(models[OutlineNodeModel.root.cid] === OutlineNodeModel.root, "Root is not in model list");
    for (m in models) {
        assert(models[m] instanceof OutlineNodeModel, "Model " + m + " is not an OutlineNodeModel");
        models[m].validate();
    }
    for (v in views) {
        assert(views[v] instanceof View, "View " + v + " is not an instance of View");
        views[v].validate();
    }
    assert(actions.length === _.size(actions), "Actions.length is not right");
    if (actions.length > 0) {
        assert(lastaction !== null, "Actions.length>0 but lastaction is null");
        assert(actions.at(lastaction).lost === false, "Last action cannot be lost");
        for (var i = 0; i < actions.length; ++i) {
            assert(i === actions.at(i).historyRank, "Action rank does not match historyRank id for i=" + i);
            actions.at(i).validate();
        }
    } else {
        assert(lastaction === null, "There are no actions, but lastaction is not null");
    }
    assert(_.size(ActionManager.queue) === 0, "ActionManager.queue is not empty");

    if (View.focusedView != null) {
        assert(View.focusedView instanceof NodeView, "focusedView is not a nodeView");
        assert(View.viewList[View.focusedView.id] instanceof NodeView, "focusedView is not in viewList");
        assert(View.focusedView.elem != null, "focusedView has null elem");
    }

    /*
    for (n = 1; n <= npanels; ++n) {
    assert($('#' + grid.id).children().get(n - 1),
    "More than one second-level child of grid for scrolln=" + n);
    assert($($('#' + grid.id).children().get(n - 1)).children().get(0).id ===
    grid['scroll' + n].id,
    "grid scrolln " + n + " id doesn't match DOM");
    }*/
    // validate panel-button status
    // check listview's and list-elements
    $('.ui-listview').each(function () {
        assert(this.nodeName.toLowerCase() === 'ul', "Element with ui-listview does not have tag ul");
    });
    $('ul').each(function () {
        if ($(this).closest('#debuglog').length > 0) {
            return;
        }
        assert(typeof $(this).attr('id') === 'string', "List does not have a string for an id");
        assert($(this).attr('id').length >= 3, "List does not have a long enough id");
        assert($(this).hasClass('ui-listview'), "List " + $(this).attr('id') + " does not have class ui-listview");
        assert($(this).hasClass('ui-corner-all'), "List " + $(this).attr('id') + " does not have class ui-corner-all");
        assert($(this).hasClass('ui-shadow'), "List " + $(this).attr('id') + " does not have class ui-shadow");
        // todo: check for ui-sortable class for page
        // todo: validate that page.data('ui-sortable') has valid
        //    .panels and .items and
        // assert($(this).hasClass('ui-sortable'))
        /*
        // li,ul overflow is hidden unless :hover or .ui-focus-parent
        // ul z-index is always auto
        // li z-index is auto unless :hover of .ui-focus-parent
        if ($(this).is(':visible')) {
        if ($(this).hasClass('ui-focus-parent') || $(this).mouseIsOver()) {
        assert($(this).css('overflow') === 'visible',
        "List "+$(this).attr('id')+" does not have visible overflow, though it should");
        } else {
        assert($(this).css('overflow') === 'hidden',
        "List "+$(this).attr('id')+" does not have hidden overflow, though it should");
        }
        } */
    });
    $('.ui-li').each(function () {
        // either li or immediately under li
        if (this.nodeName.toLowerCase() !== 'li') {
            assert($(this).parent().get(0).nodeName.toLowerCase() === 'li', "Non-list element with ui-li class");
        }
    });
    $('li').each(function () {
        var self = this;
        if ($(self).closest('#debuglog').length > 0) {
            return;
        }
        assert(typeof $(self).attr('id') === 'string', "List-item does not have a string for an id");
        assert($(self).attr('id').length >= 3, "List-item does not have a long enough id");
        assert($(self).hasClass('ui-li'), "List-item " + $(self).attr('id') + " does not ahve class ui-li");
        if ($(self).next().length > 0) {
            assert(!$(self).hasClass('ui-last-child'), "LI " + $(self).attr('id') + " is not at end but has class ui-last-child");
        } else {
            // assert($(<HTMLElement>this).hasClass('ui-last-child'),
            //    "LI " + $(self).attr('id') + " is at end but does not have class ui-last-child");
        }
        if ($(self).prev().length > 0) {
            assert(!$(self).hasClass('ui-first-child'), "LI " + $(self).attr('id') + " is not at beginning but has class ui-first-child");
        } else {
            assert($(self).hasClass('ui-first-child'), "LI " + $(self).attr('id') + " is at beginning but does not have class ui-first-child");
        }
        var childlist = $(self).children('ul');
        assert(childlist.length === 1, "Child list ul not found inside li " + $(self).attr('id'));
        if (childlist.children().length > 0) {
            assert($(self).hasClass('branch'), "LI " + $(self).attr('id') + " has children but does not have branch class");
            assert(!$(self).hasClass('leaf'), "LI " + $(self).attr('id') + " has children but has leaf class");
        } else {
            if ($(self).hasClass('expanded')) {
                assert(!$(self).hasClass('branch'), "LI " + $(self).attr('id') + " has no children but has branch class");
                assert($(self).hasClass('leaf'), "LI " + $(self).attr('id') + " has no children but does not have leaf class");
            } else {
                assert($(self).hasClass('branch'), "LI " + $(self).attr('id') + " has no children but has branch class");
                assert(!$(self).hasClass('leaf'), "LI " + $(self).attr('id') + " has no children but does not have leaf class");
            }
        }
        assert($(self).hasClass('expanded') || $(self).hasClass('collapsed'), "li " + $(self).attr('id') + " doesn't have expanded or collapsed class.");
        assert(!($(self).hasClass('expanded') && $(self).hasClass('collapsed')), "li " + $(self).attr('id') + " has both expanded and collapsed class.");
        if ($(self).is(':visible')) {
            if ($(self).hasClass('expanded')) {
                assert(childlist.is(':visible'), "Expanded list under " + $(self).attr('id') + " is not visible");
            } else {
                assert(!childlist.is(':visible'), "Collapsed list under " + $(self).attr('id') + " is visible");
            }
        } else {
            assert(!$(self).parent().is(':visible'), "LI " + $(self).attr('id') + " is not visible though parent ul is");
        }

        // validate that all lists are unique inside their li
        assert($(self).children('ul').length === 1, "List-item " + $(self).attr('id') + " does not have exactly one ul inside it");
        /*
        // validate overflow and z-index, which can be programmatically changed
        if ($(this).is(":visible")) {
        if ($(this).hasClass('ui-focus-parent') || $(this).mouseIsOver()) {
        assert( $(this).css('overflow') === 'visible',
        "LI "+$(this).attr('id')+" does not have overflow visible");
        assert( $(this).css('z-index') === '10',
        "LI "+$(this).attr('id')+" does not have z-index=10");
        } else {
        assert( $(this).css('overflow') === 'hidden',
        "LI "+$(this).attr('id')+" does not have overflow hidden");
        assert( $(this).css('z-index') === 'auto',
        "LI "+$(this).attr('id')+" does not have z-index=auto");
        }
        }
        */
    });

    // validate that ui-focus-parent is used iff ui-focus is inside it
    $('.ui-focus-parent').each(function () {
        var self = this;
        assert($(self).find('.ui-focus').length > 0, "Unable to find ui-focus inside ui-focus-parent with id=" + $(self).attr('id'));
    });
    $('.ui-focus').each(function () {
        var self = this;

        // test that all parents have ui-focus-parent if they are li or ul
        $(self).parents().each(function () {
            if ((this.nodeName.toLowerCase === 'li') || (this.nodeName.toLowerCase === 'ul')) {
                assert($(self).hasClass('ui-focus-parent'), "Missing ui-focus-parent on focus-parent node " + $(self).attr('id'));
            }
        });
    });

    View.currentPage.resize(true); // resize-validation check

    // undo-buttons should be up to date
    function footprint(elem) {
        var obj = {};
        var offset = $(elem).offset();
        var paddingtop = Number($(elem).css('padding-top').replace(/px/, ''));
        var margintop = Number($(elem).css('margin-top').replace(/px/, ''));
        var bordertop = Number($(elem).css('border-top-width').replace(/px/, ''));
        if ($(elem).css('border-top-style') === 'none') {
            bordertop = 0;
        }
        var paddingleft = Number($(elem).css('padding-left').replace(/px/, ''));
        var marginleft = Number($(elem).css('margin-left').replace(/px/, ''));
        var borderleft = Number($(elem).css('border-left-width').replace(/px/, ''));
        if ($(elem).css('border-left-style') === 'none') {
            borderleft = 0;
        }
        obj.top = offset.top - margintop;
        obj.left = offset.left - marginleft;
        obj.bottom = obj.top + $(elem).outerHeight(true);
        obj.right = obj.left + $(elem).outerWidth(true);
        return obj;
    }

    /*
    $('*').each(function() {
    // validate that everything fits inside the parent-object, except
    // for scrollview-view height > inside scrollview-clip
    var type = this.nodeName.toLowerCase();
    if ((type==='html')||(type==='head')||(type==='meta')||
    (type==='script')||(type==='link')||(type==='style')||
    (type==='title')||(type==='base')||(type==='body')) {
    return;
    }
    var box = footprint(this);
    if ($(this).parent().length>0) {
    var pbox = footprint($(this).parent().get(0));
    assert(box.top >= pbox.top,
    "Object "+this.nodeName+'#'+String(this.id)+" has top="+box.top+" above parent="+pbox.top);
    assert(box.left >= pbox.left,
    "Object "+this.nodeName+'#'+String(this.id)+" has left="+box.left+" above parent="+pbox.left);
    if (box.right <= pbox.right,
    "Object "+this.nodeName+'#'+String(this.id)+" has right="+box.right+" above parent="+pbox.right);
    if (! $(this).hasClass('.ui-scrollview-clip')) {
    assert(box.bottom <= pbox.bottom,
    "Object "+this.nodeName+'#'+String(this.id)+" has bottom="+box.bottom+" above parent="+pbox.bottom);
    }
    }
    });
    */
    // todo: Need a optional debug-button in header,
    //     and log failed tests to a error-log.
    // todo: Need diagnostic output to see what is going on
    //    with dragging, scrolling, focusing, and keyboards?
    // diagnostics/assertions for keyboard/focus status
    // todo: action-state test to ensure actions can't overlap
    // todo: textarea not exceed height/width of parent boxes
    // todo: textarea height/width change must always match with content
    // todo: check height/width footprint of li and ul
    // todo: View.focusedView should be focused and match hiddendiv
    // todo: hiddendiv should have properties matching focused-div
    // todo: recalculated widths/heights should match up after resize
    // todo: ui-focus should always/only be on focused textarea and parent li.
    // nestedSortable items matches up with boxes etc. when dragging
    // todo: exec/undo and undo/redo should cancel for all actions
    // (part of a functional test)
    // functional tests that cover each contingency of each action?
    // Also check UI 'State' parameters in the view?
    // todo: check overflow on 'a' inner elem
    // todo: check html/css w3c validation?
    // todo: validate event-handlers:
    // $('*').each(function() {if ($._data(this,'events')!==undefined)
    //   {console.log([this.nodeName, this.id, this.className,
    //    $._data(this,'events')]);}});
    //  clean up and optimize events later
    // (maybe tie event handling to priority-queueing)
    // todo: can't check for unmatched tags or quotes or ampersands via javascript,
    //   though unmatched tags should mess up the view hierarchy and trigger other errors
    return "done";
}
//# sourceMappingURL=validate.js.map
