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

diathink.mainOutline = diathink.OutlineController.extend({});

diathink.app = M.Application.design({
    entryPage:'page1' // required for start-page
});

diathink.app.createPage = function(pageName, root) {
    // get breadcrumbs, parent-collection
    // todo: later: do we preserve expand/contract status? maybe not.
    var crumb, collection, breadcrumbs = [];
    if (root === null) {
        collection = diathink.data;
    } else {
        collection = root.get('children');
        crumb = root;
        while (crumb != null) {
            breadcrumbs.unshift(crumb);
            crumb = crumb.get('parent');
        }
        root.get('parent');
    }
    var controller = diathink.OutlineController.extend({});
    var controller2 = diathink.OutlineController.extend({});
    // controller.rootID = root.id;

    function breadcrumbEvents(breadcrumbs) {
        // todo, move event-bindings to page or body?
        $(this).children('a').bind('click',function() {
            var cid = $(this).attr('data-href');
            var model = diathink.OutlineNodeManager.getById(cid);
            diathink.app.createPage('page_'+cid, model);
        });

    };

    diathink.app.pages[pageName] = M.PageView.design({
        childViews:'header content content2 footer droplayer',
        events:{
            pageshow:{
                action:function () {
                    // todo: here, set the outline-controller to correct collection
                        if (controller.get('listObject').length>0) {return;} // first-call
                        var id = M.ViewManager.getPage(pageName).id;

                        controller.set('listObject', collection);
                        controller2.set('listObject', collection);

                        $('#' + M.ViewManager.getView(pageName, 'alist').id).
                            add('#' + M.ViewManager.getView(pageName, 'alist2').id).nestedSortable({
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

                        $('#'+id).on('focusin focusout', function(e) {
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
                        $('#'+id).on('tap', '.disclose', function (e) {
                            var now = (new Date()).getTime();
                            if ($(this).data('lastClicked') && ($(this).data('lastClicked') > now - 500)) {
                                // process double-click
                                diathink.mainOutline.focusObject($(this).closest('li.ui-li').attr('id'));
                            } else { // single-click
                                $(this).data('lastClicked', (new Date()).getTime());
                                $(this).closest('li').toggleClass('expanded').toggleClass('collapsed');
                            }
                        });
                    $('#'+id).on('tap', 'input', function (e) {
                        var now = (new Date()).getTime();
                        // console.log("Processing tap on page "+id+" with now = "+now+", input:");
                        console.log(this);
                        if ($(this).data('lastClicked') && ($(this).data('lastClicked') > now - 500)) {
                            $(this).data('lastClicked', null);
                            // process double-click
                            // console.log("Focusing from double-tap with now = "+now);
                            $(this).focus();
                            // alert("Processing double-click - disable scrolling");
                        } else { // single-click
                            // console.log("Setting lastclicked to now = "+now);
                            $(this).data('lastClicked', now);
                        }
                    });
                    diathink.UndoController.refreshButtons();
                }
            }
        },

        header:M.ToolbarView.design({
            childViews: "title undobuttons",
            // value:'HEADER',
            anchorLocation:M.TOP,
            title: M.LabelView.design({
                anchorLocation: M.LEFT,
                value: ""
            }),
            undobuttons: M.ContainerView.design({
                anchorLocation:M.RIGHT,
                cssClass: 'undo-container',
                childViews: "undobutton redobutton",
                undobutton:M.ButtonView.design({
                    isIconOnly: true,
                    cssClass:'undo-button',
                    events: {
                        tap: {
                            target:diathink.UndoController,
                            action:'undo'
                        }
                    }
                }),
                redobutton:M.ButtonView.design({
                    isIconOnly: true,
                    cssClass:'redo-button',
                    events: {
                        tap: {
                            target:diathink.UndoController,
                            action:'redo'
                        }
                    }
                })
            })
        }),

        content:M.ScrollView.design({
            childViews:'label alist',

            label:M.BreadcrumbView.design({
                value: breadcrumbs,
                events: {
                    tap: {
                        action: function(id, e) {
                            var el = e.target;
                             if (el.nodeName.toLowerCase()==='a') {
                                var pageid = $(el).attr('data-href');
                                 if (pageid==='home') {
                                     M.Controller.switchToPage('page1');
                                 } else if (diathink.app.pages['page_'+pageid] != null) {
                                     M.Controller.switchToPage('page_'+pageid);
                                 } else { // todo: create new page

                                 }
                             }
                        }
                    }
                }
            }),

            alist:M.ListView.design({
                isInset:'YES',
                rootController: controller,
                listItemTemplateView:diathink.MyListItem,
                contentBinding:{
                    target:controller,
                    property:'listObject'
                },
                idName:'cid', // For Backbone.Model compatibility
                items: 'models' // For Backbone.Model compatibility
            })
        }),

        content2:M.ScrollView.design({
            childViews:'label2 alist2',

            label2:M.BreadcrumbView.design({
                value: breadcrumbs,
                events: {
                    tap: {
                        action: function(id, e) {
                            var el = e.target;
                            if (el.nodeName.toLowerCase()==='a') {
                                var pageid = $(el).attr('data-href');
                                if (pageid==='home') {
                                    M.Controller.switchToPage('page1');
                                } else if (diathink.app.pages['page_'+pageid] != null) {
                                    M.Controller.switchToPage('page_'+pageid);
                                } else { // todo: create new page

                                }
                            }
                        }
                    }
                }
            }),

            alist2:M.ListView.design({
                isInset:'YES',
                rootController: controller2,
                listItemTemplateView:diathink.MyListItem,
                contentBinding:{
                    target:controller2,
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
    });

    diathink.app.pages[pageName].render();

};

diathink.app.createPage('page1', null);

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