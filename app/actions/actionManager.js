
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

m_require("app/foundation/object.js");

$D.ActionManager = M.Object.extend({
    actions: null,
    lastAction: null,
    queue: [],
    // need to hold args for the action here.
    codeRequest: function() {
        return $.randomString(16);
    },
    schedule: function(f, f2) {
        var newlength = 1;
        this.queue.push(f);
        if (f2 != null) {
            var newlength = 2;
            this.queue.push(f2);
        }
        if (this.queue.length===newlength) {
            this.next();
        }
    },
    subschedule: function(f, f2) {
        if (this.queue.length<1) {
            console.log('ERROR: preschedule called with empty queue');
            debugger;
        }
        if (f2 != null) {
            this.queue.splice(1,0,f2);
        }
        this.queue.splice(1,0,f);
    },
    next: function() {
        var that = this;
        if (this.queue.length>0) {
            var f = this.queue[0];
            var options = f();
            if (!options) { // abort action without history
                this.queueComplete(f, null);
                return;
            }
            // delete options['action'];
            options.done = function() {
                that.queueComplete(f, options.action);
            };
            if (options.undo) {
                options.action.undo(options);
            } else if (options.redo) {
                options.action.exec(options);
            } else {
                options.action = options.action.createAndExec(options);
            }
            $D.ActionManager.log(options.action);
        }
    },
    queueComplete: function(f, action) {
        if (!f) {
            console.log("ERROR: queueComplete called without code");
            debugger;
        }
        var lastQueue = this.queue.shift();
        if (f !== lastQueue) {
            console.log('ERROR: QueueComplete called with wrong code');
            debugger;
        }
        if (this.queue.length>0) {
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

    },
    log: function(action) {
        if (action.options.undo) {
            console.log("Done undoing action "+action.historyRank+': '+action.type);
        } else if (action.options.redo) {
            console.log("Done redoing action "+action.historyRank+': '+action.type);
        } else {
            console.log("Done executing action "+this.actions.length+': '+action.type);
        }
        // note: log for original could be called after undo is requested,
        //   but then options.undo would not have been set yet, so its ok

        if (action.options.undo || action.options.redo) {return;}

        // undone actions prior to latest action are now lost
        // check whether last action one was redone or not
        if (this.actions.length>0) {
            if (this.actions.at(this.lastAction).undone) {
                this.actions.at(this.lastAction).lost = true;
            }
            for (var rank=this.lastAction+1; rank<this.actions.length; ++rank) {
                this.actions.at(rank).lost = true;
            }
        }
        this.lastAction = this.actions.length;
        action.historyRank = this.actions.length;
        this.actions.push(action);
    },
    nextUndo: function() {
        if (this.actions.length===0) {return false;}
        var rank = this.lastAction;
        while (this.actions.at(rank).undone===true) {
            --rank;
            if (rank<0) {return false;}
        }
        return rank;
    },
    nextRedo: function() {
        if (this.actions.length===0) {return false;}
        var rank = this.lastAction;
        while ((this.actions.at(rank).undone===false)||(this.actions.at(rank).lost===true)) {
            ++rank;
            if (rank>=this.actions.length) {return false;}
        }
        return rank;
    },
    undo:function () {
        this.schedule(function() {
            var rank = $D.ActionManager.nextUndo();
            if (rank === false) {return false;}
            $D.ActionManager.lastAction = rank;
            return {
                    action: $D.ActionManager.actions.at(rank),
                    undo: true
            };
        });
    },
    redo:function () {
        this.schedule(function() {
            var rank = $D.ActionManager.nextRedo();
            if (rank === false) {return false;}
            $D.ActionManager.lastAction = rank;
            return {
                action: $D.ActionManager.actions.at(rank),
                redo: true
            };
        });
    },
    subUndo:function () {
        this.subschedule(function() {
            var rank = $D.ActionManager.nextUndo();
            if (rank === false) {return false;}
            $D.ActionManager.lastAction = rank;
            return {
                action: $D.ActionManager.actions.at(rank),
                undo: true
            };
        });
    },
    subRedo:function () {
        this.subschedule(function() {
            var rank = $D.ActionManager.nextRedo();
            if (rank === false) {return false;}
            $D.ActionManager.lastAction = rank;
            return {
                action: $D.ActionManager.actions.at(rank),
                redo: true
            };
        });
    },
    // enable/disable undo buttons on screen
    refreshButtons: function() {
        if (this.actions === null) {
            this.actions = new $D.ActionCollection();
        }
        var b = View.getCurrentPage().header.undobuttons;
        if (this.nextUndo()!==false) {
            b.undobutton.enable();
        } else {
            b.undobutton.disable();
        }
        if (this.nextRedo()!==false) {
            b.redobutton.enable();
        } else {
            b.redobutton.disable();
        }
    }
});
