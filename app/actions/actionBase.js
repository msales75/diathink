
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


$D.Action = Backbone.RelationalModel.extend({
    type:"Action",
    indentSpeed: 80,
    createSpeed: 80,
    deleteSpeed: 80,
    placeholderSpeed: 160,

    dockSpeed: 160,
    oldType: 'line', // only used for docking?
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
        this.runinit();
    },
    runinit: function() {
        this.runtime = {
            nextQueueScheduled: null,
            queue: {},
            animOptions: {},
            status: {
                log: 0,
                undobuttons: 0,
                view: {},
                end: 0
            }
        };
        var o = this.options, r = this.runtime;
        if (o.undo || o.redo) {
            r.firsttime = false;
        } else {
            r.firsttime= false;
        }
        if (o.undo) {
            r.rOldType = this.newType;
            r.rNewType = this.oldType;
        } else {
            r.rOldType = this.oldType;
            r.rNewType = this.newType;
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
                rank = $D.ActionManager.nextRedo();
                if ($D.ActionManager.actions.at(rank) !== this.subactions[i].action) {
                    console.log("ERROR: Redoing wrong subaction");
                    debugger;
                }
                $D.ActionManager.subRedo();
            }
        } else if (options.undo && (this.parentAction != null)) {
            nsub = this.parentAction.subactions.length;
            if (this !== this.parentAction.subactions[nsub-1].action) {
                console.log("ERROR: Last subaction in chain was not called first!");
                debugger;
            }
            for (i=0; i<nsub; ++i) {
                rank = $D.ActionManager.nextUndo();
                if (i===0) {
                    if ($D.ActionManager.actions.at(rank) !== this.parentAction) {
                        console.log("ERROR: Undoing something else when should be parentAction");
                        debugger;
                    }
                } else {
                    if ($D.ActionManager.actions.at(rank) !== this.subactions[nsub-1-i].action) {
                        console.log("ERROR: Undoing wrong subaction");
                        debugger;
                    }
                }
                $D.ActionManager.subUndo();
            }
        }

        this._exec(options);

        // todo: test if lastAction is where it should be
        // todo: test if undo/redo/undone parameters match up

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
                that.contextStep();
            }
            that.validateOldContext();
            that.runinit2();
        });

        this.animSetup();

        // todo: assumptions and issue-handling
        this.execModel();

        var outlines = $D.OutlineManager.outlines;
        var focusDeps = [];
        for (i in outlines) {
           this.execView(outlines[i]);
           focusDeps.push(['view', outlines[i].rootID]);
        }
        this.addQueue('focus', focusDeps, function() {
            if (that.options.focus) {
                that.focus();
            }
        });

        // todo: increase undo-dependencies
        this.addQueue('undobuttons', ['newModelAdd'],
            function() {$D.ActionManager.refreshButtons();});

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
                        $D.ActionManager.subschedule(function() {
                            return o;
                        });
                    })(sub);
                }
            }
            var done = that.options.done;
            delete that.options['done'];
            done();
        });
        // $D.validateMVC();
        this.nextQueue();
    },
    getModel: function(id) {
        return Backbone.Relational.store.find($D.OutlineNodeModel, id);
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
        // $D.validateMVC();
    },
    focus: function() {
        // by default, focus on activeID in newRoot
        var newRoot;
        if (this.options.undo) {
            newRoot = this.options.oldRoot;
        } else {
            newRoot = this.options.newRoot;
        }
        var lineView = this.getLineView(this.options.activeID, newRoot);
        if (!lineView) { return; }
        $D.setFocus(lineView);
        var id = lineView.header.name.text.id;
        $('#'+id).focus();
    },

    // To override **
    runinit2: function() {},
    validateOptions: function() {},
    validateOldContext: function() {},
    validateNewContext: function() {},
    contextStep: function() {},
    animSetup: function() { this.runtime.status.anim = 2; },
    execModel: function () {},
    execView:function (outline) {}

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
                    action: $D.TextAction,
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

// outline-move op, animation-type,
// commuting operations don't have to be undone/redone - optimization

$D.ActionCollection = Backbone.Collection.extend({
    model: $D.Action
});



