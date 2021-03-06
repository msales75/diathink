///<reference path="Action.ts"/>

m_require("app/actions/OutlineAction.js");
// todo: merge outdent with moveafter action?
class OutdentAction extends OutlineAction {
    type="OutdentAction";
    _validateOptions= {
        requireActive: true,
        requireReference: true,
        requireOld: true,
        requireNew: true
    };
    // options:ActionOptions= {activeID: null, referenceID: null, transition: false};
    getNewContext() {
        this.newModelContext = OutlineNodeModel.getById(this.options.referenceID).getContextAfter();
    }
}
