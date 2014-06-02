///<reference path="../views/View.ts"/>
///<reference path="../validate.ts"/>
///<reference path="ActionManager.ts"/>
///<reference path="AnimatedAction.ts"/>
///<reference path="CollapseAction.ts"/>
///<reference path="DeleteAction.ts"/>
///<reference path="DockAnimAction.ts"/>
///<reference path="InsertAfterAction.ts"/>
///<reference path="InsertIntoAction.ts"/>
///<reference path="MoveAfterAction.ts"/>
///<reference path="MoveBeforeAction.ts"/>
///<reference path="MoveIntoAction.ts"/>
///<reference path="OutdentAction.ts"/>
///<reference path="OutlineAction.ts"/>
///<reference path="PanelAnimAction.ts"/>
///<reference path="PanelCreateAction.ts"/>
///<reference path="PanelRootAction.ts"/>
///<reference path="PlaceholderAnimAction.ts"/>
///<reference path="SlidePanelsAction.ts"/>
///<reference path="TextAction.ts"/>
///<reference path="AddLinkAction.ts"/>
///<reference path="../NodeDropSource.ts"/>
///<reference path="../NodeDropTarget.ts"/>
///<reference path="../PanelDropSource.ts"/>
///<reference path="../PanelDropTarget.ts"/>
// todo: get the information we need early on from action,
//  to know what the oldType, newType and contexts are.
// types: line, panel, link, breadcrumb, dockedlink
// for each type, must have location, box-dims, text-size,
// todo: Put text and collapsed into oldModelContext/newModelContext
// todo: Put old-focus & view-collapsed into ?
// todo: Put panel into new/oldPanelContext
// Flag for scroll
// todo: action stores oldFocus and newFocus ? (maybe not)
// todo: handle focusID in context, and validate it.
// todo: undo-scroll (maybe focus)
interface ActionOptions {
    undo?:boolean;
    redo?:boolean;
    oldRoot?:string;
    newRoot?:string;
    focus?;
    done?:AnonFunction;
    activeID?:string;
    referenceID?:string;
    anim?:string;
    dockView?:View;
    text?:string;
    direction?: string;
    transition?:boolean;
    prevPanel?:string;
    isSubpanel?:boolean;
    collapsed?:boolean;
    cursor?:number[];
    speed?:number;
    delete?:boolean;
    panelID?:string;
    name?:string;
    origID?:string;
    newModelContext?:ModelContext;
    remoteID?:string;
}
interface SubAction extends ActionOptions {
    actionType: any;
    action?: Action;
}
interface AnonFunction {():SubAction;}
interface ViewNumbers {
    [i:string]:number;
}
interface AnimOptions {
    view?:{[i:string]:AnimViewOptions};
    dock?:boolean;
    startX?:number;
    startY?:number;
    endX?: number;
    endY?: number;
    startWidth?: number;
}
interface AnimViewOptions {
    rootID?: string;
    startOldHeight?: number;
    endNewHeight?: number;
    sameHeight?: boolean;
}
interface ModelContext {
    next?:string;
    prev?:string;
    parent?:string;
}
interface RuntimeOptions {
    nextQueueScheduled?;
    queue?;
    animOptions?:AnimOptions;
    firsttime?:boolean;
    rNewType?;
    rOldType?;
    status?: {
        context?:number;
        log?:number;
        undobuttons?:number;
        oldModelCollection?:number;
        oldModelRemove?:number;
        modelCreate?:number;
        newModelRank?:number;
        newModelAdd?:number;
        focus?:number;
        end?:number;
        view?:ViewNumbers;
        uniqueView:number;
        createDockElem?:number;
        dockAnim?:number;
        panelPrep?:number;
        anim?:number;
        anim2?:number;
        animCleanup?:number;
        oldLinePlace?:ViewNumbers;
        newLinePlace?:ViewNumbers;
    };
    rNewRoot?;
    rOldRoot?;
    oldLineContext?:{[i:string]:{ type: string; obj: any; }};
    rOldModelContext?:ModelContext;
    rNewModelContext?:ModelContext;
    cursorstart?:boolean; // whether cursor should be set to start
}

interface ActionJSON {
    cid?:string;
    sessionID?:string;
    broadcastID?:number;
    type?:string;
    timestamp?:number;
    historyRank?:number;
    undone?:boolean;
    lost?:boolean;
    oldModelContext?:ModelContext;
    newModelContext?:ModelContext;
    numSubactions?:number;
    parentActionID?:string;
    options?:{
        undo?:boolean;
        redo?:boolean;
        activeID?:string;
        referenceID?:string;
        anim?:string;
        text?:string;
        transition?:string;
        speed?:number;
        delete?:boolean;
        name?:string;
        origID?:string; // for remote actions
        done?:{()};
        focus?:boolean;
        newModelContext?:ModelContext;
        remoteID?:string;
    }
}
class Action extends PModel {
    type:string = "Action";
    historyRank:number;
    options:ActionOptions;
    indentSpeed = 80;
    createSpeed = 80;
    deleteSpeed = 80;
    undone:boolean;
    parentAction:Action;
    subactions:SubAction[];
    placeholderSpeed = 160;
    timestamp:number;
    lost:boolean;
    runtime:RuntimeOptions;
    dockSpeed = 160;
    oldType:string = 'line'; // only used for docking?
    newType:string = 'line';
    useOldLinePlaceholder = true;
    useNewLinePlaceholder = true;
    focusFirst:boolean = false;
    static remoteActionTypes = {};
    constructor(options) {
        super();
        this.options = _.extend({}, this.options, options);
        this.init();
        return this;
    }

    init() {
        _.extend(this, {
            instance: 0,
            user: 0,
            timestamp: null,
            undone: false,
            lost: false,
            oldModelContext: null,
            newModelContext: null,
            oldPanelContext: null,
            newPanelContext: null,
            subactions: [],
            oldViewCollapsed: {},
            // options: {},
            runtime: null // variables that initialize each time _exec is called
        });
        this.runinit();
    }

    runinit() {
        this.runtime = {
            nextQueueScheduled: null,
            queue: {},
            animOptions: {},
            status: {
                log: 0,
                undobuttons: 0,
                view: {},
                uniqueView: 0,
                end: 0
            }
        };
        var o = this.options, r = this.runtime;
        if (o.undo || o.redo) {
            r.firsttime = false;
        } else {
            r.firsttime = false;
        }
        if (o.undo) {
            r.rOldType = this.newType;
            r.rNewType = this.oldType;
        } else {
            r.rOldType = this.oldType;
            r.rNewType = this.newType;
        }
    }

    addAsync(self, deps, f) {
        this.addQueue(self, deps, f, true);
    }

    addQueue(self, deps, f, async?) {
        if (!async) {async = false;}
        if ((self instanceof Array) && (self.length === 1)) {self = self[0];}
        if (typeof self === 'object') {
            if (this.runtime.queue[self[0] + ':' + self[1]] !== undefined) {
                alert("Queued twice: " + self[0] + ':' + self[1]);
                return;
            }
            this.runtime.queue[self[0] + ':' + self[1]] = [self, deps, f, async];
        } else {
            if (this.runtime.queue[self] !== undefined) {
                alert("Queued twice: " + self);
                return;
            }
            this.runtime.queue[self] = [self, deps, f, async];
        }
    }

    nextQueue() {
        // console.log("Running nextQueue");
        if (this.runtime.nextQueueScheduled) {
            clearTimeout(this.runtime.nextQueueScheduled);
        }
        // loop over the queue and start all items which can be started
        // loop over the queue and start all items which can be started
        var i, j, deps, depj, self, self0, f, ready, n = 0, queue = this.runtime.queue;
        var that = this;
        for (i in queue) {
            if (this.runtime.queue[i] === undefined) {continue;}
            // never start the same job twice
            self = queue[i][0];
            if ((self instanceof Array) && (self.length === 1)) {self = self[0];}
            if (typeof self === 'object') { // array
                self0 = this.runtime.status[self[0]];
                // console.log("Considering queue item "+i+" type="+self[0]+":"+self[1]);
                if (self0 && self0[self[1]] > 0) {
                    // console.log("Aborting queue item "+i+" because already begun");
                    continue;
                }
            } else {
                // console.log("Considering queue item "+i+" type="+self);
                if (this.runtime.status[self] > 0) {
                    // console.log("Aborting queue item "+i+" because already begun");
                    continue;
                }
            }
            deps = queue[i][1];
            f = queue[i][2];
            ready = 1;
            // console.log("Checking dependencies for "+i+": "+deps.join(','));
            for (j = 0; j < deps.length; ++j) {
                if ((deps[j] instanceof Array) && (deps[j].length === 1)) {deps[j] = deps[j][0];}
                if (typeof deps[j] === 'object') { // a dependency-array
                    depj = this.runtime.status[deps[j][0]];
                    if (!(depj && (depj[deps[j][1]] === 2))) {
                        // console.log("Postponing "+i+" because haven't met: "+deps[j][0]+":"+deps[j][1]);
                        ready = 0;
                        break;
                    }
                } else { // a simple/string dependency
                    if (!(this.runtime.status[deps[j]] === 2)) {
                        // console.log("Postponing "+i+" because haven't met: "+deps[j]);
                        ready = 0;
                        break;
                    }
                }
            }
            if (ready) {
                ++n;
                // remove self from queue
                this.execQueue(i);
            }
        }
        if (n > 0) {
            this.runtime.nextQueueScheduled = setTimeout(function() {
                that.nextQueue();
            }, 0);
        }
    }

    execQueue(i) {
        var q, that:Action = this;
        q = this.runtime.queue[i];
        // console.log("Scheduling "+i);
        if ((q[0] instanceof Array) && (q[0].length === 1)) {q[0] = q[0][0];}
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
            if (q[0] === 'end') {
                // console.log("Just finished processing end, about to set status=2");
            }
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
    }

    exec(options) {
        var i, rank, nsub;
        if (!options) {options = {};}
        // console.log("Starting action "+this.type+" with undo="+options.undo+"; redo="+options.redo);
        if (options.redo) {options.undo = false;}
        if (!options.undo) {this.undone = false;}
        if (options.parentAction) {
            this.parentAction = options.parentAction;
        }
        // if this is undo/redo op, and there are subactions, queue those immediately.
        if (options.redo && (this.subactions.length > 0) && (!this.options.origID)) {
            nsub = this.subactions.length;
            for (i = 0; i < nsub; ++i) {
                /*
                rank = ActionManager.nextRedo();
                if (ActionManager.actions.at(rank) !== this.subactions[i].action) {
                    console.log("ERROR: Redoing wrong subaction");
                    debugger;
                }
                */
                ActionManager.subRedo();
            }
        } else if (options.undo && (this.parentAction != null) && (!this.options.origID)) {
            nsub = this.parentAction.subactions.length;
            if (this === this.parentAction.subactions[nsub - 1].action) {
                console.log("Last subaction in chain is calling the rest for undo");
                for (i = nsub-2; i >= -1; --i) {
                    /*
                    rank = ActionManager.nextUndo();
                    if (i === -1) {
                        if (ActionManager.actions.at(rank) !== this.parentAction) {
                            console.log("ERROR: Undoing something else when should be parentAction");
                            debugger;
                        }
                    } else {
                        if (ActionManager.actions.at(rank) !== this.parentAction.subactions[i].action) {
                            console.log("ERROR: Undoing wrong subaction");
                            debugger;
                        }
                    }
                    */
                    ActionManager.subUndo(); // schedule them in reverse order to when we do them
                }
            }
        }
        this._exec(options);
        // todo: test if lastAction is where it should be
        // todo: test if undo/redo/undone parameters match up
    }

    _exec(options) {
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
                that.contextStep();
            }
            that.validateOldContext();
            that.runinit2();
        });
        this.animSetup();
        // todo: assumptions and issue-handling
        var outlines = OutlineRootView.outlinesById;
        this.addQueue('focusFirst', [
            ['context']
        ], function() {
            if (that.options.focus && that.focusFirst) {
                that.focus();
            }
        });
        this.execModel();
        this.execUniqueView();
        var focusDeps = [
            ['uniqueView']
        ];
        for (i in outlines) {
            this.execView(outlines[i]);
            focusDeps.push(['view', outlines[i].nodeRootView.id]);
        }
        this.animCleanup();
        this.addQueue('focus', focusDeps, function() {
            if (that.options.focus && !that.focusFirst) {
                that.focus();
            }
        });
        // todo: increase undo-dependencies
        this.addQueue('undobuttons', ['newModelAdd'],
            function() {ActionManager.refreshButtons();});
        this.addQueue('end', ['focus', 'undobuttons', 'anim', 'animCleanup'], function() {
            var i, sub;
            that.validateNewContext();
            that.broadcast();
            if (!that.options.undo && !that.options.redo && (!that.options.origID)) {
                for (i = that.subactions.length - 1; i >= 0; --i) {
                    sub = that.subactions[i];
                    sub.undo = false;
                    sub.redo = false;
                    sub.parentAction = that;
                    (function(o) {
                        // console.log("Subscheduling an action immediately after action");
                        ActionManager.subschedule(function() {
                            return o;
                        });
                    })(sub);
                }
            }
            if (_.size(ActionManager.queue) === 1) {
                if (!(this instanceof TextAction)) {
                    // console.log("Subscheduling text-check after last non-text action");
                    ActionManager.subschedule(
                        function() {
                            if (!View.focusedView) {
                                return null;
                            }
                            return Action.checkTextChange(View.focusedView.header.name.text.id);
                        });
                }
            } else {
                // console.log("Not validating after subaction");
            }
            var done = that.options.done;
            delete that.options['done'];
            // console.log("Calling done from action-end")
            done();
        });
        this.nextQueue();
    }

    getModel(id):OutlineNodeModel {
        return OutlineNodeModel.getById(id);
    }

    getNodeView(id, rootid):NodeView {
        var model = this.getModel(id);
        if (!model) {
            model = OutlineNodeModel.deletedById[id];
        }
        if (model.views == null) {return null;}
        return model.views[rootid];
    }

    undo(options) {
        if (!options) {options = {};}
        options.undo = true;
        options.redo = false;
        this.undone = true;
        return this.exec(options);
        // $D.validateMVC();
    }

    getFocusNode():NodeView {
        // by default, focus on activeID in newRoot
        var newRoot;
        if (this.options.undo) {
            newRoot = this.options.oldRoot;
        } else {
            newRoot = this.options.newRoot;
        }
        return this.getNodeView(this.options.activeID, newRoot);
    }

    focus() {
        this.handleLineSplits();
        var n:NodeView = this.getFocusNode();
        if (!n) { return; }
        View.setFocus(n);
        var text:TextAreaView = n.header.name.text;
        // console.log('Setting DOM focus in Action to ' + text.id);
        text.elem.focus();
        this.placeCursor(text);
    }
    toJSON():ActionJSON {
        var props:string[] = ['cid', 'type', 'timestamp', 'historyRank', 'undone',
            'lost', 'oldModelContext', 'newModelContext'];
        var opts:string[] = ['undo', 'redo', 'activeID', 'referenceID', 'anim', 'text',
            'transition', 'speed', 'delete', 'name'];
        if (this.parentAction) {
            var parentActionID = this.parentAction.cid;
        }
        var i:number;
        var json:ActionJSON = {};
        for (i=0; i<props.length; ++i) {
            json[props[i]] = this[props[i]];
        }
        json.options = {};
        for (i=0; i<opts.length; ++i) {
            json.options[opts[i]] = this.options[opts[i]];
        }
        json.numSubactions = this.subactions.length;
        if (this.parentAction) {
            json.parentActionID = this.parentAction.cid;
        }
        json.sessionID = $D.sessionID;
        return json;
    }
    broadcast() {
        if (this.options.origID) {return;}
        if (!this.type || (!Action.remoteActionTypes[this.type])) {return;}
        // if (this.parentAction!=null) {return;}
        var json:ActionJSON = this.toJSON();
        json.broadcastID = ActionManager.actions.getNextBroadcastID();
        if ((json.type==='InsertAfterAction')||(json.type==='InsertIntoAction')) {
            assert(json.options.activeID!=null, "No activeID was created");
            json.options.remoteID = json.options.activeID;
            delete json.options['activeID'];
        }
        (<JQueryStaticD>$).postMessage(
            (<JQueryStaticD>$).toJSON({
               command: 'broadcastAction',
               mesg: json
            }),
            'http://diathink.com/',
            window.frames['forwardIframe']);
    }
    // todo: need some way to 'clear' broadcasts from past sessions?
    static remoteExec(json:ActionJSON) {
        // todo: use oldModelContext and newModelContext for validation
        if (json.sessionID === $D.sessionID) {
            return;
        }
        if (!json.type || !Action.remoteActionTypes[json.type]) {
            assert(false, "Invalid action type in fromJSON");
            return;
        }
        // assert(json.parentActionID==null, "We have an invalid subaction scheduled");
        if (!ActionManager.remoteModels[json.sessionID]) {
            ActionManager.remoteModels[json.sessionID] = new ActionCollection();
        }
        var actionlist = ActionManager.remoteModels[json.sessionID];
        assert(json.broadcastID!=null, "Invalid broadcast ID");
        if (json.broadcastID <= actionlist.lastBroadcastID) {
            console.log("Got old-duplicate broadcast action");
            return;
        }
        if (actionlist.queuedActions[json.broadcastID]) {
            console.log("Got pending-duplicate broadcast action");
            return;
        }
        actionlist.queuedActions[json.broadcastID] = json;
        Action.tryNextRemote(json.sessionID); // but make sure one is not already running
    }
    static tryNextRemote(sessionID) {
        var actionlist = ActionManager.remoteModels[sessionID];
        actionlist.queuedActions[actionlist.lastBroadcastID+1];
        var j:ActionJSON = actionlist.queuedActions[actionlist.lastBroadcastID+1];
        if (!j) {
            console.log("Next remote action has not been queued yet, so waiting");
            return;
        }
        if (actionlist.runningAction === j.broadcastID) {
            console.log("Cannot start running remote action again: "+ j.broadcastID);
            return;
        }
        actionlist.runningAction = j.broadcastID;
        var action:Action;
        j.options.done = function() {
            ++actionlist.lastBroadcastID;
            actionlist.models.push(action);
            actionlist.length=actionlist.models.length;
            actionlist.modelsById[action.options.origID] = action;
            Action.tryNextRemote(sessionID);
        }

        j.options.origID = String(j.historyRank);
        j.options.focus = false;
        if (j.newModelContext) {
            j.options.newModelContext = j.newModelContext;
        }
        if (j.options.undo) {
            action = <Action>actionlist.modelsById[j.options.origID];
        } else if (j.options.redo) {
            action = <Action>actionlist.modelsById[j.options.origID];
        } else {
            action = new Action.remoteActionTypes[j.type](j.options);
        }
        action.exec(j.options);
    }

    // To override **
    placeCursor(text:TextAreaView) {}

    runinit2() {}

    validateOptions() {}

    validateOldContext() {}

    validateNewContext() {}

    contextStep() {}

    handleLineSplits() {}

    animSetup() { this.runtime.status.anim = 2; }

    animCleanup() { this.runtime.status.animCleanup = 2;}

    execModel() { this.runtime.status.newModelAdd = 2;}

    execView(outline) {this.runtime.status.view[outline.id] = 2;}

    execUniqueView() {this.runtime.status.uniqueView = 2;}

    static createAndExec(options):Action { // create a new action object
        var action:Action = new this(options);
        action.exec(options);
        return action;
    }

    static checkTextChange(id):SubAction {
        // console.log("Checking text change for id="+id);
        if (!View.focusedView) {
            return null; // view was deleted since being edited
        }
        var view:NodeView = View.focusedView;
        id = view.header.name.text.id;
        var value = view.header.name.text.value;
        // console.log('checkTextChange: id = '+id);
        var model = view.value;
        if (model.get('text') !== value) {
            //console.log("TextAction for id="+id+"; model="+
            //  model.cid+" with value="+$('#'+id).val());
            // console.log("checkTextChange returning with TextAction");
            return {
                actionType: TextAction,
                name: "Text edit",
                activeID: model.cid,
                text: value,
                oldRoot: view.nodeRootView.id,
                newRoot: view.nodeRootView.id,
                focus: false
            }
        }
        // console.log("checkTextChange returning with null");
        // console.log("Validating without text change");
        return null;
    }

    validate() {
        var actions = ActionManager.actions;
        var lastaction:number = ActionManager.lastAction;
        var foundit:boolean;
        var i = this.historyRank;
        if (i >= lastaction + 1) {
            assert((<Action>actions.at(i)).undone === true,
                "Action at " + i + " is after last-action " + lastaction + ", but is not undone");
        }
        assert(_.size(this.runtime.queue) === 0,
            "Action at " + i + " has non-empty runtime queue");
        if (this.parentAction) {
            assert(this.parentAction.subactions.length > 0,
                "Parent action of " + i + " has no subactions");
            foundit = false;
            for (var j = 0; j < this.parentAction.subactions.length; ++j) {
                var subact = this.parentAction.subactions[j].action;
                if (subact === this) {
                    foundit = true;
                    assert(actions.at(i - j - 1) === this.parentAction,
                        "Action at " + i + " does not have parent-action at " + (i - j - 1));
                    break;
                }
            }
            assert(foundit, "Action at " + i + " is not on list of subactions for parentAction");
        }
        if (this.subactions.length > 0) {
            for (var j = 0; j < this.subactions.length; ++j) {
                var subact = this.subactions[j].action;
                assert(actions.at(i + j + 1) === subact,
                    "Action at " + i + " cannot find subaction offset by " + j);
                assert(subact.parentAction === this,
                    "Action " + this.cid + " subaction " + j + " does not have matching parentAction");
            }
        }
    }
}
// outline-move op, animation-type,
// commuting operations don't have to be undone/redone - optimization
class ActionCollection extends Collection {
    model = typeof Action;
    lastBroadcastID = 0;
    queuedActions:{[i:string]:ActionJSON} = {};
    runningAction:number;
    getNextBroadcastID() {
        ++this.lastBroadcastID;
        return this.lastBroadcastID;
    }
    // length:number;
    // at(k:number):Action;
    // push(a:Action):void;
}



