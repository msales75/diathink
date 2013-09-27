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
    var pageShown = 0;

    diathink.app.pages[pageName] = M.PageView.design({
        childViews:'header content footer drawlayer',
        events:{
            pageshow:{
                action:function () {
                    // todo: here, set the outline-controller to correct collection
                    var id = M.ViewManager.getPage(pageName).id;
                    if (pageShown>0) {return;} // first-call
                    ++pageShown;

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
                            $('input.ui-disable-scroll').removeClass('ui-disable-scroll');
                            if ($(this).data('lastClicked') && ($(this).data('lastClicked') > now - 500)) {
                                // process double-click
                                $(this).closest('li').toggleClass('expanded').toggleClass('collapsed');
                                var li= M.ViewManager.getViewById($(this).closest('li.ui-li').attr('id'));
                                var rootID = li.rootID;
                                var rootView = M.ViewManager.getViewById(rootID);
                                var panelView = rootView.parentView.parentView;
                                panelView.changeRoot(li.value);
                            } else { // single-click
                                $(this).data('lastClicked', (new Date()).getTime());
                                $(this).closest('li').toggleClass('expanded').toggleClass('collapsed');
                            }
                        });
                    $('#'+id).on('tap', 'input', function (e) {
                        $(this).focus();
                        // var now = (new Date()).getTime();
                        // console.log("Processing tap on page "+id+" with now = "+now+", input:");
                         // console.log(this);
                        // if ($(this).data('lastClicked') && ($(this).data('lastClicked') > now - 500)) {
                            // $(this).data('lastClicked', null);
                             // process double-click
                             // console.log("Focusing from double-tap with now = "+now);
                             // $('input.ui-disable-scroll').removeClass('ui-disable-scroll');
                             // $(this).addClass('ui-disable-scroll');
                             // alert("Processing double-click - disable scrolling");
                        // } else { // single-click
                             // console.log("Setting lastclicked to now = "+now);
                            // $(this).data('lastClicked', now);
                        // }
                    });
                    $('#'+id).on('tap', '.ui-breadcrumb-link', function(e) {
                            var modelid= $(this).attr('data-href');
                            var panelview = M.ViewManager.getViewById($(this).parent().attr('id')).parentView;
                            if (modelid==='home') {
                                panelview.changeRoot(null);
                            } else {
                                panelview.changeRoot(diathink.OutlineNodeModel.getById(modelid));
                            }
                    });
                    $(window).resize();
                    diathink.UndoController.refreshButtons();
                    $('#'+id).nestedSortable({
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
                        scroll:true,
                        dropLayers: '.droplayer',
                        helper: function (e, item) {
                            return item.clone().appendTo('.drawlayer').css({
                                position: 'absolute',
                                left: $(item).offset().left+'px',
                                top: $(item).offset().top+'px'
                            });
                        },
                        start: function(e, hash) {
                            /*
                            hash.item.parents().each(function() {
                                $(this).addClass('drag-hover');
                            });
                            */
                            /*
                             hash.item.parents('li').each(function() {
                             $(this).addClass('drag-hover');
                             });
                             hash.item.parents('ul').each(function() {
                             $(this).addClass('drag-hover');
                             });
                             */

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
                            // $('.drag-hover').removeClass('drag-hover');
                            // hash.item.css('border','');
                            console.log("Processed change to structure");
                        },
                        // handle: '> div > div > a > div > .handle',
                        toleranceElement:'> div > div > a > div.outline-header'
                    });
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

        content:M.GridView.design({
            cssClass: "scroll-container",
            childViews: "scroll1 scroll2",
            layout: M.TWO_COLUMNS,
            scroll1:diathink.PanelOutlineView.design({
                rootModel: root
            }),
            scroll2:diathink.PanelOutlineView.design({
                rootModel: root
            })
        }),

        footer:M.ToolbarView.design({
            value:'FOOTER',
            anchorLocation:M.BOTTOM
        }),

        drawlayer:M.ContainerView.design({
            cssClass: 'drawlayer'
        })
    });

    // diathink.app.pages[pageName].render();

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