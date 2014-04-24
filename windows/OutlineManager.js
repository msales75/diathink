///<reference path="views/OutlineRootView.ts"/>
var OutlineManager = (function () {
    function OutlineManager() {
    }
    OutlineManager.add = function (id, controller) {
        if (OutlineManager.deleted[id]) {
            delete OutlineManager.deleted[id];
        }
        OutlineManager.outlines[id] = controller;
    };
    OutlineManager.remove = function (outline) {
        var id = outline.id;
        OutlineManager.deleted[id] = id;
        delete OutlineManager.outlines[id];
    };
    OutlineManager.outlines = {};
    OutlineManager.deleted = {};
    return OutlineManager;
})();
//# sourceMappingURL=OutlineManager.js.map
