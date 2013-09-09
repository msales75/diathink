
// TODO: synchronize time between server/browsers


diathink.UndoController = M.Controller.extend({
    actions: null,
    lastAction: null,
    log: function(action) {
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
            this.actions.at(rank).undo();
            this.lastAction = rank;
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
