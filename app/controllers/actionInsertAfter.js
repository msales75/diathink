
// todo: get the information we need early on from action,
//  to know what the oldType, newType and contexts are.

// types: line, panel, link, breadcrumb, inlink
// for each type, must have location, box-dims, text-size,


// todo: Put text and collapsed into oldModelContext/newModelContext
// todo: Put old-focus & view-collapsed into ?
// todo: Put panel into new/oldPanelContext

// Flag for scroll
// todo: action stores oldFocus and newFocus ? (maybe not)
// todo: handle focusID in context, and validate it.
// todo: undo-scroll (maybe focus)
diathink.animHelpers = {

    getObjectParams: function(obj, textobj) {
        // if old-type = new-type, don't need to deal with this
        var oldParams = {};
        oldParams.elem = oldObject;
        var offset = $(oldObject).offset();
        oldParams.top = offset.top;
        oldParams.left = offset.left;
        var textoffset = $(textobj).offset();
        oldParams.textTop = textoffset.top - offset.top;
        oldParams.textLeft = textoffset.left - offset.left;
        oldParams.fontSize = Number($(textobj).css('font-size').replace(/px/,''));
        oldParams.textWidth = $(textobj).width();
        oldParams.textHeight = $(textobj).height();
        oldParams.color = $(textobj).css('color');
        return oldParams;
    },

    animStep: function(frac) {
        var i, r = this.runtime, o = this.runtime.animOptions;
        // loop over all outlines
        var outlines = diathink.OutlineManager.outlines;
        for (i in outlines) {
            if (!o.view[i]) {continue;}
            if (r.rOldLinePlaceholder[i]) {
                this.oldLinePlaceAnimStep(frac, o.view[i]);
            }
            if (r.rNewLinePlaceholder[i]) {
                this.newLinePlaceAnimStep(frac, o.view[i]);
            }
            if (this.oldType==='panel') {

            }
        }
        if (o.dock) {
            this.dockAnimStep(frac, o);
            this.animFadeEnv(frac, o);
        }
    },

    oldLinePlaceAnimStep: function(frac, o) {
        var startOldHeight = o.startOldHeight, rootID = o.rootID;
        $(this.runtime.rOldLinePlaceholder[rootID]).css('height',
            String(Math.round(startOldHeight*(1-frac)))+'px');
    },

    newLinePlaceAnimStep: function(frac, o) {
        var endNewHeight = o.endNewHeight, sameHeight = o.sameHeight,
            rootID = o.rootID, startOldHeight = o.startOldHeight;
        if ((this.oldType==='line') && sameHeight) {
            $(this.runtime.rNewLinePlaceholder[rootID]).css('height',
                String(startOldHeight - Math.round(startOldHeight*(1-frac)))+'px');
        } else {
            $(this.runtime.rNewLinePlaceholder[rootID]).css('height',
                String(Math.round(frac*endNewHeight))+'px');
        }
    },
    dockAnimStep: function(frac, o) {
        var endX= o.endX, endY= o.endY,
            startX = o.startX, startY = o.startY;

        var left = String(Math.round(frac*endX+(1-frac)*startX));
        var top = String(Math.round(frac*endY+(1-frac)*startY));
        var css = {
            left: left+'px',
            top: top+'px'
        };
        if ((this.options.anim==='indent')&&(left > startX)) {
            css.width = String(o.startWidth-(left-startX))+'px';
        }
        if (o.startColor && o.endColor) {
            var color = [Math.round((1-frac)*o.startColor[0]+ frac*o.endColor[0]),
                Math.round((1-frac)*o.startColor[1]+ frac*o.endColor[1]),
                Math.round((1-frac)*o.startColor[2]+ frac*o.endColor[2])];
            css.color = ['rgb(',color.join(','),')'].join('');
        }
        if (o.startSize && o.endSize) {
            css['font-size'] = [Math.round((1-frac)*o.startSize+frac*o.endSize),'px'].join('');
        }
        $(this.options.dockElem).css(css);
    },
    animFadeEnv: function() {
        var r = this.runtime;
        if (this.oldType!==this.newType) {
            if (this.oldType==='line') { // get rid of borders & handle

            } else if (this.oldType==='panel') { // get rid of breadcrumb-stuff?

            }
        }
    },
    panelPrep: function() {
        var r = this.runtime;

        if (r.rOldType !== 'panel') {return;}


        // todo: next:

        // similar to oldLinePlace and newLinePlace, but for only one view.
        // step 1: replace original with old-placeholder
        //    might animate to lose space if disappearing
        // step 2: create new-placeholder
        //    visual-placeholder rendered w/o children if panel

        // we need paneldock when moving to a panel, or when undoing back to a panel

        var panelContext = r.rNewPanelContext;

        var activeView = this.getLineView(this.options.activeID, this.options.oldRoot);
        var drawlayer = $('#'+M.ViewManager.getCurrentPage().drawlayer.id);

        // dock item to newPanel
        var hiddenbread = M.BreadcrumbView.design({});
        // .breadcrumbs-dock hides last breadcrumb-item
        hiddenbread.defineFromModel(this.getModel(this.options.activeID));
        var item = $(hiddenbread.render()).addClass('breadcrumbs-dock').appendTo(drawlayer);
        var endBreadcrumbHeight = item[0].clientHeight;

        // if there's no helper, create a docking-clone
        if (r.createDockElem) {
            activeView = activeView.header.name.text;
            this.options.dockElem = $('#'+activeLineView.id)[0].cloneNode(true);
        }
        // prepare to dock into panelContext
        // deal with panel-object-format for helper-object?

        // determine docking destination-coordinates
        // expand height of breadcrumb-box if needed
        // fade-in hidden breadcrumb-box over original
        // change DOM content at the end, destroying animated one

        // add destination-placeholder at activeID
        // mark title-text location in
        // fade out any lost-breadcrumbs; transform breadcrumb-hyperlink into text.
    },

    preDock: function() {
        var r = this.runtime;
        if (r.createDockElem) {
            // create virtual diathink.helper for animation
            // is start-location a line or panel

            // if (r.rOldType === 'panel')

            var oldRoot = r.rOldRoot;
            var activeLineView = this.getLineView(this.options.activeID, oldRoot);
            if (!activeLineView) { // no find item to dock, e.g. undoing drag-into collapsed list
                return;
            }
            if ($('#'+activeLineView.id).length===0) {
                console.log('ERROR: activeLineView exists with missing element');
                debugger;
            }

            // if RootAction, change the helper to be just the text instead of activeLineView
            // how do we know if 'source' is a panel?
            this.options.dockElem = $('#'+activeLineView.id)[0].cloneNode(true);
            this.options.dockElem.id = '';
            var drawlayer = $('#'+M.ViewManager.getCurrentPage().drawlayer.id);
            drawlayer[0].appendChild(this.options.dockElem);
            var offset = $('#'+activeLineView.id).offset();
            $(this.options.dockElem).css({
                position: 'absolute',
                left: offset.left+'px',
                top: offset.top+'px',
                width: $('#'+activeLineView.id)[0].clientWidth,
                height: $('#'+activeLineView.id)[0].clientHeight
            });
            $(document.body).addClass('transition-mode');
        }
    },

    // this seems the same for RootAction panel-docking
    // todo: for non-docking, start fade-in after restoreContext before focus
    // dock the dragged-helper
    dockAnim: function(newRoot) {
        var r = this.runtime;
        console.log('In dockAnim now');
        if (r.performDock) {
            // Is newLinePlace for this view above or below source?
            if ((this.newModelContext == null)||(this.oldModelContext == null)) {
                console.log("ERROR: docking attempted with null context");
                debugger;
            }
            if (! r.rNewLinePlaceholder[newRoot]) { // nowhere to dock
                $(document.body).removeClass('transition-mode');
                this.options.dockElem.parentNode.removeChild(this.options.dockElem);
                this.options.dockElem = undefined;
                console.log('Missing rNewLinePlaceholder in dockAnim');
                return;
            }
            if (!this.options.dockElem) { // nothing to dock
                console.log('Missing dockElem in dockAnim');
                return;
            }
            var speed;
            if (this.options.anim==='dock') {speed = this.dockSpeed;}
            else if (this.options.anim==='indent') {speed = this.indentSpeed;}
            var startX = this.options.dockElem.offsetLeft;
            var startY = this.options.dockElem.offsetTop;
            var startWidth = this.options.dockElem.clientWidth;

            var destination = $(r.rNewLinePlaceholder[newRoot]).offset();
            if (r.rOldLinePlaceholder[newRoot]) {
                var oldOffset = $(r.rOldLinePlaceholder[newRoot]).offset();
                if (destination.top > oldOffset.top) {destination.top -= r.activeLineHeight[newRoot];}
            }
            $(this.options.dockElem).addClass('ui-first-child').addClass('ui-last-child');

            // todo: inject speed and take max-duration?
            console.log('Extending animOptions NOW');
            _.extend(r.animOptions, {
                dock: true,
                startX: startX,
                startY: startY,
                endX: destination.left,
                endY: destination.top,
                startWidth: startWidth
            });
        }
    },
    oldLinePlace: function(outline) {
        var r = this.runtime;
        if (r.rOldLinePlaceholder[outline.rootID]) {
            var activeLineView = this.getLineView(this.options.activeID, outline.rootID);

            // if view doesn't exist, insert no placeholder because it's invisible
            if (activeLineView == null) {
                // console.log("activeLineView is null in oldLinePlace for action type="+
                // this.type+"; undo="+this.options.undo+"; redo="+
                // this.options.redo+"; activeID="+this.options.activeID+
                // "; rootID="+outline.rootID);
                return;
            }
            // vanish if not already hidden & shrink over 80ms
            if ($('#'+activeLineView.id).length===0) {
                console.log('ERROR: activeLineView '+activeLineView.id+' exists but has not element for oldLinePlace');
                debugger;
            }
            var activeObj = $('#'+activeLineView.id).addClass('drag-hidden');
            var activeLineHeight = activeObj[0].clientHeight;
            console.log("Creating placeholder with css-height="+activeLineHeight);
            var rOldLinePlaceholder = $('<li></li>').addClass('li-placeholder').css('height',String(activeLineHeight)+'px');
            if (activeObj.hasClass('ui-first-child')) {
                rOldLinePlaceholder.addClass('ui-first-child');
            }
            if (activeObj.hasClass('ui-last-child')) {
                rOldLinePlaceholder.addClass('ui-last-child');
            }
            // if placeholder is present, old activeLineView-element must be removed.
            activeObj[0].parentNode.replaceChild(rOldLinePlaceholder[0],activeObj[0]);
            // activeObj is here removed from DOM, though still has a view.
            r.activeLineHeight[outline.rootID] = activeLineHeight;
            r.rOldLinePlaceholder[outline.rootID] = rOldLinePlaceholder[0];
            r.activeLineElem[outline.rootID] = activeObj[0];
            console.log('Added oldline placeholder to outline '+outline.rootID);
            console.log(r.rOldLinePlaceholder[outline.rootID]);
            console.log('ActiveLineElem changed to: ');
            console.log(r.activeLineElem[outline.rootID]);
        }
    },
    newLinePlace: function(outline) {
        // if (this.options.anim==='indent') {return;}
        var r = this.runtime;
        var newModelContext = r.rNewModelContext;
        if (r.rNewLinePlaceholder[outline.rootID]) {
            var parentView = this.contextParentVisible(newModelContext, outline);
            if (!parentView || parentView.collapsed) {
                console.log('ERROR');
                debugger;
            }
            var place = $('<li></li>').addClass('li-placeholder').css('height', 0);
            r.rNewLinePlaceholder[outline.rootID] = place.get(0);
            if (! newModelContext.prev) {
                place.addClass('ui-first-child');
            }
            if (! newModelContext.next) {
                place.addClass('ui-last-child');
            }
            if (newModelContext.next) {
                place.insertBefore('#'+this.getLineView(newModelContext.next, outline.rootID).id);
            } else if (newModelContext.prev) {
                place.insertAfter('#'+this.getLineView(newModelContext.prev, outline.rootID).id);
            } else if (newModelContext.parent) {
                place.appendTo('#'+parentView.id);
            }
            console.log('Added newline placeholder to outline '+outline.rootID);
            console.log(r.rNewLinePlaceholder[outline.rootID]);
        }
    },
    linePlaceAnim: function(outline) {
        var r = this.runtime;
        if (r.useLinePlaceholderAnim[outline.rootID]) {
            var speed, startOldHeight, endNewHeight, sameHeight=false;
            if (this.options.anim==='delete') {speed = this.deleteSpeed;}
            else if (this.options.anim==='create') {speed = this.createSpeed;}
            else {speed = this.placeholderSpeed;}
            if (r.rOldLinePlaceholder[outline.rootID]) {
                startOldHeight = r.rOldLinePlaceholder[outline.rootID].clientHeight;
            }
            if (r.rNewLinePlaceholder[outline.rootID]) {
                endNewHeight = r.activeLineHeight[outline.rootID];
                if (!endNewHeight) {
                    endNewHeight = Math.round(1.5*Number($(document.body).css('font-size').replace(/px/,'')));
                }
            }
            if (startOldHeight && endNewHeight && (Math.round(startOldHeight)===Math.round(endNewHeight))) {
                sameHeight = true;
            }
            // this.runtime.startOldHeight = startOldHeight;
            // this.runtime.rootID =
            if (r.animOptions.view===undefined) {
                r.animOptions.view = {};
            }
            r.animOptions.view[outline.rootID] = {
                rootID: outline.rootID,
                startOldHeight: startOldHeight,
                endNewHeight: endNewHeight,
                sameHeight: sameHeight
            };
            // console.log("Updating status after finishing async sourceAnim:"+outline.rootID);
        }
    }


}

diathink.Action = Backbone.RelationalModel.extend({
    type:"Action",
    indentSpeed: 80,
    createSpeed: 80,
    deleteSpeed: 80,
    placeholderSpeed: 160,
    dockSpeed: 160,
    oldType: 'line',
    newType: 'line',
    useOldLinePlaceholder: true,
    useNewLinePlaceholder: true,
    constructor: function(options) {
        this.init();
        this.options = _.extend({}, this.options, options);
        return this;
    },
    init: function() {
        _.extend(this, {
            instance: 0,
            user: 0,
            timestamp: null,
            undone: false,
            lost: false,
            oldModelContext:null,
            newModelContext:null,
            oldPanelContext:null,
            newPanelContext:null,
            subactions: [],
            oldViewCollapsed: {},
            // options: {},
            runtime: null // variables that initialize each time _exec is called
        });
        // this.runinit();
    },
    runinit: function() {
        this.runtime = {
            nextQueueScheduled: null,
            activeLineElem: {},
            activeLineHeight: {},
            rOldContextType: {},
            rNewContextType: {},
            rNewLinePlaceholder: {},
            rOldLinePlaceholder: {},
            rOldLineVisible: {},
            rNewLineVisible: {},
            createLineElem: {},
            destroyLineElem: {},
            useLinePlaceholderAnim: {},
            queue: {},
            animOptions: {},
            status: {
                context: 0,
                log: 0,
                undobuttons: 0,
                oldModelCollection: 0,
                oldModelRemove: 0,
                modelCreate: 0,
                newModelRank: 0,
                newModelAdd: 0,
                dockAnim: 0,
                focus: 0,
                end: 0,
                oldLinePlace: {},
                newLinePlace: {},
                linePlaceAnim: {},
                view: {}
            }
        };
        var o = this.options, r = this.runtime;
        if (o.undo || o.redo) {
            r.firsttime = false;
        } else {
            r.firsttime= false;
        }
        if (o.undo) {
            r.rNewRoot = o.oldRoot;
            r.rOldRoot = o.newRoot;
            r.rOldType = this.newType;
            r.rNewType = this.oldType;
        } else {
            r.rNewRoot = o.newRoot;
            r.rOldRoot = o.oldRoot;
            r.rOldType = this.oldType;
            r.rNewType = this.newType;
        }
        console.log("Setting performDock based on anim = "+ o.anim);
        if ((o.anim==='dock')||(o.anim==='indent')||(o.anim==='paneldock')) {
            r.performDock = true;
            if (o.dockElem) {
                r.createDockElem = false;
            } else {
                r.createDockElem = true;
            }
        } else {
            r.performDock = false;
            r.createDockElem = false;
        }
    },
    runinit2: function() {
        var o = this.options, r = this.runtime;
        if (o.undo) {
            r.rOldModelContext = this.newModelContext;
            r.rNewModelContext = this.oldModelContext;
        } else {
            r.rOldModelContext = this.oldModelContext;
            r.rNewModelContext = this.newModelContext;
        }

        r.createModel = false;
        r.destroyModel = false;
        if (r.rOldModelContext && !r.rNewModelContext) {
            r.createModel = true;
        } else if (r.rNewModelContext && !r.rOldModelContext) {
            r.destroyModel = true;
        }

        // create flags for various operations
        // if we're moving a panel, creating a panel, collapsing a panel, changing root.
        r.rOldPanelContext = null;
        r.rNewPanelContext = null;
        if ((r.rOldType==='panel')||(r.rNewType==='panel')) {
            if (o.undo) {
                r.rOldPanelContext = this.newPanelContext;
                r.rNewPanelContext = this.oldPanelContext;
            } else {
                r.rOldPanelContext = this.oldPanelContext;
                r.rNewPanelContext = this.newPanelContext;
            }
        }

        var outlines = diathink.OutlineManager.outlines;
        for (var i in outlines) {
            // figure out what kind of object activeID is in each outline.
            r.rOldContextType[i] = this.getContextType(r.rOldModelContext, outlines[i]);
            r.rNewContextType[i] = this.getContextType(r.rNewModelContext, outlines[i]);

            if (r.rOldType==='line') {
                if ((r.rOldContextType[i]==='none')||
                    (r.rOldContextType[i]==='parentInvisible')||
                    (r.rOldContextType[i]==='parentIsCollapsedLine')) {
                    r.rOldLineVisible[i] = false;
                } else if ((r.rOldContextType[i]==='parentIsRoot')||
                    (r.rOldContextType[i]==='parentIsExpandedLine')) {
                    r.rOldLineVisible[i] = true;
                } else {
                    console.log('ERROR');
                    debugger;
                }
            }
            if (r.rNewType==='line') {
                if ((r.rNewContextType[i]==='none')||
                    (r.rNewContextType[i]==='parentInvisible')||
                    (r.rNewContextType[i]==='parentIsCollapsedLine')) {
                    r.rNewLineVisible[i] = false;
                } else if ((r.rNewContextType[i]==='parentIsRoot')||
                    (r.rNewContextType[i]==='parentIsExpandedLine')) {
                    r.rNewLineVisible[i] = true;
                } else {
                    console.log('ERROR');
                    debugger;
                }
            }

            r.rOldLinePlaceholder[i] = false;
            r.rNewLinePlaceholder[i] = false;
            if ((r.rNewType==='line')&&(r.rOldType==='line')) {
                if (r.rOldLineVisible[i] && this.useOldLinePlaceholder) {r.rOldLinePlaceholder[i] = true;}
                if (r.rNewLineVisible[i] && this.useNewLinePlaceholder) {r.rNewLinePlaceholder[i] = true;}
            }
            r.useLinePlaceholderAnim[i] = false;
            if ((r.rOldLinePlaceholder[i] || r.rNewLinePlaceholder[i])) {
                if (this.options.anim !== 'indent') {
                    r.useLinePlaceholderAnim[i] = true;
                }
            }

            r.createLineElem[i] = false;
            r.destroyLineElem[i] = false;
            if ((r.rNewType==='line') && r.rNewLineVisible[i] && !r.rOldLineVisible[i]) {
                r.createLineElem[i] = true;
            } else if ((r.rOldType==='line') && r.rOldLineVisible[i] && !r.rNewLineVisible[i]) {
                r.destroyLineElem[i] = true;
            }
            // r.rNewLinePlaceholder[i] = {};
            // r.activeLineElem[i]
            // r.activeLineHeight[i]
            // rOldModelContext, rNewModelContext
            // panelContext,
            // r.rOldPanelPlaceholder;
            // r.rNewPanelPlaceholder;
            // r.activePanelElem
        }
    },
    addAsync: function(self, deps, f) {
        this.addQueue(self, deps, f, true);
    },
    addQueue: function(self, deps, f, async) {
        if (!async) {async=false;}
        if (typeof self === 'object') {
            if (this.runtime.queue[self[0]+':'+self[1]]!==undefined) {alert("Queued twice: "+self[0]+':'+self[1]); return;}
            this.runtime.queue[self[0]+':'+self[1]] = [self, deps, f, async];
        } else {
            if (this.runtime.queue[self]!==undefined) {alert("Queued twice: "+self); return;}
            this.runtime.queue[self] = [self, deps, f, async];
        }
    },
    nextQueue: function() {
        // console.log("Running nextQueue");
        if (this.runtime.nextQueueScheduled) {
            clearTimeout(this.runtime.nextQueueScheduled);
        }
        // loop over the queue and start all items which can be started
        var i, j, deps, depj, self, self0, f, ready, n= 0, queue=this.runtime.queue;
        var that = this;
        for (i in queue) {

            if (this.runtime.queue[i]===undefined) {continue;}

            // never start the same job twice
            self = queue[i][0];
            if (typeof self === 'object') { // array
                self0 = this.runtime.status[self[0]];
                // console.log("Considering queue item "+i+" type="+self[0]+":"+self[1]);
                if (self0 && self0[self[1]]>0) {
                    // console.log("Aborting queue item "+i+" because already begun");
                    continue;
                }
            } else {
                // console.log("Considering queue item "+i+" type="+self);
                if (this.runtime.status[self]>0) {
                    // console.log("Aborting queue item "+i+" because already begun");
                    continue;
                }
            }

            deps = queue[i][1];
            f = queue[i][2];
            ready=1;
            // console.log("Checking dependencies for "+i+": "+deps.join(','));
            for (j=0; j<deps.length; ++j) {
                if (typeof deps[j] === 'object') { // a dependency-array
                    depj = this.runtime.status[deps[j][0]];
                    if (!(depj && (depj[deps[j][1]]===2))) {
                        // console.log("Postponing "+i+" because haven't met: "+deps[j][0]+":"+deps[j][1]);
                        ready=0; break;
                    }
                } else { // a simple/string dependency
                    if (!(this.runtime.status[deps[j]]===2)) {
                        // console.log("Postponing "+i+" because haven't met: "+deps[j]);
                        ready=0; break;
                    }
                }
            }
            if (ready) {
                ++n;
                // remove self from queue
                this.execQueue(i);
            }
        }
        if (n>0) {
            this.runtime.nextQueueScheduled = setTimeout(function() {
                that.nextQueue();
            }, 0);
        }
    },
    execQueue: function(i) {
        var q, that = this;
        q = this.runtime.queue[i];
        // console.log("Scheduling "+i);
        if (typeof q[0] === 'object') {
            that.runtime.status[q[0][0]][q[0][1]] = 1;
        } else {
            that.runtime.status[q[0]] = 1;
        }
        setTimeout(function() {
            // console.log("Removing from queue item "+i);
            delete that.runtime.queue[i];
        }, 0);
        setTimeout(function() {
            // console.log("Updating status of item "+i+"before execution");
            // console.log("Executing "+i);
            (q[2])();
            if (!q[3]) { // unless it ends asynchronously like an animation
                // console.log("Updating status after finishing non-async item "+i);
                if (typeof q[0] === 'object') {
                    that.runtime.status[q[0][0]][q[0][1]] = 2;
                } else {
                    that.runtime.status[q[0]] = 2;
                }
                that.nextQueue();
            }
        }, 0);
    },

    // (suppress overflow and set explicit height/width before replacing with placeholder?)
    // similar logic, but panel-operation doesn't need view-loop
    // --> therefore, add additional queue-steps for these.


    // step 3: create helper
    //    a clone of breadcrumbs or line, start at old-placeholder
    // step 4 animate: a) animate helper from old to new
    //   (deal with vertical-offset from new placeholder)
    //      b) expand newLineplaceholder;
    //      c) collapse oldLineplaceholder
    // fade-out panel (separate handler?)


    exec: function(options) {
        var i, rank, nsub;
        if (!options) {options = {};}
        console.log("Starting action "+this.type+" with undo="+options.undo+"; redo="+options.redo);
        if (options.redo) {options.undo = false;}
        if (!options.undo) {this.undone=false;}
        if (options.parentAction) {
            this.parentAction = options.parentAction;
        }

        // if this is undo/redo op, and there are subactions, queue those immediately.
        if (options.redo && (this.subactions.length>0)) {
            nsub = this.subactions.length;
            for (i=0; i<nsub; ++i) {
                rank = diathink.ActionManager.nextRedo();
                if (diathink.ActionManager.actions.at(rank) !== this.subactions[i].action) {
                    console.log("ERROR: Redoing wrong subaction");
                    debugger;
                }
                diathink.ActionManager.subRedo();
            }
        } else if (options.undo && (this.parentAction != null)) {
            nsub = this.parentAction.subactions.length;
            if (this !== this.parentAction.subactions[nsub-1].action) {
                console.log("ERROR: Last subaction in chain was not called first!");
                debugger;
            }
            for (i=0; i<nsub; ++i) {
                rank = diathink.ActionManager.nextUndo();
                if (i===0) {
                    if (diathink.ActionManager.actions.at(rank) !== this.parentAction) {
                        console.log("ERROR: Undoing something else when should be parentAction");
                        debugger;
                    }
                } else {
                    if (diathink.ActionManager.actions.at(rank) !== this.subactions[nsub-1-i].action) {
                        console.log("ERROR: Undoing wrong subaction");
                        debugger;
                    }
                }
                diathink.ActionManager.subUndo();
            }
        }

        this._exec(options);

        // todo: test if lastAction is where it should be
        // todo: test if undo/redo/undone parameters match up

    },
    validateOptions: function() {
        var o = this.options, v = this._validateOptions;
        if ((v.requireActive || o.undo || o.redo) && !o.activeID && (this.type !== 'RootAction')) {
            console.log("ERROR: Action "+this.type+" missing activeID");
            debugger;
        }
        if (v.requireReference && !o.referenceID) {
            console.log("ERROR: Action "+this.type+" missing referenceID");
            debugger;
        }
        if (!o.oldRoot || !o.newRoot) {
            console.log("ERROR: Action "+this.type+" missing oldRoot or newRoot");
            debugger;
        }
        if (o.oldRoot !== 'all') {
            if (!diathink.OutlineManager.outlines[o.oldRoot] && !diathink.OutlineManager.deleted[o.oldRoot]) {
                console.log('ERROR: Action '+this.type+' has invalid oldRoot');
                debugger;
            }
        }
        if ((o.newRoot !== 'all')&&(o.newRoot!=='new'))  {
            if (!diathink.OutlineManager.outlines[o.newRoot] && !diathink.OutlineManager.deleted[o.newRoot]) {
                console.log('ERROR: Action '+this.type+' has invalid newRoot');
                debugger;
            }
        }

        if (o.anim) {}

        if (o.activeID) {
            var activeModel = this.getModel(o.activeID);
            if (!activeModel) {
                console.log('ERROR: invalid activeModel for activeID='+ o.activeID);
                debugger;
            }
            if (v.requireOld && !o.undo) {
                if (o.oldRoot !== 'all') {
                    if (!activeModel.views || !activeModel.views[o.oldRoot]) {
                        console.log('ERROR: No old-view found for activeID='+ o.activeID);
                        debugger;
                    }
                }
            }
            if (v.requireNew && o.undo) {
                if (o.newRoot !== 'all') {
                    if (!activeModel.views || !activeModel.views[o.newRoot]) {
                        console.log('ERROR: No new-view found for activeID='+ o.activeID);
                        debugger;
                    }
                }
            }
        }
        if (o.referenceID) {
            var refModel = this.getModel(o.referenceID);
            if (!refModel) {
                console.log('ERROR: invalid refModel for activeID='+ o.activeID);
                debugger;
            }
            // reference is only used in newRoot, not oldRoot
            if (v.requireNew || v.requireNewReference) {
                if (!refModel.views || !refModel.views[o.newRoot]) {
                    console.log('ERROR: No new-view found for referenceID='+ o.referenceID);
                    debugger;
                }
            }
            if (v.requireNewReference && o.undo) {
                if (o.newRoot !== 'all') {
                    if (!activeModel.views || !activeModel.views[o.newRoot]) {
                        if (! $('#'+refModel.views[o.newRoot].id).hasClass('collapsed')) {
                            console.log('ERROR: Missing newRoot for activeID='+ o.activeID);
                            debugger;
                        }
                    }
                }
            }
        }
    },
    validateOldContext: function() {
        var context, o = this.options;
        if ((o.anim==='dock')||(o.anim==='indent')) {
            if ((this.newModelContext == null)||(this.oldModelContext == null)) {
                console.log("ERROR: Anim="+ o.anim+" but old or new context is null");
                debugger;
            }
        }
        if (o.undo) {
            context = this.newModelContext;
            if (this.type==='DeleteAction') {
                if (context !== null) {
                    console.log("ERROR: DeleteAction undo with newModelContext-not-null");
                    debugger;
                }
                return;
            }
        } else {
            context = this.oldModelContext;
            if (this.type==='InsertAfterAction') {
                if (context !== null) {
                    console.log("ERROR: Insert action with oldModelContext not-null");
                    debugger;
                }
                return;
            }
        }
        this.validateContext(context);
    },
    validateNewContext: function() {
        // todo: verify that placeholders and helpers are all cleaned up,
        var context, o = this.options;
        if (o.undo) {
            context = this.oldModelContext;
            if (this.type==='InsertAfterAction') {
                if (context !== null) {
                    console.log("ERROR: Insert action with oldModelContext not-null");
                    debugger;
                }
                return;
            }
        } else {
            context = this.newModelContext;
            if (this.type==='DeleteAction') {
                if (context !== null) {
                    console.log("ERROR: DeleteAction undo with newModelContext-not-null");
                    debugger;
                }
                return;
            }
        }
        this.validateContext(context);
    },
    validateContext: function(context) {
        var o = this.options;
        // otherwise context must exist
        if (o.activeID != null) {
            var model = this.getModel(o.activeID);
            if (model.get('parent')) {
                if (context.parent !== model.get('parent').cid) {
                    console.log('ERROR: context.parent does not match');
                    debugger;
                }
            } else {
                if (context.parent !== null) {
                    console.log('ERROR: context.parent is not null');
                    debugger;
                }
            }
            var collection = model.parentCollection();
            var rank = model.rank();
            if (rank===0) {
                if (context.prev !== null) {
                    console.log('ERROR: context.prev is not null though rank=0')
                    debugger;
                }
            } else {
                if (context.prev !== collection.at(rank-1).cid) {
                    console.log('ERROR: context.prev does not match');
                    debugger;
                }
            }
            if (rank === collection.length-1) {
                if (context.next !== null) {
                    console.log('ERROR: context.next is not null');
                    debugger;
                }
            } else {
                if (context.next !== collection.at(rank+1).cid) {
                    console.log('ERROR: context.next does not match');
                    debugger;
                }
            }
        }
        // todo: validate ViewContext, too.
        // todo: put text, collapsed, focus into oldModelContext and newModelContext.
        // (and oldRoot and newRoot?)
        if (o.text) {
            // todo:
        }
        if (o.collapsed !== undefined) {
            // todo:
        }
        if (o.focus) {
            // todo:
        }
    },
    _exec:function (options) {
        var o, i, that = this, r;
        _.extend(that.options, options);
        that.runinit();
        this.validateOptions();
        o = this.options;
        r = this.runtime;

        // before changing model, start preview animation
        this.addQueue('context', [], function() {
            that.timestamp = (new Date()).getTime();
            // the queues must wait until this action is ready to go.
            if (!o.undo && !o.redo) {
                that.getOldContext();
                that.getNewContext();
                that.getOldPanelContext();
                that.getNewPanelContext();
            }
            that.validateOldContext();
            that.runinit2();
        });

        this.addQueue('preDock', ['context'], function() {
            if (r.createDockElem) {
                that.preDock();
            }
        });

        if (r.performDock) {
            var newRoot = r.rNewRoot;
            console.log("Using newRoot = "+newRoot);
            this.addQueue('dockAnim', [['newLinePlace', newRoot], ['oldLinePlace', newRoot]], function () {
                that.dockAnim(newRoot);
            });
        } else {
            console.log('Skipping dockAnim because performDock=false, anim='+ o.anim);
            that.runtime.status.dockAnim = 2;
        }

        this.addQueue('panelPrep', ['context'], function() {
            that.panelPrep();
        });
        var outlines = diathink.OutlineManager.outlines;
        for (i in outlines) {
            (function(i) {
                that.addQueue(['oldLinePlace', i], ['preDock'], function() {
                    that.oldLinePlace(outlines[i]);
                });
                that.addQueue(['newLinePlace', i], ['context', ['oldLinePlace', i]], function() {
                    that.newLinePlace(outlines[i]);
                });
                that.addQueue(['linePlaceAnim', i], [['oldLinePlace', i], ['newLinePlace', i]], function() {
                    if (r.useLinePlaceholderAnim[i]) {
                        that.linePlaceAnim(outlines[i]);
                    }
                });
            })(i);
        }
        var animDeps = [];
        for (i in outlines) {
            animDeps.push(['linePlaceAnim', i]);
        }
        animDeps.push('dockAnim');
        this.addAsync('anim', animDeps, function() {
            if (r.performDock || _.contains(r.useLinePlaceholderAnim, true)) {
                var time = 200; // todo: this should vary.
                $.anim(function(f) {
                    that.animStep(f);
                }, time, function() {
                    that.runtime.status.anim = 2;
                    that.nextQueue();
                });
            } else {
                that.runtime.status.anim = 2;
                that.nextQueue();
            }
        });

        // todo: assumptions and issue-handling
        this.execModel();
        var focusDeps = [];
        for (i in outlines) {
           this.execView(outlines[i]);
           focusDeps.push(['linePlaceAnim', outlines[i].rootID]);
           focusDeps.push(['view', outlines[i].rootID]);
        }
        this.addQueue('focus', focusDeps, function() {
            if (that.options.focus) {
                that.focus();
            }
        });

        // todo: increase undo-dependencies
        this.addQueue('undobuttons', ['newModelAdd'],
            function() {diathink.ActionManager.refreshButtons();});

        this.addQueue('end',['focus', 'undobuttons', 'anim'], function() {
            var i, sub;
            that.validateNewContext();
            if (!that.options.undo && !that.options.redo) {
                for (i=that.subactions.length-1; i>=0; --i) {
                    sub = that.subactions[i];
                    sub.undo = false;
                    sub.redo = false;
                    sub.parentAction = that;
                    (function(o) {
                        diathink.ActionManager.subschedule(function() {
                            return o;
                        });
                    })(sub);
                }
            }
            var done = that.options.done;
            delete that.options['done'];
            done();
        });
        // diathink.validateMVC();
        this.nextQueue();
    },
    getModel: function(id) {
        return Backbone.Relational.store.find(diathink.OutlineNodeModel, id);
    },
    getLineView: function(id, rootid) {
        var model = this.getModel(id);
        if (model.views == null) {return null;}
        return model.views[rootid];
    },
    undo:function (options) {
        if (!options) {options = {};}
        options.undo = true;
        options.redo = false;
        this.undone = true;
        return this.exec(options);
        // diathink.validateMVC();
    },
    getPanelContext: function() {
        // options: oldPanel-id, or newPanel-id
        // old/newPanelContext: {next, prev, rootID, isSubpanel} or null

        // view-collapse
        // focus
    },
    // todo: should make node-model a doubly-linked list without relying on collection rank?
    getContextAt: function(id) {
        var model = this.getModel(id);
        var collection= model.parentCollection();
        var rank = model.rank();
        var context = {};
        if (rank===0) {
            context.prev = null;
        } else {
            context.prev = collection.at(rank-1).cid;
        }
        if (rank === collection.length-1) {
            context.next = null;
        } else {
            context.next = collection.at(rank+1).cid;
        }
        if (collection.at(rank).get('parent')) {
            context.parent = collection.at(rank).get('parent').cid;
        } else {
            context.parent = null;
        }
        return context;
    },
    // return the context for an item inserted after id
    getContextAfter: function(id) {
        var context;
        var reference = this.getModel(id);
        var collection = reference.parentCollection();
        var refrank = reference.rank();
        var parent = reference.get('parent');
        if (parent!=null) {
            context = {parent: parent.cid};
        } else {
            context = {parent: null};
        }
        context.prev = id;
        if (refrank===collection.length-1) {
            context.next = null;
        } else {
            context.next = collection.at(refrank+1).cid;
        }
        return context;
    },
    // return the context for an item inserted before id
    getContextBefore: function(id) {
        var context;
        var reference = this.getModel(id);
        var collection = reference.parentCollection();
        var refrank = reference.rank();
        var parent = reference.get('parent');
        if (parent!=null) {
            context = {parent: parent.cid};
        } else {
            context = {parent: null};
        }
        context.next = id;
        if (refrank===0) {
          context.prev = null;
        } else {
          context.prev = collection.at(refrank-1).cid;
        }
        return context;
    },
    // return the context for an item inserted inside id, at end of list
    getContextIn: function(id) {
        var reference = diathink.OutlineNodeModel.getById(id);
        var collection = reference.get('children');
        var context = {parent: id, next: null};
        if (collection.length===0) {
            context.prev = null;
        } else {
            context.prev = collection.at(collection.length-1).cid;
        }
        return context;
    },
    focus: function() {
        // by default, focus on activeID in newRoot
        var newRoot;
        if (this.options.undo) {
            newRoot = this.options.oldRoot;
        } else {
            newRoot = this.options.newRoot;
        }
        var id = this.getLineView(this.options.activeID, newRoot).header.name.text.id;
        $('#'+id).focus();
    },
    newModel: function() {
        var activeModel = new diathink.OutlineNodeModel({text: this.options.text, children: null});
        this.options.activeID = activeModel.cid;
        return activeModel;
    },
    getContextType: function(context, outline) {
        if (!context) {return 'none';}

        if (context.parent != null) {
            var parent = this.getLineView(context.parent, outline.rootID);
            if (parent != null) {
                if ($('#'+parent.id).hasClass('collapsed')) {
                    return 'parentIsCollapsedLine';
                } else {
                    return 'parentIsExpandedLine';
                }
            } else { // parent is outside view, is it one level or more?
                if (this.getModel(context.parent).get('children') ===
                    M.ViewManager.getViewById(outline.rootID).value) {
                    return 'parentIsRoot';
                } else { // context is out of scope
                    return 'parentInvisible';
                    // might be under collapsed item or outside it
                }
            }
        } else { // outline-root diathink.data
            if (M.ViewManager.getViewById(outline.rootID).value === diathink.data) {
                return 'parentIsRoot';
            } else {
                console.log('called getContext with no parent but not at root');
                debugger;
                return null;
            }
        }
    },
    contextParentVisible: function(context, outline) {
        if (!context) {return null;}

        if (context.parent != null) {
            var parent = this.getLineView(context.parent, outline.rootID);
            if (parent != null) {
                if ($('#'+parent.id).hasClass('collapsed')) {
                    parent.children.collapsed = true;
                    return parent.children;
                } else {
                    parent.children.collapsed = false;
                    return parent.children;
                }
            } else { // parent is outside view, is it one level or more?
                if (this.getModel(context.parent).get('children') ===
                    M.ViewManager.getViewById(outline.rootID).value) {
                    return M.ViewManager.getViewById(outline.rootID);
                } else { // context is out of scope
                    return null;
                }
            }
        } else { // outline-root diathink.data
            if (M.ViewManager.getViewById(outline.rootID).value === diathink.data) {
                return M.ViewManager.getViewById(outline.rootID);
            } else {
                return null;
            }
        }
    },
    restoreContext: function() {
        var activeModel, collection, rank, oldCollection;
        var that = this;
        this.addQueue('oldModelCollection', ['modelCreate'], function() {
            activeModel = that.getModel(that.options.activeID);
            oldCollection = activeModel.parentCollection();
        });
        this.addQueue('oldModelRemove', ['oldModelCollection'], function() {
            if (oldCollection != null) { // if it's in a collection
                // if parent-collection is empty, reset collapse
                if ((!that.options.undo)&&(!that.options.redo)&&
                    (oldCollection.models.length===1)&&(that.type!=='CollapseAction')) {
                    var parent = activeModel.get('parent');
                    // don't do this with a collapse action.
                    if (parent) {
                        that.subactions.push({
                            action: diathink.CollapseAction,
                            activeID: parent.cid,
                            collapsed: false,
                            oldRoot: 'all',
                            newRoot: 'all',
                            focus: false
                        });
                    }
                }
                oldCollection.remove(activeModel);
            }
        });
        this.addQueue('newModelRank', ['oldModelRemove'], function() {
            var newModelContext;
            if (that.options.undo) {
                newModelContext = that.oldModelContext;
            } else {
                newModelContext = that.newModelContext;
            }
            if (newModelContext != null) { // if there was a prior location to revert to
                activeModel.deleted = false;
                if (newModelContext.parent != null) {
                    collection = that.getModel(newModelContext.parent).get('children');
                } else {
                    collection = diathink.data;
                }
                if (newModelContext.prev === null) {
                    rank = 0;
                } else {
                    rank = that.getModel(newModelContext.prev).rank()+1;
                }
            } else {
                activeModel.deleted = true;
            }
        });
        this.addQueue('newModelAdd', ['newModelRank'], function() {
            var newModelContext;
            if (that.options.undo) {
                newModelContext = that.oldModelContext;
            } else {
                newModelContext = that.newModelContext;
            }
            if (newModelContext != null) {
                collection.add(activeModel, {at: rank});
            } else {
                activeModel.set({parent: null});
            }
        });
    },
    preview:function (outline) {
        var that = this;
            // todo: for visible non-dragged sources, add fade-out on mousedown in nestedSortable.
    },
    restoreViewContext: function(outline) {
        var that = this;
        this.addQueue(['view', outline.rootID], ['newModelAdd', 'anim'], function() {
            var r= that.runtime;
            var collection, rank, oldParent, oldParentView=null;
            var newModelContext, li, elem, oldspot, neighbor, neighborType, newParentView, createActiveLineView=false;

            newModelContext = r.rNewModelContext;
            // todo: this is a mess, with placeholders and undo.  Need to simplify.
            var activeLineView = that.getLineView(that.options.activeID, outline.rootID);
            // activeLineView should not be affected by rOldLinePlaceholder, except for DOM presence
            if (activeLineView!=null) { // original element was visible in this view
                oldspot = that._saveOldSpot(activeLineView);
                if (!oldspot) {
                    console.log("ERROR: Oldspot does not exist for action "+that.type+
                        "; undo="+that.options.undo+"; redo="+that.options.redo+
                        "; activeID="+that.options.activeID+"; view="+outline.rootID);
                    debugger;
                }
                neighbor = oldspot.obj;
                neighborType = oldspot.type;
            } else { // if old-view isn't visible, check if parent needs collapse-update
                // todo: can oldParent be replaced with a newModelContext-newParentView instead?
                if (that.options.undo) {
                    if (that.newModelContext) {
                        oldParent = that.getModel(that.newModelContext.parent);
                    }
                } else if (that.oldModelContext) {
                    oldParent = that.getModel(that.oldModelContext.parent);
                }
                if (oldParent && oldParent.views && oldParent.views[outline.rootID]) {
                    oldParentView = oldParent.views[outline.rootID];
                }
            }
            // oldParentView != null means it needs to be checked if it changed to a leaf

            // get parent listview; unless newModelContext is not in this view, then null
            newParentView = that.contextParentVisible(newModelContext, outline);
            if (newParentView && newParentView.collapsed) {
                // adding child to collapsed parent
                $('#'+newParentView.parentView.id).addClass('branch').removeClass('leaf');
                console.log('Nulling newModelContext because parent isnt visible');
                newParentView = null;
            }

            if (!newParentView) {newParentView=null; newModelContext = null;}


            if (newModelContext === null) {
                console.log('Have newModelContext = null for outline='+outline.rootID);
                if (activeLineView != null) {activeLineView.destroy(r.activeLineElem[outline.rootID]);}
                  // destroy() also detaches view-reference from model
            } else {
                if (activeLineView == null) { // create
                    activeLineView = that.newListItemView(newParentView);
                    // todo: add text in?
                    activeLineView.value.setView(activeLineView.rootID, activeLineView);
                    elem = $(activeLineView.render());
                    // enable recursive creation when moving out of collapsed view
                    if (! activeLineView.value.get('collapsed')) {
                        // console.log('Calling renderUpdate from execView');
                        activeLineView.children.renderUpdate(elem.find('#'+activeLineView.children.id)[0]);
                    }
                    createActiveLineView = true;
                } else { // move
                    if (r.activeLineElem[outline.rootID] && r.activeLineElem[outline.rootID].id === activeLineView.id) {
                        elem = $(r.activeLineElem[outline.rootID]);
                        r.activeLineElem[outline.rootID] = undefined;
                    } else {
                        elem = $('#'+activeLineView.id).detach();
                    }
                    // restore height if it was lost
                    elem.css('height','').removeClass('drag-hidden');
                    activeLineView.parentView = newParentView;
                }

                // put elem into newModelContext
                // this cleans up destination-placeaholder; what about source-placeholder?
                //   it could vanish automatically?
                if (r.rNewLinePlaceholder[outline.rootID]) {
                    console.log('Replacing newlinePlaceholder for '+outline.rootID);
                    r.rNewLinePlaceholder[outline.rootID].parentNode.
                        replaceChild(elem[0], r.rNewLinePlaceholder[outline.rootID]);
                } else {
                    if (newModelContext.prev == null) {
                        var parentElem = $('#'+newParentView.id);
                        parentElem.prepend(elem);
                    } else {
                        var prevElem = $('#'+that.getLineView(newModelContext.prev, outline.rootID).id);
                        prevElem.after(elem);
                    }
                }
                // do this after rNewLinePlaceholder has been replaced, so correct element is visible.
                if (that.options.dockElem) {
                    $(document.body).removeClass('transition-mode');
                    that.options.dockElem.parentNode.removeChild(that.options.dockElem);
                    that.options.dockElem = undefined;
                }

                if (createActiveLineView) { // todo: add classes in detached-mode instead of here?
                    activeLineView.theme(); // add classes and if there is content, fixHeight
                    if (activeLineView.value.get('collapsed')) {
                        $('#'+activeLineView.id).addClass('collapsed').addClass('branch').removeClass('leaf');
                    } else {
                        if (activeLineView.value.get('children').length>0) {
                            $('#'+activeLineView.id).addClass('expanded').addClass('branch').removeClass('leaf');
                        } else {
                            $('#'+activeLineView.id).addClass('expanded').addClass('leaf').removeClass('branch');
                        }
                    }
                }

                // fix activeLineView's top/bottom corners
                activeLineView.themeFirst(); // could check if this two are strictly necessary
                activeLineView.themeLast();

                // fixup new neighborhood
                if (newModelContext.next && (newModelContext.prev == null)) {
                    $('#'+activeLineView.id).next().removeClass('ui-first-child');
                }
                if (newModelContext.prev && (newModelContext.next == null)) {
                    $('#'+activeLineView.id).prev().removeClass('ui-last-child');
                }
                if ((newModelContext.prev==null)&&(newModelContext.next==null)) {
                    // todo: could parentView be outline-root?
                    // adding child to expanded parent
                    var elem = $('#'+activeLineView.parentView.parentView.id);
                    elem.addClass('branch').removeClass('leaf');
                }
            }
            // remove source-placeholder
            if (r.rOldLinePlaceholder[outline.rootID]) {
                console.log('Removing oldlinePlaceholder for '+outline.rootID);
                r.rOldLinePlaceholder[outline.rootID].parentNode.removeChild(that.runtime.rOldLinePlaceholder[outline.rootID]);
                r.rOldLinePlaceholder[outline.rootID] = undefined;
                r.activeLineElem[outline.rootID] = undefined;
                r.activeLineHeight[outline.rootID] = undefined;
            }

            if (neighbor) { // fixup old location (expanded)
                var neighborElem = $('#'+neighbor.id);
                if (neighborType==='next') {
                    var prev = neighborElem.prev('li');
                    if (prev.length===0) {
                        neighborElem.addClass('ui-first-child');
                    }
                } else if (neighborType==='prev') {
                    var next = neighborElem.next('li');
                    if (next.length===0) {
                        neighborElem.addClass('ui-last-child');
                    }
                } else if (neighborType==='parent') {
                    // removing last child from expanded parent
                    var elem = $('#'+neighbor.id);
                    elem.addClass('leaf').removeClass('branch').
                        addClass('expanded').removeClass('collapsed');
                } else if (neighborType==='root') {
                    // todo: add a placeholder for empty panel
                }
            } else if (oldParentView) { // (collapsed)
                if (oldParent.get('children').models.length===0) {
                    // removing last child from collapsed parent
                    $('#'+oldParentView.id).removeClass('branch').addClass('leaf');
                }
            }

            // check if this view breadcrumbs were modified, if activeID is ancestor of outline.
            if (!activeLineView) {
                var model = outline.rootModel;
                while (model && (model.cid !== that.options.activeID)) {
                    model = model.get('parent');
                }
                if (model) {
                    outline.panelView.breadcrumbs.onDesign();
                    outline.panelView.breadcrumbs.renderUpdate();
                    outline.panelView.breadcrumbs.theme();
                }
            }
        });
    },
    // utility functions
    newListItemView:function (parentView) { // (id only if known)
        // todo: should more of this be in cloneObject?
        var templateView = parentView.listItemTemplateView;
        M.assert(templateView != null);
        templateView.events = templateView.events ? templateView.events : parentView.events;

        var li = templateView.design({cssClass: 'leaf'}); // todo -- merge with nestedsortable
        if (this.options.activeID) {
            li.modelId = this.options.activeID;
            var item = diathink.OutlineNodeModel.getById(this.options.activeID);
        } else {
            // if view is rendered without a model
            // {text: this.options.lineText}; // from list
        }
        // todo: listview() classes should be on li before it is cloned
        li = parentView.cloneObject(li, item);
        li.value = item; // enables getting the value/contentBinding of a list item in a template view.
        li.parentView = parentView;
        li.setRootID(parentView.rootID);
        li.children.value = li.value.attributes.children;

        return li;
    },

    _saveOldSpot: function(view) {
        var type = 'next', r = this.runtime;
        var elem;
        if (r.activeLineElem[view.rootID] && (r.activeLineElem[view.rootID].id === view.id)) {
            elem = $(r.rOldLinePlaceholder[view.rootID]);
        } else {
            elem = $('#'+view.id);
        }
        var oldspot = elem.next('li');
        if (oldspot.length===0) {
            oldspot = elem.prev('li');
            type = 'prev';
        }
        if (oldspot.length>0) {
            return {type: type, obj: M.ViewManager.getViewById(oldspot.attr('id'))};
        } else {
            if (view.parentView.parentView && view.parentView.parentView.type==='M.ListItemView') {
                return {type: 'parent', obj: view.parentView.parentView};
            } else {
                return {type: 'root', obj: M.ViewManager.getViewById(view.rootID)}
                // console.log("_saveOldSpot returning null for view "+view.id);
                // return null;
            }
        }
    },
    getOldContext: function() {
        if (! this.options.activeID) {
            this.oldModelContext = null;
        } else {
            this.oldModelContext = this.getContextAt(this.options.activeID);
        }
    },
    getOldPanelContext: function() {},
    getNewPanelContext: function() {},
    execModel: function () {
        var that = this, newModelContext;
        if (this.undo) {
            newModelContext = this.oldModelContext;
        } else {
            newModelContext = this.newModelContext;
        }
        this.addQueue('modelCreate', ['context'], function() {
            if (!that.options.activeID) {
                var activeModel = new diathink.OutlineNodeModel({text: that.options.text, children: null});
                that.options.activeID = activeModel.cid;
            }
        });
        this.restoreContext();
    },
    execView:function (outline) {
        var that = this;
        this.restoreViewContext(outline);
    },
    // SHOW methods - various visualization actions,
    //  often overriden by each action-type
    _showDisplacement:function () {
        // animate appearance/disappearance of a line
    },
    _showFinalization:function () {
        // animate indicating completion of an action (e.g. double-blink)
    },
    _showDifference:function () {
        // like arrows showing movement, might include user/time display
    },
    _showDrag:function () {
        // or text slide or cross-out
    },
    _showHiddenChange:function () {
        // for edits on invisible or minimized areas
    },
    _showOffscreen:function () {
        // show annotation for changes above/below the scroll-area
    },
    _focusScroll:function () {
        // scroll the view to show the new location
    },
    _focusCursor:function () {

    },
    _showKeystroke:function () {
        // for tutorials
    }
},{ // static functions
    createAndExec:function (options) { // create a new action object
        var action = new this(options);
        action.exec(options);
        return action;
    },
    checkTextChange:function(id) {
        // console.log("Checking text change for id="+id);
        var value = $('#'+id).val();
        console.log('checkTextChange: id = '+id);
        if (!M.ViewManager.getViewById(id)) {
            return false; // view was deleted since being edited
        }
        var view = M.ViewManager.getViewById(id).parentView.parentView.parentView;
        var model = view.value;
        if (model.get('text') !== value) {
            //console.log("TextAction for id="+id+"; model="+
              //  model.cid+" with value="+$('#'+id).val());
                return {
                    action: diathink.TextAction,
                    activeID: model.cid,
                    text: value,
                    oldRoot: view.rootID,
                    newRoot: view.rootID,
                    focus: false
                }
        }
        return false;
    }
});

_.extend(diathink.Action.prototype, diathink.animHelpers);


// commuting operations don't have to be undone/redone - optimization

diathink.InsertAfterAction = diathink.Action.extend({
    type:"InsertAfterAction",
    options: {activeID: null, referenceID: null, text: ""},
    _validateOptions: {
        requireActive: false,
        requireReference: true,
        requireOld: false,
        requireNew: true
    },
    getNewContext: function() {
        this.newModelContext = this.getContextAfter(this.options.referenceID);
    }
});

diathink.MoveAfterAction = diathink.Action.extend({
    type:"MoveAfterAction",
    _validateOptions: {
        requireActive: true,
        requireReference: true,
        requireOld: true,
        requireNew: true
    },
    options: {activeID: null, referenceID: null, transition: false},
    getNewContext: function() {
        this.newModelContext = this.getContextAfter(this.options.referenceID);
    }
});

diathink.MoveBeforeAction = diathink.Action.extend({
    type:"MoveBeforeAction",
    _validateOptions: {
        requireActive: true,
        requireReference: true,
        requireOld: true,
        requireNew: true
    },
    options: {activeID: null, referenceID: null, transition: false},
    getNewContext: function() {
        this.newModelContext = this.getContextBefore(this.options.referenceID);
    }
});

diathink.MoveIntoAction = diathink.Action.extend({
    type:"MoveIntoAction",
    _validateOptions: {
        requireActive: true,
        requireReference: true,
        requireOld: true,
        requireNew: false,
        requireNewReference: true
    },
    options: {activeID: null, referenceID: null, transition: false},
    getNewContext: function() {
        this.newModelContext = this.getContextIn(this.options.referenceID);
    }
});

// todo: merge outdent with moveafter action?
diathink.OutdentAction = diathink.Action.extend({
    type:"OutdentAction",
    _validateOptions: {
        requireActive: true,
        requireReference: true,
        requireOld: true,
        requireNew: true
    },
    options: {activeID: null, referenceID: null, transition: false},
    getNewContext: function() {
        this.newModelContext = this.getContextAfter(this.options.referenceID);
    }
});

diathink.ActionCollection = Backbone.Collection.extend({
    model: diathink.Action
});

diathink.DeleteAction = diathink.Action.extend({
    type:"DeleteAction",
    _validateOptions: {
        requireActive: true,
        requireReference: false,
        requireOld: true,
        requireNew: false
    },
    options: {activeID: null, transition: false},
    focus: function() {
        var newRoot, li, model, collection, rank, cursorstart=false, cursor;
        if (this.options.undo) {
            li = this.getLineView(this.options.activeID, this.options.oldRoot.rootID);
            var elem = $('#'+li.header.name.text.id);
            elem.setCursor(0);
            elem.focus();
            return;
        }
        newRoot = this.options.newRoot;
        // this won't work because model has been deleted.
        if (this.oldModelContext.prev == null) {
            // check if parent is visible
            li = null;
            if (this.oldModelContext.parent != null) {
                li = this.getLineView(this.oldModelContext.parent, newRoot);
            }
            if (!li) { // try following sibling
                if (this.oldModelContext.next == null) {
                    return; // no other elements in view
                }
                li = this.getLineView(this.oldModelContext.next, newRoot);
                cursorstart = true;
            }
        } else { // goto prior sibling.
            li = this.getLineView(this.oldModelContext.prev, newRoot);
            if (!li) {
                console.log('ERROR: Missing prior view for focus');
                debugger;
            }
        }
        var elem = $('#'+li.header.name.text.id);
        if (cursorstart) {
            elem.setCursor(0);
            elem.focus();
        } else {
            cursor = elem.val().length;
            elem.setCursor(cursor);
            elem.focus();
        }
    },
    getNewContext: function() {
        this.newModelContext = null;
    }
});

diathink.TextAction= diathink.Action.extend({
    type:"TextAction",
    options: {activeID: null, text: null, transition: false},
    _validateOptions: {
        requireActive: true,
        requireReference: false,
        requireOld: true,
        requireNew: true
    },
    useOldLinePlaceholder: false,
    useNewLinePlaceholder: false,
    getNewContext: function() {
        this.newModelContext = this.oldModelContext;
    },
    preview: function() {},
    execModel: function () {
        var that = this;
        that.addQueue('newModelAdd', ['context'], function() {
            var text;
            if (that.options.undo) {
                text = that.oldText;
            } else {
                text = that.options.text;
            }
            var activeModel = that.getModel(that.options.activeID);
            if ((!that.options.undo) && (!that.options.redo)) {
                that.oldText = activeModel.get('text');
            }
            activeModel.set('text', text);
        });
    },
    execView:function (outline) {
        var that = this;
        this.addQueue(['view', outline.rootID], ['newModelAdd'], function() {
            var text;
            if (that.options.undo) {
                text = that.oldText;
            } else {
                text = that.options.text;
            }
            var activeLineView = that.getLineView(that.options.activeID, outline.rootID);
            if (activeLineView != null) {
                activeLineView.header.name.text.value = text;
                // console.log("Updating view "+activeLineView.header.name.text.id+" to value "+this.options.text);
                $('#'+activeLineView.header.name.text.id).val(text).text(text);
                activeLineView.header.name.text.themeUpdate();
            }
            // satisfy additional dependencies that are never used in this actiontype
            // that.runtime.status.linePlaceAnim[outline.rootID] = 2;
        });
    }
});


diathink.CollapseAction= diathink.Action.extend({
    type:"CollapseAction",
    useOldLinePlaceholder: false,
    useNewLinePlaceholder: false,
    options: {activeID: null, collapsed: false},
    _validateOptions: {
        requireActive: true,
        requireReference: false,
        requireOld: true,
        requireNew: true
    },
    getNewContext: function() {
        this.newModelContext = this.oldModelContext;
    },
    preview: function() {},
    execModel: function () {
        var that = this;
        that.addQueue('newModelAdd', ['context'], function() {
            var collapsed;
            if (that.options.undo) {
                collapsed = that.oldCollapsed;
            } else {
                collapsed = that.options.collapsed;
            }
            var activeModel= that.getModel(that.options.activeID);
            if ((!that.options.undo) && (!that.options.redo)) {
                that.oldCollapsed = activeModel.get('collapsed');
                if (!that.oldCollapsed) {that.oldCollapsed = false;}
            }
            // console.log("Setting model "+that.options.activeID+" collapsed = "+collapsed);
            activeModel.set('collapsed', collapsed);
        });
    },
    execView:function (outline) {
        var that = this;
        this.addQueue(['view', outline.rootID], ['newModelAdd'], function() {
            // Each node starts with collapsed=null.
            // On expand/collapse, all visible nodes go to collapsed=true/false.
            // On undo, all nodes revert to prior-state of null/true/false.
            // On changeroot, any non-virgin contained-nodes remember their state.
            // On undoing changeroot, outline remembers former state for all nodes modified before changeroot.
            // Collapsed node similarly remember based on current outline-state.
            // Each expand/collapse migrates all visible matching-items to use
            //   their current view-specific settings.
            // If they previously used model settings, it's because they
            //   were never visible during a matching collapse.
            // Undoing the first expand/collapse should restore collapsed=null
            //   to the node, along with reverting the model-collapsed state.
            // Undoing future changes should record the change in view-status.
            //  between open/closed/null

            var activeModel = that.getModel(that.options.activeID);
            var activeLineView = that.getLineView(that.options.activeID, outline.rootID);
            if (!activeLineView) {
                console.log("Action collapse="+collapsed+" has no activeLineView, with activeID="+
                    that.options.activeID+"; oldRoot="+outline.rootID+
                    "; undo="+that.options.undo);
                // Action collapse=false has no activeLineView, with activeID=c14; oldRoot=m_16; undo=false
                // that.runtime.status.linePlaceAnim[outline.rootID] = 2;
                return;
            }
            var collapsed;
            if (that.options.undo) {
                // oldCollapsed depends on view, can be true, false, or null.
                collapsed = that.oldViewCollapsed[outline.rootID];
                // console.log("Undo retrieved collapsed = "+collapsed+" for view="+outline.rootID);
            } else {
                if (!that.options.redo) {
                  that.oldViewCollapsed[outline.rootID] = outline.getData(that.options.activeID);
                }
                if ((that.options.oldRoot === outline.rootID)||
                    (that.options.oldRoot==='all')) {
                    collapsed = that.options.collapsed;
                } else {
                    collapsed = $('#'+activeLineView.id).hasClass('collapsed');
                }
            }
            outline.setData(that.options.activeID, collapsed);

            if (collapsed == null) {
                if (!that.options.undo) {
                    console.log('ERROR collapsed is null not on undo'); debugger;
                }
                collapsed = activeModel.get('collapsed');
            }
            if (collapsed) {
                if (! $('#'+activeLineView.id).hasClass('collapsed')) {
                    $('#'+activeLineView.id).removeClass('expanded').addClass('collapsed');
                    activeLineView.children.removeAllItems();
                }
            } else {
                if ($('#'+activeLineView.id).hasClass('collapsed')) {
                    $('#'+activeLineView.id).addClass('expanded').removeClass('collapsed');
                    activeLineView.children.renderUpdate();
                }
            }
            // satisfy additional dependencies that are never used in this actiontype
            // that.runtime.status.linePlaceAnim[outline.rootID] = 2;
        });
    }
});


diathink.RootAction= diathink.Action.extend({
    type:"RootAction",
    newType: 'panel',
    useOldLinePlaceholder: false,
    useNewLinePlaceholder: false,
    options: {activeID: null, collapsed: false},
    _validateOptions: {
        requireActive: false,
        requireReference: false,
        requireOld: false,
        requireNew: false
    },
    getNewContext: function() {
        this.newModelContext = this.oldModelContext;
    },
    getOldPanelContext: function() { // define oldPanelContext and newPanelContext
        var context = null;
        if (this.options.activePanel) {
            var panelid = this.options.activePanel;
            context = {};
            context.next = diathink.PanelManager.nextpanel[panelid];
            context.prev = diathink.PanelManager.prevpanel[panelid];
            context.root = M.ViewManager.getViewById(panelid).outline.alist.id;
        }
        this.oldPanelContext = context;
    },
    getNewPanelContext: function() {
        var context = null;
        if (this.options.activePanel) {
            var panelid = this.options.activePanel;
            context = {};
            context.next = diathink.PanelManager.nextpanel[panelid];
            context.prev = diathink.PanelManager.prevpanel[panelid];
            context.root = this.options.activeID;
        }
        this.newPanelContext = context;
    },
    preview: function() {
        // custom docking function for change-root

    },
    execModel: function () {
        var that = this;
        that.addQueue('newModelAdd', ['context'], function() {
            if ((!that.options.undo) && (!that.options.redo)) {
                var c = diathink.ActionManager;
                if (c.actions.at(c.lastAction) !== that) {
                    console.log('ERROR: lastAction is not this');
                    debugger;
                }
                var prevAction = c.actions.at(c.lastAction-1);
                if ((prevAction.type==='CollapseAction')&&
                    (prevAction.options.activeID === that.options.activeID)) {

                    var activeModel= that.getModel(that.options.activeID);
                    activeModel.set('collapsed', prevAction.oldCollapsed);
                    for (var o in diathink.OutlineManager.outlines) {
                        diathink.OutlineManager.outlines[o].setData(
                            that.options.activeID,
                            prevAction.oldViewCollapsed[o]);
                    }
                    prevAction.undone = true;
                    prevAction.lost = true;
                }
            }
            // todo: save current perspective into model?
        });
    },
    execView:function (outline) {
        var that = this;
        this.addQueue(['view', outline.rootID], ['newModelAdd'], function() {
            var model=null;
            if (that.options.undo) {
                if (outline.rootID === that.options.newRoot) {
                    model = that.oldRootModel;
                    var view = M.ViewManager.getViewById(that.options.newRoot).parentView
                        .parentView.changeRoot(model, that.options.oldRoot);
                    if (view !== that.options.oldRoot) {
                        console.log('Invalid return from changeRoot');
                        debugger;
                    }
                }
            } else {
                if (outline.rootID === that.options.oldRoot) {
                    model = that.getModel(that.options.activeID);
                    if (that.options.redo) {
                        var view = M.ViewManager.getViewById(that.options.oldRoot).parentView
                            .parentView.changeRoot(model, that.options.newRoot);
                        if (view !== that.options.newRoot) {
                            console.log('Invalid return from changeRoot');
                            debugger;
                        }
                    } else {
                        that.oldRootModel = M.ViewManager.getViewById(that.options.oldRoot).rootModel;
                        that.options.newRoot = M.ViewManager.getViewById(that.options.oldRoot).parentView
                            .parentView.changeRoot(model);
                    }
                }
            }
            // that.runtime.status.linePlaceAnim[outline.rootID] = 2;
        });
    }
});

