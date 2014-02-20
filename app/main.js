
m_require("app/controllers/OutlineController.js");
m_require("app/views/PanelOutlineView.js");
m_require("app/controllers/HistoryController.js");


// Test for Mobile not on homepage
var nav = navigator;
if (nav.userAgent.match(/iPhone/i) ||
    nav.userAgent.match(/iPad/i) ||
    nav.userAgent.match(/iPod/i)) {

    if (! nav.standalone) {
        $D.isSafari = (/Safari/i).test(nav.appVersion) && !(/CriOS/i).test(nav.appVersion);
        var OSVersion = nav.appVersion.match(/OS (\d+_\d+)/i);
        $D.OSVersion = OSVersion && OSVersion[1] ? +OSVersion[1].replace('_', '.') : 0;
        // show message & abort application.
    }
}
$D.is_touch_device = 'ontouchstart' in document.documentElement;


M.assert = function(test) {
    if (!test) {
        throw "Assertion failed";
    }
}

$D.data = new $D.OutlineNodeCollection([
    {text: "Test 1",
        children: [
            {text: "Child 1 1",
                children: [{text: "Child 1 1 - 1"}]},
            {text: "Child 1 2"}
        ]},
    {text: "Test 2"}
]);

$D.app = M.Application.design({
    entryPage:'page1' // required for start-page
});

function scheduleKey(simulated, id, opts) {
    var schedule;
    if (simulated) {
        $D.ActionManager.subschedule(function() {
            return $D.Action.checkTextChange(id)}, opts);
    } else {
        $D.ActionManager.schedule(function() {
            return $D.Action.checkTextChange(id)}, opts);
    }
};

$D.updatePanelButtons = function() {
   var content = M.ViewManager.getCurrentPage().content;
   var l = $('#'+content.leftbutton.id);
   var r = $('#'+content.rightbutton.id);
   var n, p;
   var allowleft=false, allowright=false;
   var PM = $D.PanelManager;
   if (PM.leftPanel !== '') {
       if (PM.prevpanel[PM.leftPanel]!=='') {
           allowleft = true;
       }
       for (n=1, p=PM.leftPanel; p!==''; ++n, p=PM.nextpanel[p]) {
           if (n>PM.panelsPerScreen) {
               allowright = true;
               break;
           }
       }
   }
   if (allowleft) {
       l.css('visibility', 'visible');
   } else {
       l.css('visibility', 'hidden');
   }
   if (allowright) {
       r.css('visibility', 'visible');
   } else {
       r.css('visibility', 'hidden');
   }
};

$D.redrawPanels = function(dir) {
    var p, n;
    var PM = $D.PanelManager;

    for (p = PM.leftPanel, n=1;
         (p!=='') && (n<=PM.panelsPerScreen);
         ++n, p=PM.nextpanel[p]) {
        if (dir==='right') {
            $D.redrawPanel(n, p, false);
        }
    }
    var n2 = n;
    for ( ; n2<=PM.panelsPerScreen; ++n2) {
        $D.removePanel(n2);
    }
    if (dir==='left') {
        --n; p=PM.prevpanel[p];
        for ( ;
            (p!=='') && (n>=1);
            --n, p=PM.prevpanel[p]) {
            $D.redrawPanel(n, p, false);
        }
    }

    PM.updateRoots();
};

$D.redrawPanel = function(n, p, firsttime) {
    // should changeRoot it instead?
    var c;
    var PM = $D.PanelManager;
    var grid = M.ViewManager.getCurrentPage().content.grid;
    if (grid['scroll'+String(n)]) {
        c = grid['scroll'+String(n)].destroy(); // save context for this
        // panel destroy() respects outline graveyard.
        grid['scroll'+String(n)] = null;
    } else {
        c = {
            prev: null,
            next: null,
            parent: $('#'+grid.id).children().get(n-1)
        };
    }

    // create a new panel with right id, but wrong alist & breadcrumbs.
    grid['scroll'+String(n)] = $D.PanelOutlineView.designWithID({
        id: p,
        parentView: grid,
        rootModel: null
    });
    grid['scroll'+String(n)].renderAt(c);

    // grid['scroll'+String(n)].theme();
    // grid['scroll'+String(n)].registerEvents();
    grid['scroll'+String(n)].changeRoot(
            PM.rootModels[p],
            PM.rootViews[p]
    );
};

$D.removePanel = function(n) {
    var grid = M.ViewManager.getCurrentPage().content.grid;
    grid['scroll'+String(n)].destroy();
    grid['scroll'+String(n)] = null;
};

$D.handleKeypress = function(elem, e) {
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
                    action: $D.MoveIntoAction,
                    anim: 'indent',
                    activeID: liView.modelId,
                    referenceID: collection.models[rank-1].cid,
                    oldRoot: liView.rootID,
                    newRoot: liView.rootID,
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

$D.handleKeydown = function(elem, e) {
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
                action: $D.MoveIntoAction,
                anim: 'indent',
                activeID: liView.modelId,
                referenceID: collection.models[rank-1].cid,
                oldRoot: liView.rootID,
                newRoot: liView.rootID,
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
                    action: $D.OutdentAction,
                    anim: 'indent',
                    activeID: liView.modelId,
                    referenceID: liView.value.attributes.parent.cid,
                    oldRoot: liView.rootID,
                    newRoot: liView.rootID,
                    focus: true
                };});
                e.preventDefault();
                return;
            } else { // delete or merge-lines?
                if ($('#'+id).val() === "") {
                    if (liView.value.get('children').length===0) {
                        scheduleKey(e.simulated, id, function() { return {
                            action: $D.DeleteAction,
                            anim: 'delete',
                            activeID: liView.modelId,
                            oldRoot: liView.rootID,
                            newRoot: liView.rootID,
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
            action: $D.InsertAfterAction,
            anim: 'create',
            referenceID: liView.modelId,
            oldRoot: liView.rootID,
            newRoot: liView.rootID,
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

$D.app.createPage = function(pageName, root) {
    // get breadcrumbs, parent-collection
    // todo: later: do we preserve expand/contract status? maybe not.
    var pageShown = 0;

    $D.app.pages[pageName] = new M.PageView({
        cssClass: 'ui-page ui-body-c ui-page-header-fixed ui-page-active ui-sortable',
        childViews:'hiddendiv header content drawlayer',
        registerEvents: function () {
                    // todo: here, set the outline-controller to correct collection
                    var id = M.ViewManager.getPage(pageName).id;
                    if (pageShown>0) {return;} // first-call
                    ++pageShown;

                    $D.bindToCaller(this, M.View.prototype.registerEvents)();

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
                            // $D.keyboard.blur();
                            if ($D.focused && $D.focused.id) {
                                if (M.ViewManager.getViewById($D.focused.id)) {
                                    M.ViewManager.getViewById($D.focused.id).blur();
                                }
                            }
                            $D.focused = null;
                            return;
                        }
                        if (e.target && e.target.nodeName && e.target.nodeName.toLowerCase()==='textarea') {
                            //console.log('focusing keyboard from focusin');
                            $D.focused = e.target;
                            // check if keyboard opened
                            // $D.keyboard.focus();
                            M.ViewManager.getViewById(e.target.id).focus();
                        } else {
                            // check if keyboard closed
                            // console.log('blurring keyboard from focusin');
                            // $D.keyboard.blur();
                            if ($D.focused && $D.focused.id) {
                                if (M.ViewManager.getViewById($D.focused.id)) {
                                    M.ViewManager.getViewById($D.focused.id).blur();
                                }
                            }
                            $D.focused = null;
                        }
                    });
                    var vmousedown = 'mousedown';
                    if ($D.is_touch_device) {
                        vmousedown = 'touchstart';
                    }
                    var vmouseup = 'mouseup';
                    if ($D.is_touch_device) {
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
                    var tap = 'click';
                    if ($.is_touch_device) {tap = 'tap';}
            // TODO: make this more efficient.
            $('#'+id).on(tap, '.undo-button span', function(e) {
                $D.ActionManager.undo()
            });
            $('#'+id).on(tap, '.redo-button span', function(e) {
                $D.ActionManager.redo()
            });



            $('#'+id).on(tap, '.disclose', function (e) {
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
                                $D.ActionManager.schedule(
                                    function() {
                                        return $D.Action.checkTextChange(li.header.name.text.id);
                                    },
                                    function() {
                                        return {
                                            action: $D.RootAction,
                                            activeID: li.value.cid,
                                            oldRoot: li.rootID,
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
                                    if (!liElem.hasClass('branch')) {return false;}
                                    return {
                                            action: $D.CollapseAction,
                                            activeID: view.parentView.parentView.value.cid,
                                            collapsed: ! liElem.hasClass('collapsed'),
                                            oldRoot: view.parentView.parentView.rootID,
                                            newRoot: view.parentView.parentView.rootID,
                                            focus: false
                                        };
                                });
                            }
                    });
                    $('#'+id).on(tap, '.left-button', function(e) {
                        var PM = $D.PanelManager;
                        PM.leftPanel = PM.prevpanel[PM.leftPanel];
                        $D.updatePanelButtons();
                        $D.redrawPanels('right');
                    });
                    $('#'+id).on(tap, '.right-button', function(e) {
                        var PM = $D.PanelManager;
                        PM.leftPanel = PM.nextpanel[PM.leftPanel];
                        $D.updatePanelButtons();
                        $D.redrawPanels('left');
                    });

                    $('#'+id).on(tap, '.ui-breadcrumb-link', function(e) {
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
                            $D.ActionManager.schedule(
                              function() {
                                  return {
                                action: $D.RootAction,
                                activeID: modelid,
                                oldRoot: panelview.outline.alist.rootID,
                                newRoot: 'new'
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

                    $D.hoverItem = null, $D.hoverTimer = null;
                    // handle hovering-class, also retain class for 500ms in case it's followed by focus class
                   if (! $D.is_touch_device) {
                        $('#'+id).on('mouseover mouseout', function(e) {
                            // find the closest li to the target
                            var li = closestListItem(e.target);
                            if (!li) {return;}
                            if ($D.timer) {clearTimeout($D.timer);}
                            if (e.type==='mouseover') {
                                if (li !== $D.hoverItem) {
                                    $($D.hoverItem).removeClass('ui-btn-hover-c');
                                }
                                $(li).addClass('ui-btn-hover-c');
                                $D.hoverItem = li;
                            } else if (e.type==='mouseout') {
                                if (li === $D.hoverItem) {
                                    $D.timer = setTimeout(function() {
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
                        if ($D.ActionManager.queue.length===0) {
                            // retain browser-default behavior
                            if ($D.focused) {
                                $D.handleKeypress($D.focused, e);
                                console.log('Handled keypress, char='+ String.fromCharCode(e.charCode));
                            } else {
                                console.log('Lost keypress with nothing focused')
                            }
                        } else {
                            console.log("Delaying keypress, char="+ String.fromCharCode(e.charCode));
                            $D.ActionManager.schedule(function() {
                                if ($D.focused) {
                                    e.simulated = true;
                                    $D.handleKeypress($D.focused, e);
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
                        if ($D.ActionManager.queue.length===0) {
                            // retain browser-default behavior
                            if ($D.focused) {
                                $D.handleKeydown($D.focused, e);
                                console.log('Handled keydown, code='+ e.which);
                            } else {
                                console.log('Missed keydown, nothing focused');
                            }
                        } else {
                            console.log('Delaying keydown, code='+ e.which);
                            $D.ActionManager.schedule(function() {
                                if ($D.focused) {
                                    e.simulated = true;
                                    $D.handleKeydown($D.focused, e);
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

                    $(window).on('load',function() {
                        $(window).resize();
                        // $('textarea').trigger('keyup');
                    });
                    // ? also on: mobile.document pagechange

                    $D.ActionManager.refreshButtons();
                    $D.updatePanelButtons();
                    $D.keyboard = $D.keyboardSetup.extend({});
                    $D.keyboard.init();
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
                        keyboard: $D.keyboard,
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
        },
        hiddendiv: new M.ContainerView({
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
                            if ($D.focused) {
                                $($D.focused).text($('#'+id).val());
                            }
                        }
                    }
                }
            })
        }),
        */
        header:new M.ToolbarView({
            childViews: "title undobuttons",
            cssClass: 'ui-header ui-bar-a ui-header-fixed slidedown',
            // value:'HEADER',
            anchorLocation:M.TOP,
            title: new M.LabelView({
                anchorLocation: M.LEFT,
                value: ""
            }),
            undobuttons: new M.ContainerView({
                anchorLocation:M.RIGHT,
                cssClass: 'undo-container',
                childViews: "undobutton redobutton",
                undobutton:new M.ButtonView({
                    isIconOnly: true,
                    cssClass:'undo-button'
                }),
                redobutton:new M.ButtonView({
                    isIconOnly: true,
                    cssClass:'redo-button'
                })
            })
        }),

        content:new M.ContainerView({
            cssClass: "grid-wrapper",
            childViews: "leftbutton rightbutton grid",
            leftbutton:new M.SpanView({
                cssClass: 'left-button',
                value:'<'
            }),
            rightbutton:new M.SpanView({
                cssClass: 'right-button',
                value:'>'
            }),
            grid: new M.GridView({
                cssClass: "scroll-container",
                panelManager: $D.PanelManager,
                childViews: "scroll1 scroll2",
                layout: M.TWO_COLUMNS,
                scroll1:new $D.PanelOutlineView({
                    rootModel: root
                }),
                scroll2:new $D.PanelOutlineView({
                    rootModel: root
                })
            })
        }),

        drawlayer:new M.ContainerView({
            cssClass: 'drawlayer'
        })
    });


    // $D.app.pages[pageName].render();
};

$D.app.createPage('page1', null);
// Update Panel-Manager with grid-panels
$D.PanelManager.initFromDOM($D.app.pages['page1'].content.grid);

/*
$D.app.configure({
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