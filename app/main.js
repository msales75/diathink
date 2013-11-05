// ==========================================================================
// The M-Project - Mobile HTML5 Application Framework
// Generated with: Espresso 
//
// Project: diathink
// ==========================================================================

var diathink = diathink || {};

// Test for Mobile not on homepage
var nav = navigator;
if (nav.userAgent.match(/iPhone/i) ||
    nav.userAgent.match(/iPad/i) ||
    nav.userAgent.match(/iPod/i)) {

    if (! nav.standalone) {
        diathink.isSafari = (/Safari/i).test(nav.appVersion) && !(/CriOS/i).test(nav.appVersion);
        var OSVersion = nav.appVersion.match(/OS (\d+_\d+)/i);
        diathink.OSVersion = OSVersion && OSVersion[1] ? +OSVersion[1].replace('_', '.') : 0;
        // show message & abort application.
    }
}


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
        childViews:'hiddendiv header content drawlayer',
        events:{
            pageshow:{
                action:function () {
                    // todo: here, set the outline-controller to correct collection
                    var id = M.ViewManager.getPage(pageName).id;
                    if (pageShown>0) {return;} // first-call
                    ++pageShown;

                    $('#'+id).on('focusin focusout', 'textarea', function(e) {
                        // todo: does this have performance issues?
                        // console.log('Check call-count: calling '+ e.type+' for textarea');
                        if (e.type=='focusout') {
                            // does this occur on manual keyboard-close?
                            // console.log('blurring keyboard from focusout');
                            diathink.keyboard.blur();
                            if (diathink.focused && diathink.focused.id) {
                                if (M.ViewManager.getViewById(diathink.focused.id)) {
                                    M.ViewManager.getViewById(diathink.focused.id).blur();
                                }
                            }
                            diathink.focused = null;
                            return;
                        }
                        if (e.target && e.target.nodeName && e.target.nodeName.toLowerCase()==='textarea') {
                            //console.log('focusing keyboard from focusin');
                            diathink.focused = e.target;
                            // check if keyboard opened
                            diathink.keyboard.focus();
                            M.ViewManager.getViewById(e.target.id).focus();
                        } else {
                            // check if keyboard closed
                            // console.log('blurring keyboard from focusin');
                            diathink.keyboard.blur();
                            if (diathink.focused && diathink.focused.id) {
                                if (M.ViewManager.getViewById(diathink.focused.id)) {
                                    M.ViewManager.getViewById(diathink.focused.id).blur();
                                }
                            }
                            diathink.focused = null;
                        }
                    });
                    $('#'+id).on('vmousedown', '.disclose', function(e) {
                        var targetView = M.ViewManager.getViewById(this.id).parentView.name.text;
                        // add a class for non-text focus
                        $('#'+targetView.id).addClass('hide-selection').focus().selectText();
                    });
                    $('#'+id).on('vmousedown', 'textarea', function(e) {
                        $(this).removeClass('hide-selection');
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
/*
                   $('#'+id).on('tap', 'span.outline-content', function (e) {
                        diathink.keyboard.focus();
                        $('.ui-focus').removeClass('ui-focus');
                        $(this).addClass('ui-focus');
                        var item = $(this).closest('li.ui-li');
                        item.addClass('ui-focus');
                        diathink.focused = this;

                        // move textarea to current location
                        //    (near screen top if focus is working)
                        var input = $('#'+diathink.app.pages[pageName].hiddeninput.id);
                        input.css('left', Math.round($(this).offset().left)+'px')
                            .css('top', Math.round($(this).offset().top)+'px')
                            .width($(this).width())
                            .height($(this).height())
                            .css('z-index', 20)
                            .css('opacity', 1);
                        input.children('textarea').val($(this).text());
                        console.log("Setting height to "+$(this).height());
                    });
*/
                    $('#'+id).on('tap', '.ui-breadcrumb-link', function(e) {
                            var modelid= $(this).attr('data-href');
                            var panelview = M.ViewManager.getViewById($(this).parent().attr('id')).parentView;
                            if (modelid==='home') {
                                panelview.changeRoot(null);
                            } else {
                                panelview.changeRoot(diathink.OutlineNodeModel.getById(modelid));
                            }
                    });
                    function closestListItem( element ) {
                        var cname;
                        while ( element ) {
                            if (element.nodeName.toLowerCase()==='body') {return null;}
                            if (element.nodeName.toLowerCase()==='li') {
                                cname = ( typeof element.className === 'string' ) && ( element.className + ' ' );
                                if ( cname && cname.indexOf( "ui-li " ) > -1 ) {
                                    break;
                                }
                            }
                            element = element.parentNode;
                        }
                        return element;
                    }
                    diathink.hoverItem = null, diathink.hoverTimer = null;
                    // handle hovering-class, also retain class for 500ms in case it's followed by focus class
                    $('#'+id).on('vmouseover vmouseout', function(e) {
                        // find the closest li to the target
                        var li = closestListItem(e.target);
                        if (!li) {return;}
                        if (diathink.timer) {clearTimeout(diathink.timer);}
                        if (e.type==='vmouseover') {
                            if (li !== diathink.hoverItem) {
                                $(diathink.hoverItem).removeClass('ui-btn-hover-c');
                            }
                            $(li).addClass('ui-btn-hover-c');
                            diathink.hoverItem = li;
                        } else if (e.type==='vmouseout') {
                            if (li === diathink.hoverItem) {
                                diathink.timer = setTimeout(function() {
                                    $(li).removeClass('ui-btn-hover-c');
                                }, 500);
                            } else { // if a different item is hovering do nothing
                            }
                        }
                    });
                    // Note: input and paste do not bubble, so these don't yet work.
                    $('#'+id).on('keyup change input paste', 'textarea', function(e) {
                        var view = M.ViewManager.getViewById($(this).attr('id'));
                        view.setValueFromDOM();
                        view.themeUpdate();
                    });
                    $('#'+id).on('keydown','textarea', function(e) {
                                var id = this.id;
                                var liView = M.ViewManager.findViewById(id).parentView.parentView.parentView;
                                if (e.which === 32) { // spacebar
                                    var sel = $('#'+id).selection();
                                    // check if cursor is on far left of textbox
                                    if (sel && (sel[0] === 0) && (sel[1] === 0)) {
                                        // get parent-collection and rank
                                        var collection = liView.parentView.value;
                                        var rank = _.indexOf(collection.models, liView.value);
                                        // validate rank >=0
                                        if (rank>0) { // indent the line
                                            // make it the last child of its previous sibling
                                            diathink.Action.checkTextChange(id);
                                            diathink.MoveIntoAction.createAndExec({
                                                anim: 'indent',
                                                referenceID: collection.models[rank-1].cid,
                                                targetID: liView.modelId,
                                                dragView: liView.rootID,
                                                focusView: liView.rootID
                                            });
                                            e.preventDefault();
                                        }
                                    }
                                } else if (e.which === 9) { // tab
                                    var collection = liView.parentView.value;
                                    var rank = _.indexOf(collection.models, liView.value);
                                    // validate rank >=0
                                    if (rank>0) { // indent the line
                                        // make it the last child of its previous sibling
                                        diathink.Action.checkTextChange(id);
                                        diathink.MoveIntoAction.createAndExec({
                                            anim: 'indent',
                                            referenceID: collection.models[rank-1].cid,
                                            targetID: liView.modelId,
                                            dragView: liView.rootID,
                                            focusView: liView.rootID
                                        });
                                        e.preventDefault();
                                    }
                                } else if (e.which === 8) { // backspace
                                    var sel = $('#'+id).selection();
                                    if (sel && (sel[0] === 0) && (sel[1] === 0)) {
                                        // get parent-collection and rank
                                        var collection = liView.parentView.value;
                                        var rank = _.indexOf(collection.models, liView.value);
                                        // if it is the last item in its collection
                                        if ((liView.parentView.parentView != null) &&
                                            (liView.parentView.parentView.type==='M.ListItemView')&&
                                            (rank===collection.models.length-1)) {
                                            // make it the next child of its parent
                                            diathink.Action.checkTextChange(id);
                                            diathink.OutdentAction.createAndExec({
                                                anim: 'indent',
                                                referenceID: liView.value.attributes.parent.cid,
                                                targetID: liView.modelId,
                                                dragView: liView.rootID,
                                                focusView: liView.rootID
                                            });
                                            e.preventDefault();
                                        } else { // delete or merge-lines?
                                            if ($('#'+id).val() === "") {
                                                diathink.Action.checkTextChange(id);
                                                diathink.DeleteAction.createAndExec({
                                                    anim: 'delete',
                                                    targetID: liView.modelId
                                                });
                                            }
                                        }
                                    }
                                } else if (e.which === 13) { // enter
                                    // todo: split line if in middle of text
                                    diathink.Action.checkTextChange(id);
                                    diathink.InsertAfterAction.createAndExec({
                                        anim: 'create',
                                        referenceID: liView.modelId,
                                        focusView: liView.rootID
                                    });
                                    e.preventDefault();
                                    // var scrollid = $('#'+id).closest('.ui-scrollview-clip').attr('id');
                                    // M.ViewManager.findViewById(scrollid).themeUpdate();
                                }
                                e.stopPropagation();
                                // console.log("Processed keyup with which=" + e.which + " and keycode=" + e.keyCode);
                    });
                    $.mobile.window.on('load',function() {
                        $(window).resize();
                        // $('textarea').trigger('keyup');
                    });
                    // ? also on: mobile.document pagechange

                    //  $(window).resize();
                    diathink.UndoController.refreshButtons();
                    diathink.keyboard = diathink.keyboardSetup.extend({
                        // hiddeninput: diathink.app.pages[pageName].hiddeninput.input.id
                    });
                    diathink.keyboard.init();
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
                        handle:'> div > .drag-handle',
                        buryDepth:0,
                        scroll:true,
                        keyboard: diathink.keyboard,
                        dropLayers: '.droplayer',
                        helper: function (e, item) {
                            var newNode = item[0].cloneNode(true);
                            newNode.id = '';
                            var drawlayer = $('#'+M.ViewManager.getCurrentPage().drawlayer.id);
                            drawlayer[0].appendChild(newNode);
                            return $(newNode).css({
                                position: 'absolute',
                                left: $(item).offset().left+'px',
                                top: $(item).offset().top+'px'
                            });
                        },
                        // handle: '> div > div > a > div > .handle',
                        toleranceElement:'> div.outline-header'
                    });
                }
            }
        },
        hiddendiv:M.ContainerView.design({
            cssClass: 'hiddendiv'
        }),
        /*
        hiddeninput:M.ContainerView.design({
            childViews: 'input',
            cssClass: "hiddeninput",
            input: M.HiddenInputView.design({
                hasMultipleLines: true,
                events: {
                    keyup: {
                        action: function(id) {
                            if (diathink.focused) {
                                $(diathink.focused).text($('#'+id).val());
                            }
                        }
                    }
                }
            })
        }),
        */
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