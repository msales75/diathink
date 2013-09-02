// ==========================================================================
// The M-Project - Mobile HTML5 Application Framework
// Generated with: Espresso 
//
// Project: diathink
// ==========================================================================

var diathink = diathink || {};

M.assert = function(test) {
    if (!test) {
        throw "Assertion failed";
    }
}

diathink.data = new diathink.OutlineNodeCollection([
    {text: "Test 1",
        children: [
            {text: "Child 1 1",
                children: [{text: "Child 1 1 - 1"}]},
            {text: "Child 1 2"}
        ]},
    {text: "Test 2"}
]);

diathink.app = M.Application.design({

    entryPage:'page1', // required for start-page

    page1:M.PageView.design({
        // cssClass: 'drop-mode',

        childViews:'header content footer droplayer',
        events:{
            pageshow:{
                action:function () {
                    // todo: should bind to page on page-init
                    $('div.ui-page').on('focusin focusout', function(e) {

                        // does this have performance issues?
                        $('.ui-focus-parent').removeClass('ui-focus-parent');

                        if (! $(e.target).hasClass('ui-input-text')) {return; }
                        /* Add ui-focus-parent to parents that are last in the list,
                           to help draw correct borders  */

                        if (e.type==='focusout') {return; }

                        var that = $(e.target).parents('li.ui-li:first');

                        while ($(that).next().length===0) {
                            $(that).addClass('ui-focus-parent');
                            $(that).parent('ul').addClass('ui-focus-parent');
                            that = that.parents('li.ui-li:first');
                            if (that.length===0) {
                                break;
                            }
                        }
                        if (that.length>0) {
                            $(that).addClass('ui-focus-parent');
                        }
                    });

                    diathink.OutlineController.set('listObject', diathink.data);
                    $('#' + M.ViewManager.getView('page1', 'alist').id).nestedSortable({
                        listType:'ul',
                        items:'li',
                        doNotClear:true,
                        isTree:true,
                        branchClass:'branch',
                        leafClass:'leaf',
                        collapsedClass:'collapsed',
                        expandedClass:'expanded',
                        hoveringClass:'sort-hover',
                        errorClass: 'sort-error',
                        handle:'> div > div > a > div > .drag-handle',
                        buryDepth:3,
                        scroll:false,
                        dropLayer: $('.droplayer'),
                        start: function(e, hash) {
                            hash.item.parents('li').each(function() {
                                $(this).addClass('drag-hover');
                            });
                            hash.item.parents('ul').each(function() {
                                $(this).addClass('drag-hover');
                            });
                            // hash.item.css('border','solid 1px orange');
                        },
                        stop:function (e, hash) { // (could also try 'change' or 'sort' event)
                            if (hash.item.parents('ul').length > 0) {
                                M.ViewManager.getViewById($(hash.item.parents('ul').get(0)).attr('id')).themeUpdate();
                                M.ViewManager.getViewById($(hash.originalDOM.parent).attr('id')).themeUpdate();
                            }
                            var toplines = $('.topline:hover');
                            var bottomlines = $('.bottomline:hover');
                            if (toplines.length>0) {
                                console.log("Moving above element "+toplines.parents("li:first").attr('id'));
                            } else if (bottomlines.length>0) {
                                console.log("Moving below element "+bottomlines.parents("li:first").attr('id'));
                            }
                            $('.drag-hover').removeClass('drag-hover');
                            // hash.item.css('border','');
                            console.log("Processed change to structure");
                        },
                        // handle: '> div > div > a > div > .handle',
                        toleranceElement:'> div > div > a > div.outline-header'
                    });
                    $('.disclose').on('click', function () {
                        $(this).closest('li').toggleClass('expanded').toggleClass('collapsed');
                    });
                }
            }
        },

        header:M.ToolbarView.design({
            value:'HEADER',
            anchorLocation:M.TOP
        }),

        content:M.ScrollView.design({
            childViews:'label alist',

            label:M.LabelView.design({
                value:'Welcome to The M-Project'
            }),

            alist:M.ListView.design({
                events:{
                    tap:{
                        target:diathink.OutlineController,
                        action:'parentObjectClicked'
                    }
                },
                isInset:'YES',
                rootController: diathink.OutlineController.extend({}),
                listItemTemplateView:diathink.MyListItem,
                contentBinding:{
                    target:diathink.OutlineController,
                    property:'listObject'
                },
                idName:'cid', // For Backbone.Model compatibility
                items: 'models' // For Backbone.Model compatibility
            })
        }),

        footer:M.ToolbarView.design({
            value:'FOOTER',
            anchorLocation:M.BOTTOM
        }),

        droplayer:M.ContainerView.design({
            cssClass:'droplayer'
        })
    })
});

/*
diathink.app.configure({
    outlineView:{
        buryDepth:3,
        listType:'ul',
        branchClass:'branch',
        collapsedClass:'collapsed',
        expandedClass:'expanded',
        leafClass:'leaf',
        errorClass:'error',
        tabSize:20,
        rtl:false
    }
});
*/