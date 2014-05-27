///<reference path="Action.ts"/>
// before permitting undo, we assume:
//   * we have a list of all subactions
//   * exec is updated for all actions
//   * log has been called for the action and all subactions
//   * lastAction is updated
// TODO: synchronize time between server/browsers
/*
createAndExec
constructor -> init()
exec
queueRequest
add readyCode to queue
checkStart
wait for ActionManager.readyAction
_exec
runinit()
validateOptions
addQueue/addAsync:
ActionManager.log
ActionManager.refreshButtons
end
define subactions
checkStart for subactions
queueComplete
Remove action from queue
Add subactions to queue
*/
var ActionManager = (function () {
    function ActionManager() {
    }
    // need to hold args for the action here.
    ActionManager.randomString = function (size) {
        if (!size) {
            size = 12;
        }
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        var charlist = [];
        for (var i = 0; i < size; i++) {
            charlist.push(possible.charAt(Math.floor(Math.random() * possible.length)));
        }
        return charlist.join('');
    };

    ActionManager.codeRequest = function () {
        return this.randomString(16);
    };

    ActionManager.simpleSchedule = function (node, f) {
        ActionManager.schedule(function () {
            if (!node) {
                return null;
            }
            return Action.checkTextChange(node.header.name.text.id);
        }, f);
    };

    ActionManager.schedule = function (f, f2) {
        var newlength = 1;
        this.queue.push(f);
        if (f2 != null) {
            var newlength = 2;
            this.queue.push(f2);
        }
        if (this.queue.length === newlength) {
            // console.log("In schedule(), starting queue-processing because none are currently running");
            this.next();
        }
    };

    ActionManager.subschedule = function (f, f2) {
        if (this.queue.length < 1) {
            console.log('ERROR: preschedule called with empty queue');
            debugger;
        }
        if (f2 != null) {
            this.queue.splice(1, 0, f2);
        }
        this.queue.splice(1, 0, f);
    };

    ActionManager.next = function () {
        var that = this;
        if (this.queue.length > 0) {
            var f = this.queue[0];
            var options = f();
            if (options == null) {
                // console.log("In next, calling queueComplete from empty action");
                this.queueComplete(f, null);
                if (this.queue.length === 0) {
                    // console.log("Validating after null action");
                    // validate();
                }
                return;
            }

            // delete options['action'];
            options.done = function () {
                setTimeout(function () {
                    that.queueComplete(f, options.action);
                }, 0);
            };
            if (options.undo) {
                // console.log("In next(), undoing action of type "+options.actionType.name);
                options.action.undo(options);
            } else if (options.redo) {
                // console.log("In next(), redoing action of type "+options.actionType.name);
                options.action.exec(options);
            } else {
                // console.log("In next(), executing action of type "+options.actionType.name);
                options.action = options.actionType.createAndExec(options);
            }
            ActionManager.log(options.action);
        }
    };

    ActionManager.queueComplete = function (f, action) {
        if (!f) {
            console.log("ERROR: queueComplete called without code");
            debugger;
        }
        var lastQueue = this.queue.shift();

        // console.log("Removed item from queue");
        if (f !== lastQueue) {
            console.log('ERROR: QueueComplete called with wrong code');
            debugger;
        }
        if (this.queue.length > 0) {
            // console.log("Calling next from queueComplete, since queue-length="+this.queue.length);
            this.next();
        }
        // ensure the completed action has no remaining queue items
        /*
        for (var i in action.status) {
        var s = action.status[i];
        if (typeof s === 'object') {
        for (var j in s) {
        if (s[j]!==2) {
        console.log("Unfinished status "+i+":"+j+"="+s[j]);
        }
        }
        } else {
        if (s!==2) {
        if (i !== 'end') {
        console.log("Unfinished status "+i+"="+s);
        }
        }
        }
        }
        */
    };

    ActionManager.log = function (action) {
        if (action.options.undo) {
            // console.log("Done undoing action " + action.historyRank + ': ' + action.type);
        } else if (action.options.redo) {
            // console.log("Done redoing action " + action.historyRank + ': ' + action.type);
        } else {
            // console.log("Done executing action " + this.actions.length + ': ' + action.type);
        }

        // note: log for original could be called after undo is requested,
        //   but then options.undo would not have been set yet, so its ok
        if (action.options.undo || action.options.redo) {
            return;
        }

        // undone actions prior to latest action are now lost
        // check whether last action one was redone or not
        if (this.actions.length > 0) {
            if (this.actions.at(this.lastAction).undone) {
                this.actions.at(this.lastAction).lost = true;
            }
            for (var rank = this.lastAction + 1; rank < this.actions.length; ++rank) {
                this.actions.at(rank).lost = true;
            }
        }
        this.lastAction = this.actions.length;
        action.historyRank = this.actions.length;
        this.actions.push(action);
    };

    ActionManager.nextUndo = function () {
        if (this.actions.length === 0) {
            return -1;
        }
        var rank = this.lastAction;
        while (this.actions.at(rank).undone === true) {
            --rank;
            if (rank < 0) {
                return -1;
            }
        }
        return rank;
    };

    ActionManager.nextRedo = function () {
        if (this.actions.length === 0) {
            return -1;
        }
        var rank = this.lastAction;
        while ((this.actions.at(rank).undone === false) || (this.actions.at(rank).lost === true)) {
            ++rank;
            if (rank >= this.actions.length) {
                return -1;
            }
        }
        return rank;
    };

    ActionManager.undo = function () {
        this.schedule(function () {
            if (!View.focusedView) {
                return null;
            }
            return Action.checkTextChange(View.focusedView.header.name.text.id);
        });
        this.schedule(function () {
            var rank = ActionManager.nextUndo();
            if (rank === -1) {
                return null;
            }
            ActionManager.lastAction = rank;
            return {
                actionType: typeof ActionManager.actions.at(rank),
                action: ActionManager.actions.at(rank),
                undo: true
            };
        });
    };

    ActionManager.redo = function () {
        this.schedule(function () {
            if (!View.focusedView) {
                return null;
            }
            return Action.checkTextChange(View.focusedView.header.name.text.id);
        });
        this.schedule(function () {
            var rank = ActionManager.nextRedo();
            if (rank === -1) {
                return null;
            }
            ActionManager.lastAction = rank;
            return {
                actionType: typeof ActionManager.actions.at(rank),
                action: ActionManager.actions.at(rank),
                redo: true
            };
        });
    };

    ActionManager.subUndo = function () {
        this.subschedule(function () {
            var rank = ActionManager.nextUndo();
            if (rank === -1) {
                return null;
            }
            ActionManager.lastAction = rank;
            return {
                actionType: typeof ActionManager.actions.at(rank),
                action: ActionManager.actions.at(rank),
                undo: true
            };
        });
    };

    ActionManager.subRedo = function () {
        this.subschedule(function () {
            var rank = ActionManager.nextRedo();
            if (rank === -1) {
                return null;
            }
            ActionManager.lastAction = rank;
            return {
                actionType: typeof ActionManager.actions.at(rank),
                action: ActionManager.actions.at(rank),
                redo: true
            };
        });
    };

    // enable/disable undo buttons on screen
    ActionManager.refreshButtons = function () {
        if (this.actions === null) {
            this.actions = new ActionCollection();
        }
        var b = View.getCurrentPage().header.undobuttons;
        if (this.nextUndo() !== -1) {
            b.undobutton.enable();
        } else {
            b.undobutton.disable();
        }
        if (this.nextRedo() !== -1) {
            b.redobutton.enable();
        } else {
            b.redobutton.disable();
        }
    };
    ActionManager.actions = null;
    ActionManager.lastAction = null;
    ActionManager.queue = [];
    return ActionManager;
})();
//# sourceMappingURL=ActionManager.js.map
