
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
   wait for UndoController.readyAction
   _exec
    runinit()
    validateOptions
    addQueue/addAsync:
      UndoController.log
      UndoController.refreshButtons
      end
        define subactions
        checkStart for subactions
        queueComplete
         Remove action from queue
         Add subactions to queue
 */

diathink.UndoController = M.Controller.extend({
    actions: null,
    lastAction: null,
    queue: [],
    readyAction: null,
    // need to hold args for the action here.
    codeRequest: function() {
        return $.randomString(16);
    },
    queueRequest: function() {
        var readyCode = this.codeRequest();
        this.queue.push(readyCode);
        // generate a ready-code to return
        if (this.queue.length===1) {
            if (this.readyAction !== null) {
                console.log("ERROR: this is very bad");
            }
            this.readyAction = readyCode;
        }
        // console.log(this.queue);
        return readyCode;
    },
    queuePrepend: function() {
        // injects action immediately after active-one in the queue
        if ((this.readyAction==null)||(this.readyAction !== this.queue[0])) {
            console.log("ERROR: queuePrepend called without an active action")
        }
        var readyCode = this.codeRequest();
        this.queue.splice(1,0,readyCode);
        // generate a ready-code to return
        // console.log(this.queue);
        return readyCode;
    },
    queueComplete: function(code, action) {
        if (!code) {
            console.log("ERROR: queueCompelte called without code");
        }
        if (this.readyAction !== code) {
            console.log("ERROR: this is bad");
        }
        var lastQueue = this.queue.shift();
        if (lastQueue !== code) {
            console.log("ERROR: This is also bad");
        }
        // console.log(this.queue);
        // ensure the completed action has no remaining queue items
        if (_.size(action.queue)!==0) {
            // console.log();
        }
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
        // console.log(this.queue);

        if (this.queue.length>0) {
            this.readyAction = this.queue[0];
        } else {
            this.readyAction = null;
        }
    },
    log: function(action) {
        if (action.options.undo) {
            console.log("Undoing action "+action.historyRank);
        } else if (action.options.redo) {
            console.log("Redoing action "+action.historyRank);
        } else {
            console.log("Executing action "+this.actions.length);
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
        var rank = this.nextUndo();
        if (rank !== false) {
            this.lastAction = rank;
            this.actions.at(rank).undo();
        }
    },
    redo:function () {
        var rank = this.nextRedo();
        if (rank !== false) {
            this.lastAction = rank;
            this.actions.at(rank).exec({redo: true});
        }
    },
    // enable/disable undo buttons on screen
    refreshButtons: function() {
        if (this.actions === null) {
            this.actions = new diathink.ActionCollection();
        }
        var b = M.ViewManager.getCurrentPage().header.undobuttons;
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
