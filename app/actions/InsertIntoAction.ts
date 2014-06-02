///<reference path="Action.ts"/>

m_require("app/actions/OutlineAction.js");

class InsertIntoAction extends OutlineAction {
    type="InsertIntoAction";
    disableAnimation = true;
    // options:ActionOptions= {activeID: null, referenceID: null, text: ""};
    _validateOptions= {
        requireActive: false,
        requireReference: true,
        requireOld: false,
        requireNew: false
    };
    getNewContext() {
        if (this.options.origID) {
            this.newModelContext = this.options.newModelContext;
            return;
        }
        var parent = View.get(this.options.newRoot).panelView;
        assert(parent!=null, "Invalid newRoot for InsertIntoAction");
        var next:string = null;
        var children:OutlineNodeCollection = parent.value.get('children');
        if (children.count>0) {
            next = children.first();
        }
        this.newModelContext = {
            prev: null,
            next: next,
            parent: parent.value.cid
        };
    }
    // have issue-numbers in code that are linked by diaclear (have processor interpret as hyperlink)
    //   can you send message to open doc/line in webstorm?
}

