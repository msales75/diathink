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
diathink.is_touch_device = 'ontouchstart' in document.documentElement;


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
    entryPage:'page1' // required for start-page
});

function scheduleKey(simulated, id, opts) {
    var schedule;
    if (simulated) {
        diathink.ActionManager.subschedule(function() {
            return diathink.Action.checkTextChange(id)}, opts);
    } else {
        diathink.ActionManager.schedule(function() {
            return diathink.Action.checkTextChange(id)}, opts);
    }
};

diathink.handleKeypress = function(elem, e) {
    var id = elem.id;
    var key = String.fromCharCode(e.charCode);
    var liView, collection, rank, sel;
    liView = M.ViewManager.findViewById(id).parentView.parentView.parentView;
    if (key === ' ') {
        sel = $(elem).selection();
        // check if cursor is on far left of textbox
        if (sel && (sel[0] === 0) && (sel[1] === 0)) {
            // get parent-collection and rank
            collection = liView.parentView.value;
            rank = _.indexOf(collection.models, liView.value);
            // validate rank >=0
            if (rank>0) { // indent the line
                // make it the last child of its previous sibling
                scheduleKey(e.simulated, id, function() { return {
                    action: diathink.MoveIntoAction,
                    anim: 'indent',
                    activeID: liView.modelId,
                    referenceID: collection.models[rank-1].cid,
                    oldView: liView.rootID,
                    newView: liView.rootID,
                    focus: true
                };});
                e.preventDefault();
                return;
            }
        }
    }
    if (e.simulated) {
        sel = $(elem).selection();
        // console.log("simulate keypress = "+key);
        // todo: manually draw char and move cursor
        if (sel) {
            var start = sel[0];
            var end = sel[1];
            var value = $(elem).val();
            $(elem).val(value.substr(0, start)+key+value.substr(end));
            $(elem).text($(elem).val());
            $(elem).setSelection(start+1, start+1);
        }
    }
};

diathink.handleKeydown = function(elem, e) {
    var id = elem.id;
    var liView, collection, rank, sel;
    liView = M.ViewManager.findViewById(id).parentView.parentView.parentView;

    if (e.which === 9) { // tab
        collection = liView.parentView.value;
        rank = _.indexOf(collection.models, liView.value);
        // validate rank >=0
        if (rank>0) { // indent the line
            // make it the last child of its previous sibling
            scheduleKey(e.simulated, id, function() { return {
                action: diathink.MoveIntoAction,
                anim: 'indent',
                activeID: liView.modelId,
                referenceID: collection.models[rank-1].cid,
                oldView: liView.rootID,
                newView: liView.rootID,
                focus: true
            };});
            e.preventDefault();
            return;
        }
    } else if (e.which === 8) { // backspace
        sel = $('#'+id).selection();
        if (sel && (sel[0] === 0) && (sel[1] === 0)) {
            // get parent-collection and rank
            collection = liView.parentView.value;
            rank = _.indexOf(collection.models, liView.value);
            // if it is the last item in its collection
            if ((liView.parentView.parentView != null) &&
                (liView.parentView.parentView.type==='M.ListItemView')&&
                (rank===collection.models.length-1)) {
                // make it the next child of its parent
                scheduleKey(e.simulated, id, function() { return {
                    action: diathink.OutdentAction,
                    anim: 'indent',
                    activeID: liView.modelId,
                    referenceID: liView.value.attributes.parent.cid,
                    oldView: liView.rootID,
                    newView: liView.rootID,
                    focus: true
                };});
                e.preventDefault();
                return;
            } else { // delete or merge-lines?
                if ($('#'+id).val() === "") {
                    if (liView.value.get('children').length===0) {
                        scheduleKey(e.simulated, id, function() { return {
                            action: diathink.DeleteAction,
                            anim: 'delete',
                            activeID: liView.modelId,
                            oldView: liView.rootID,
                            newView: liView.rootID,
                            focus: true
                        };});
                        e.preventDefault();
                        return;
                    }
                }
            }
        }
    } else if (e.which === 13) { // enter
        // todo: split line if in middle of text
        scheduleKey(e.simulated, id, function() { return {
            action: diathink.InsertAfterAction,
            anim: 'create',
            referenceID: liView.modelId,
            oldView: liView.rootID,
            newView: liView.rootID,
            focus: true
        };});
        e.preventDefault();
        // var scrollid = $('#'+id).closest('.ui-scrollview-clip').attr('id');
        // M.ViewManager.findViewById(scrollid).themeUpdate();
    }
    e.stopPropagation();
    if (e.simulated && (e.which === 8 )) { // simulate backsapce
        if (sel) {
            var start = sel[0];
            var end = sel[1];
            var value = $(elem).val();
            if (end>0) {
                $(elem).val(value.substr(0, start-1)+value.substr(end));
                $(elem).text($(elem).val());
                $(elem).setSelection(start-1, start-1);
            }
        }
        // console.log("simulate backspace");
    }
};

diathink.app.createPage = function(pageName, root) {
    // get breadcrumbs, parent-collection
    // todo: later: do we preserve expand/contract status? maybe not.
    var pageShown = 0;

    diathink.app.pages[pageName] = M.PageView.design({
        childViews:'hiddendiv header content drawlayer',
        events: {
            pageshow: {
                action:function () {
                    // todo: here, set the outline-controller to correct collection
                    var id = M.ViewManager.getPage(pageName).id;
                    if (pageShown>0) {return;} // first-call
                    ++pageShown;

                    var fontsize = Number($('body').css('font-size').replace(/px/,''));
                    var $textarea = $.stylesheet('li.ui-li .outline-header > div > textarea.outline-content.ui-input-text');
                    $textarea.css({
                        'min-height': String(Math.round(1.25*fontsize))+'px',
                        'line-height': String(Math.round(1.25*fontsize))+'px',
                        padding: String(Math.round(0.15*fontsize))+'px '+String(Math.round(0.18*fontsize))+'px'
                    });
                    var $textareaParent = $.stylesheet('li.ui-li .outline-header > div.outline-content_container');
                    $textareaParent.css({
                        'height': String(Math.round(1.55*fontsize))+'px'
                    });
                    var $hiddendiv = $.stylesheet('div.hiddendiv');
                    $hiddendiv.css({
                        'min-height': String(Math.round(1.25*fontsize))+'px',
                        'line-height': String(Math.round(1.25*fontsize))+'px'
                    });
                    var $hiddendivSpan = $.stylesheet('div.hiddendiv > span.marker');
                    $hiddendivSpan.css({
                        'line-height': String(Math.round(1.25*fontsize))+'px'
                    });


                    $('#'+id).on('focusin focusout', 'textarea', function(e) {
                        // todo: does this have performance issues (on Firefox) - stop using this?
                        //  eventually vmousedown instead?
                        // console.log('Check call-count: calling '+ e.type+' for textarea');
                        if (e.type=='focusout') {
                            // does this occur on manual keyboard-close?
                            // console.log('blurring keyboard from focusout');
                            // diathink.keyboard.blur();
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
                            // diathink.keyboard.focus();
                            M.ViewManager.getViewById(e.target.id).focus();
                        } else {
                            // check if keyboard closed
                            // console.log('blurring keyboard from focusin');
                            // diathink.keyboard.blur();
                            if (diathink.focused && diathink.focused.id) {
                                if (M.ViewManager.getViewById(diathink.focused.id)) {
                                    M.ViewManager.getViewById(diathink.focused.id).blur();
                                }
                            }
                            diathink.focused = null;
                        }
                    });
                    var vmousedown = 'mousedown';
                    if (diathink.is_touch_device) {
                        vmousedown = 'touchstart';
                    }
                    var vmouseup = 'mouseup';
                    if (diathink.is_touch_device) {
                        vmouseup = 'touchend';
                    }
                    var vmouse = vmousedown+' '+vmouseup;
                    $('#'+id).on(vmousedown, '.disclose', function(e) {
                        var targetView = M.ViewManager.getViewById(this.id).parentView.name.text;
                        // add a class for non-text focus
                        $('#'+targetView.id).addClass('hide-selection').selectText().focus().selectText();
                    });
                    $('#'+id).on(vmousedown, 'textarea', function(e) {
                        $(this).removeClass('hide-selection');
                    });

                    $('#'+id).on('tap', '.disclose', function (e) {
                            var now = (new Date()).getTime();
                            // $('input.ui-disable-scroll').removeClass('ui-disable-scroll');
                            var view = M.ViewManager.getViewById(this.id);
                            var liElem = $('#'+view.parentView.parentView.id);
                            if (view.lastClicked && (view.lastClicked > now - 500) && !view.lastDouble) {
                                // process double-click
                                // liElem.toggleClass('expanded').toggleClass('collapsed');
                                view.lastDouble = true;
                                var li= M.ViewManager.getViewById(view.parentView.parentView.id);
                                // todo-here
                                diathink.ActionManager.schedule(
                                    function() {
                                        return diathink.Action.checkTextChange(li.header.name.text.id);
                                    },
                                    function() {
                                        return {
                                            action: diathink.RootAction,
                                            activeID: li.value.cid,
                                            oldView: li.rootID,
                                            newView: 'new'
                                        };
                                    });
                            } else { // single-click
                                view.lastClicked = now;
                                // todo-here
                                diathink.ActionManager.schedule(
                                  function() {
                                      return diathink.Action.checkTextChange(view.parentView.parentView.header.name.text.id);
                                  },
                                  function() {
                                    if (!liElem.hasClass('branch')) {return false;}
                                    return {
                                            action: diathink.CollapseAction,
                                            activeID: view.parentView.parentView.value.cid,
                                            collapsed: ! liElem.hasClass('collapsed'),
                                            oldView: view.parentView.parentView.rootID,
                                            newView: view.parentView.parentView.rootID,
                                            focus: false
                                        };
                                });
                            }
                    });

                    $('#'+id).on('tap', '.ui-breadcrumb-link', function(e) {
                        // $('input.ui-disable-scroll').removeClass('ui-disable-scroll');
                        var view = M.ViewManager.getViewById($(this).parent().attr('id'));
                        var now = (new Date()).getTime();
                        if (!view.lastClicked || (view.lastClicked < now - 1000)) {
                            view.lastClicked = now;
                            var modelid= $(this).attr('data-href');
                            var panelview = M.ViewManager.getViewById($(this).parent().attr('id')).parentView;
                            if (modelid==='home') {
                                modelid = null;
                            }
                            // todo-here - see if text changes appropriately.
                            diathink.ActionManager.schedule(
                              function() {
                                  return {
                                action: diathink.RootAction,
                                activeID: modelid,
                                oldView: panelview.outline.alist.rootID,
                                newView: 'new'
                            };});
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
                   if (! diathink.is_touch_device) {
                        $('#'+id).on('mouseover mouseout', function(e) {
                            // find the closest li to the target
                            var li = closestListItem(e.target);
                            if (!li) {return;}
                            if (diathink.timer) {clearTimeout(diathink.timer);}
                            if (e.type==='mouseover') {
                                if (li !== diathink.hoverItem) {
                                    $(diathink.hoverItem).removeClass('ui-btn-hover-c');
                                }
                                $(li).addClass('ui-btn-hover-c');
                                diathink.hoverItem = li;
                            } else if (e.type==='mouseout') {
                                if (li === diathink.hoverItem) {
                                    diathink.timer = setTimeout(function() {
                                        $(li).removeClass('ui-btn-hover-c');
                                    }, 500);
                                } else { // if a different item is hovering do nothing
                                }
                            }
                        });
                    }
                    // Note: input and paste do not bubble, so these don't work.
                    $('#'+id).on('keyup change input paste', 'textarea', function(e) {
                        var view = M.ViewManager.getViewById($(this).attr('id'));
                        view.setValueFromDOM();
                        view.themeUpdate();
                    });
                    // need to update text and selection-position manually
                    $(window).on('keypress', function(e) {
                        console.log('Acknowledging keypress, char="'+ String.fromCharCode(e.charCode)+'"');
                        if (diathink.ActionManager.queue.length===0) {
                            // retain browser-default behavior
                            if (diathink.focused) {
                                diathink.handleKeypress(diathink.focused, e);
                                console.log('Handled keypress, char='+ String.fromCharCode(e.charCode));
                            } else {
                                console.log('Lost keypress with nothing focused')
                            }
                        } else {
                            console.log("Delaying keypress, char="+ String.fromCharCode(e.charCode));
                            diathink.ActionManager.schedule(function() {
                                if (diathink.focused) {
                                    e.simulated = true;
                                    diathink.handleKeypress(diathink.focused, e);
                                    console.log('Handled delayed keypress, char='+ String.fromCharCode(e.charCode));
                                } else {
                                    console.log('Lost keypress with nothing focused')
                                }
                                return null;
                            });
                            e.preventDefault();
                        }
                        e.stopPropagation();
                    });
                    // only handle non-ascii characters in keydown
                    var keyDownCodes= {8: 8, 9: 9, 13: 13};
                    $(window).on('keydown', function(e) {
                        if (!keyDownCodes[e.which]) {return true;}
                        console.log('Acknowledging keydown, code='+ e.which);
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
                        if (diathink.ActionManager.queue.length===0) {
                            // retain browser-default behavior
                            if (diathink.focused) {
                                diathink.handleKeydown(diathink.focused, e);
                                console.log('Handled keydown, code='+ e.which);
                            } else {
                                console.log('Missed keydown, nothing focused');
                            }
                        } else {
                            console.log('Delaying keydown, code='+ e.which);
                            diathink.ActionManager.schedule(function() {
                                if (diathink.focused) {
                                    e.simulated = true;
                                    diathink.handleKeydown(diathink.focused, e);
                                    console.log('Handled delayed keydown, code='+ e.which);
                                } else {
                                    console.log('Missed delayed keydown, nothing focused');
                                }
                                return null;
                            });
                            e.preventDefault();
                        }
                        e.stopPropagation();
                    });

                    $.mobile.window.on('load',function() {
                        $(window).resize();
                        // $('textarea').trigger('keyup');
                    });
                    // ? also on: mobile.document pagechange

                    diathink.ActionManager.refreshButtons();
                    diathink.keyboard = diathink.keyboardSetup.extend({});
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
                            target:diathink.ActionManager,
                            action:'undo'
                        }
                    }
                }),
                redobutton:M.ButtonView.design({
                    isIconOnly: true,
                    cssClass:'redo-button',
                    events: {
                        tap: {
                            target:diathink.ActionManager,
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