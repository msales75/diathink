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
class ActionManager {
    static actions:ActionCollection = null;
    static lastAction:number = null;
    static queue:AnonFunction[] = [];
    static remoteModels:{[i:string]:ActionCollection} = {};
    // need to hold args for the action here.
    static randomString(size) {
        if (!size) {
            size = 12;
        }
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        var charlist = [];
        for (var i = 0; i < size; i++) {
            charlist.push(possible.charAt(Math.floor(Math.random() * possible.length)));
        }
        return charlist.join('');
    }

    static codeRequest() {
        return this.randomString(16);
    }

    static simpleSchedule(node, f:AnonFunction) {
        ActionManager.schedule(
            function():SubAction {
                if (!node) {return null;}
                return Action.checkTextChange(node.header.name.text.id);
            },
            f);
    }

    static schedule(f:AnonFunction, f2?:AnonFunction, f3?:AnonFunction, f4?:AnonFunction) {
        var newlength = 1;
        this.queue.push(f);
        if (f2 != null) {
            var newlength = 2;
            this.queue.push(f2);
        }
        if (f3 != null) {
            var newlength = 3;
            this.queue.push(f3);
        }
        if (f4 != null) {
            var newlength = 4;
            this.queue.push(f4);
        }
        if (this.queue.length === newlength) {
            // console.log("In schedule(), starting queue-processing because none are currently running");
            this.next();
        }
    }

    static subschedule(f:AnonFunction, f2?:AnonFunction) {
        if (this.queue.length < 1) {
            console.log('ERROR: preschedule called with empty queue');
            debugger;
        }
        if (f2 != null) {
            this.queue.splice(1, 0, f2);
        }
        this.queue.splice(1, 0, f);
    }

    static next() {
        var that:typeof ActionManager = this;
        if (this.queue.length > 0) {
            var f:{()} = this.queue[0];
            var options = f();
            if (options == null) { // abort action without history
                // console.log("In next, calling queueComplete from empty action");
                this.queueComplete(f, null);
                if (this.queue.length === 0) {
                    // console.log("Validating after null action");
                    // validate();
                }
                return;
            }
            // delete options['action'];
            options.done = function() {
                setTimeout(function() { // wait for action to wrapup before starting next one
                    if (options.remoteDone) {options.remoteDone(options.action);}
                    that.queueComplete(f, options.action);
                }, 0);
            };
            var mesgobj = View.currentPage.header.message;
            if (options.undo) {
                // console.log("In next(), undoing action of type "+options.actionType.name);
                if (options.action.options.name) {
                    mesgobj.setValue('Undo: ' + options.action.options.name, 'action');
                }
                options.action.undo(options);
            } else if (options.redo) {
                // console.log("In next(), redoing action of type "+options.actionType.name);
                if (options.action.options.name) {
                    mesgobj.setValue('Redo: ' + options.action.options.name, 'action');
                }
                options.action.exec(options);
            } else {
                // console.log("In next(), executing action of type "+options.actionType.name);
                if (options.name) {
                    // mesgobj.setValue(options.name, 'action');
                }
                options.action = options.actionType.createAndExec(options);
            }
            ActionManager.log(options.action);
        }
    }

    static queueComplete(f, action) {
        if (!f) {
            console.log("ERROR: queueComplete called without code");
            debugger;
        }
        // if (action && action.options.origID) {
            // return; // completed remote action, do not change local queues
        // }
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
    }

    static log(action:Action) {
        if (action.options.origID) {
            return; // don't log remote actions locally
        }
        if (action.options.nolog) {
            return;
        }
        if (action.options.undo) {
            // console.log("Done undoing action " + action.historyRank + ': ' + action.type);
        } else if (action.options.redo) {
            // console.log("Done redoing action " + action.historyRank + ': ' + action.type);
        } else {
            // console.log("Done executing action " + this.actions.length + ': ' + action.type);
        }
        // note: log for original could be called after undo is requested,
        //   but then options.undo would not have been set yet, so its ok
        if (action.options.undo || action.options.redo) {return;}
        // undone actions prior to latest action are now lost
        // check whether last action one was redone or not
        if (this.actions.length > 0) {
            if ((<Action>this.actions.at(this.lastAction)).undone) {
                (<Action>this.actions.at(this.lastAction)).lost = true;
            }
            for (var rank = this.lastAction + 1; rank < this.actions.length; ++rank) {
                (<Action>this.actions.at(rank)).lost = true;
            }
        }
        this.lastAction = this.actions.length;
        action.historyRank = this.actions.length;
        this.actions.push(action);
    }

    static nextUndo():number {
        if (this.actions.length === 0) {return -1;}
        var rank:number = this.lastAction;
        while ((<Action>this.actions.at(rank)).undone === true) {
            --rank;
            if (rank < 0) {return -1;}
        }
        return rank;
    }

    static nextRedo():number {
        if (this.actions.length === 0) {return -1;}
        var rank:number = this.lastAction;
        while (((<Action>this.actions.at(rank)).undone === false) || ((<Action>this.actions.at(rank)).lost === true)) {
            ++rank;
            if (rank >= this.actions.length) {return -1;}
        }
        return rank;
    }

    static undo() {
        this.schedule(function():SubAction {
            if (!View.focusedView) {return null;}
            return Action.checkTextChange(View.focusedView.header.name.text.id);
        });
        this.schedule(function():SubAction {
            var rank:number = ActionManager.nextUndo();
            if (rank === -1) {return null;}
            ActionManager.lastAction = rank;
            return {
                actionType: typeof ActionManager.actions.at(rank),
                action: <Action>ActionManager.actions.at(rank),
                undo: true
            };
        });
    }

    static redo() {
        this.schedule(function():SubAction {
            if (!View.focusedView) {return null;}
            return Action.checkTextChange(View.focusedView.header.name.text.id);
        });
        this.schedule(function():SubAction {
            var rank = ActionManager.nextRedo();
            if (rank === -1) {return null;}
            ActionManager.lastAction = rank;
            return {
                actionType: typeof ActionManager.actions.at(rank),
                action: <Action>ActionManager.actions.at(rank),
                redo: true
            };
        });
    }

    static subUndo() {
        this.subschedule(function():SubAction {
            var rank = ActionManager.nextUndo();
            if (rank === -1) {return null;}
            ActionManager.lastAction = rank;
            return {
                actionType: typeof ActionManager.actions.at(rank),
                action: <Action>ActionManager.actions.at(rank),
                undo: true
            };
        });
    }

    static subRedo() {
        this.subschedule(function():SubAction {
            var rank = ActionManager.nextRedo();
            if (rank === -1) {return null;}
            ActionManager.lastAction = rank;
            return {
                actionType: typeof ActionManager.actions.at(rank),
                action: <Action>ActionManager.actions.at(rank),
                redo: true
            };
        });
    }

    // enable/disable undo buttons on screen
    static refreshButtons() {
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
    }
}
