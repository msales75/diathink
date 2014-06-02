///<reference path="Action.ts"/>

m_require("app/actions/OutlineAction.js");

class InsertAfterAction extends OutlineAction {
    type="InsertAfterAction";
    disableAnimation = true;
    // options:ActionOptions= {activeID: null, referenceID: null, text: ""};
    _validateOptions= {
        requireActive: false,
        requireReference: true,
        requireOld: false,
        requireNew: true
    };
    getNewContext() {
        // Handle cursor splitting/merging in OutlineAction
        if (this.options.origID) {
            this.newModelContext = this.options.newModelContext;
            return;
        }
        // test if children are visible
        var rootid:string = this.options.oldRoot;
        var ref = OutlineNodeModel.getById(this.options.referenceID);
        assert(ref.views[rootid], "Spawning line is not available in insertion");
        var childlist = (<NodeView>ref.views[rootid]).children;
        if (!childlist.listItems || (childlist.listItems.count===0)) {
            this.newModelContext = OutlineNodeModel.getById(this.options.referenceID).getContextAfter();
        } else {
            this.newModelContext =
                (<NodeView>childlist.listItems.obj[childlist.listItems.first()]).value.getContextBefore();
        }
        // otherwise create new visible child
    }
    // have issue-numbers in code that are linked by diaclear (have processor interpret as hyperlink)
    //   can you send message to open doc/line in webstorm?
}

