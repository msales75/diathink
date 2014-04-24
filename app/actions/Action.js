///<reference path="../views/View.ts"/>
///<reference path="../validate.ts"/>
///<reference path="ActionManager.ts"/>
///<reference path="AnimatedAction.ts"/>
///<reference path="CollapseAction.ts"/>
///<reference path="DeleteAction.ts"/>
///<reference path="DockAnimAction.ts"/>
///<reference path="InsertAfterAction.ts"/>
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
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

var Action = (function (_super) {
    __extends(Action, _super);
    function Action(options) {
        _super.call(this);
        this.type = "Action";
        this.indentSpeed = 80;
        this.createSpeed = 80;
        this.deleteSpeed = 80;
        this.placeholderSpeed = 160;
        this.dockSpeed = 160;
        this.oldType = 'line';
        this.newType = 'line';
        this.useOldLinePlaceholder = true;
        this.useNewLinePlaceholder = true;
        this.options = _.extend({}, this.options, options);
        this.init();
        return this;
    }
    Action.prototype.init = function () {
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
            runtime: null
        });
        this.runinit();
    };
    Action.prototype.runinit = function () {
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
            r.firsttime = false;
        }
        if (o.undo) {
            r.rOldType = this.newType;
            r.rNewType = this.oldType;
        } else {
            r.rOldType = this.oldType;
            r.rNewType = this.newType;
        }
    };
    Action.prototype.addAsync = function (self, deps, f) {
        this.addQueue(self, deps, f, true);
    };
    Action.prototype.addQueue = function (self, deps, f, async) {
        if (!async) {
            async = false;
        }
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
    };
    Action.prototype.nextQueue = function () {
        // console.log("Running nextQueue");
        if (this.runtime.nextQueueScheduled) {
            clearTimeout(this.runtime.nextQueueScheduled);
        }

        // loop over the queue and start all items which can be started
        var i, j, deps, depj, self, self0, f, ready, n = 0, queue = this.runtime.queue;
        var that = this;
        for (i in queue) {
            if (this.runtime.queue[i] === undefined) {
                continue;
            }

            // never start the same job twice
            self = queue[i][0];
            if (typeof self === 'object') {
                self0 = this.runtime.status[self[0]];

                // console.log("Considering queue item "+i+" type="+self[0]+":"+self[1]);
                if (self0 && self0[self[1]] > 0) {
                    continue;
                }
            } else {
                // console.log("Considering queue item "+i+" type="+self);
                if (this.runtime.status[self] > 0) {
                    continue;
                }
            }

            deps = queue[i][1];
            f = queue[i][2];
            ready = 1;

            for (j = 0; j < deps.length; ++j) {
                if (typeof deps[j] === 'object') {
                    depj = this.runtime.status[deps[j][0]];
                    if (!(depj && (depj[deps[j][1]] === 2))) {
                        // console.log("Postponing "+i+" because haven't met: "+deps[j][0]+":"+deps[j][1]);
                        ready = 0;
                        break;
                    }
                } else {
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
            this.runtime.nextQueueScheduled = setTimeout(function () {
                that.nextQueue();
            }, 0);
        }
    };
    Action.prototype.execQueue = function (i) {
        var q, that = this;
        q = this.runtime.queue[i];

        // console.log("Scheduling "+i);
        if (typeof q[0] === 'object') {
            that.runtime.status[q[0][0]][q[0][1]] = 1;
        } else {
            that.runtime.status[q[0]] = 1;
        }
        setTimeout(function () {
            // console.log("Removing from queue item "+i);
            delete that.runtime.queue[i];
        }, 0);
        setTimeout(function () {
            // console.log("Updating status of item "+i+"before execution");
            // console.log("Executing "+i);
            (q[2])();
            if (!q[3]) {
                // console.log("Updating status after finishing non-async item "+i);
                if (typeof q[0] === 'object') {
                    that.runtime.status[q[0][0]][q[0][1]] = 2;
                } else {
                    that.runtime.status[q[0]] = 2;
                }
                that.nextQueue();
            }
        }, 0);
    };

    Action.prototype.exec = function (options) {
        var i, rank, nsub;
        if (!options) {
            options = {};
        }
        console.log("Starting action " + this.type + " with undo=" + options.undo + "; redo=" + options.redo);
        if (options.redo) {
            options.undo = false;
        }
        if (!options.undo) {
            this.undone = false;
        }
        if (options.parentAction) {
            this.parentAction = options.parentAction;
        }

        // if this is undo/redo op, and there are subactions, queue those immediately.
        if (options.redo && (this.subactions.length > 0)) {
            nsub = this.subactions.length;
            for (i = 0; i < nsub; ++i) {
                rank = ActionManager.nextRedo();
                if (ActionManager.actions.at(rank) !== this.subactions[i].action) {
                    console.log("ERROR: Redoing wrong subaction");
                    debugger;
                }
                ActionManager.subRedo();
            }
        } else if (options.undo && (this.parentAction != null)) {
            nsub = this.parentAction.subactions.length;
            if (this !== this.parentAction.subactions[nsub - 1].action) {
                console.log("ERROR: Last subaction in chain was not called first!");
                debugger;
            }
            for (i = 0; i < nsub; ++i) {
                rank = ActionManager.nextUndo();
                if (i === 0) {
                    if (ActionManager.actions.at(rank) !== this.parentAction) {
                        console.log("ERROR: Undoing something else when should be parentAction");
                        debugger;
                    }
                } else {
                    if (ActionManager.actions.at(rank) !== this.subactions[nsub - 1 - i].action) {
                        console.log("ERROR: Undoing wrong subaction");
                        debugger;
                    }
                }
                ActionManager.subUndo();
            }
        }

        this._exec(options);
        // todo: test if lastAction is where it should be
        // todo: test if undo/redo/undone parameters match up
    };

    Action.prototype._exec = function (options) {
        var o, i, that = this, r;
        _.extend(that.options, options);
        that.runinit();
        this.validateOptions();
        o = this.options;
        r = this.runtime;

        // before changing model, start preview animation
        this.addQueue('context', [], function () {
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

        var outlines = OutlineRootView.outlinesById;
        var focusDeps = [];
        for (i in outlines) {
            this.execView(outlines[i]);
            focusDeps.push(['view', outlines[i].nodeRootView.id]);
        }
        this.addQueue('focus', focusDeps, function () {
            if (that.options.focus) {
                that.focus();
            }
        });

        // todo: increase undo-dependencies
        this.addQueue('undobuttons', ['newModelAdd'], function () {
            ActionManager.refreshButtons();
        });

        this.addQueue('end', ['focus', 'undobuttons', 'anim'], function () {
            var i, sub;
            that.validateNewContext();
            if (!that.options.undo && !that.options.redo) {
                for (i = that.subactions.length - 1; i >= 0; --i) {
                    sub = that.subactions[i];
                    sub.undo = false;
                    sub.redo = false;
                    sub.parentAction = that;
                    (function (o) {
                        ActionManager.subschedule(function () {
                            return o;
                        });
                    })(sub);
                }
            }
            var done = that.options.done;
            delete that.options['done'];
            done();
            if (_.size(ActionManager.queue) === 0) {
                console.log("Validating after action");
                validate();
            } else {
                console.log("Not validating after subaction");
            }
        });
        this.nextQueue();
    };
    Action.prototype.getModel = function (id) {
        return OutlineNodeModel.getById(id);
    };
    Action.prototype.getNodeView = function (id, rootid) {
        var model = this.getModel(id);
        if (!model) {
            model = OutlineNodeModel.deletedById[id];
        }
        if (model.views == null) {
            return null;
        }
        return model.views[rootid];
    };
    Action.prototype.undo = function (options) {
        if (!options) {
            options = {};
        }
        options.undo = true;
        options.redo = false;
        this.undone = true;
        return this.exec(options);
        // $D.validateMVC();
    };
    Action.prototype.focus = function () {
        // by default, focus on activeID in newRoot
        var newRoot;
        if (this.options.undo) {
            newRoot = this.options.oldRoot;
        } else {
            newRoot = this.options.newRoot;
        }
        var nodeView = this.getNodeView(this.options.activeID, newRoot);
        if (!nodeView) {
            return;
        }
        View.setFocus(nodeView);
        var id = nodeView.header.name.text.id;
        $('#' + id).focus();
    };

    // To override **
    Action.prototype.runinit2 = function () {
    };
    Action.prototype.validateOptions = function () {
    };
    Action.prototype.validateOldContext = function () {
    };
    Action.prototype.validateNewContext = function () {
    };
    Action.prototype.contextStep = function () {
    };
    Action.prototype.animSetup = function () {
        this.runtime.status.anim = 2;
    };
    Action.prototype.execModel = function () {
    };
    Action.prototype.execView = function (outline) {
    };

    Action.createAndExec = function (options) {
        var action = new this(options);
        action.exec(options);
        return action;
    };
    Action.checkTextChange = function (id) {
        // console.log("Checking text change for id="+id);
        var value = $('#' + id).val();
        console.log('checkTextChange: id = ' + id);
        if (!View.get(id)) {
            return null;
        }
        var view = View.get(id).parentView.parentView.parentView;
        var model = view.value;
        if (model.get('text') !== value) {
            //console.log("TextAction for id="+id+"; model="+
            //  model.cid+" with value="+$('#'+id).val());
            return {
                actionType: TextAction,
                activeID: model.cid,
                text: value,
                oldRoot: view.nodeRootView.id,
                newRoot: view.nodeRootView.id,
                focus: false
            };
        }
        return null;
    };
    Action.prototype.validate = function () {
        var actions = ActionManager.actions;
        var lastaction = ActionManager.lastAction;
        var foundit;
        var i = this.historyRank;

        if (i >= lastaction + 1) {
            assert(actions.at(i).undone === true, "Action at " + i + " is after last-action " + lastaction + ", but is not undone");
        }

        assert(_.size(this.runtime.queue) === 0, "Action at " + i + " has non-empty runtime queue");
        if (this.parentAction) {
            assert(this.parentAction.subactions.length > 0, "Parent action of " + i + " has no subactions");
            foundit = false;
            for (var j = 0; j < this.parentAction.subactions.length; ++j) {
                var subact = this.parentAction.subactions[j].action;
                if (subact === this) {
                    foundit = true;
                    assert(actions.at(i - j - 1) === this.parentAction, "Action at " + i + " does not have parent-action at " + (i - j - 1));
                    break;
                }
            }
            assert(foundit, "Action at " + i + " is not on list of subactions for parentAction");
        }
        if (this.subactions.length > 0) {
            for (var j = 0; j < this.subactions.length; ++j) {
                var subact = this.subactions[j].action;
                assert(actions.at(i + j + 1) === subact, "Action at " + i + " cannot find subaction offset by " + j);
                assert(subact.parentAction === this, "Action " + this.cid + " subaction " + j + " does not have matching parentAction");
            }
        }
    };
    return Action;
})(PModel);

// outline-move op, animation-type,
// commuting operations don't have to be undone/redone - optimization
var ActionCollection = (function (_super) {
    __extends(ActionCollection, _super);
    function ActionCollection() {
        _super.apply(this, arguments);
        this.model = typeof Action;
    }
    return ActionCollection;
})(Collection);
//# sourceMappingURL=Action.js.map
