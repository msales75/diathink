///<reference path="views/OutlineRootView.ts"/>


class OutlineManager {
    static outlines:{[i:string]:OutlineRootView}= {};
    static deleted:{[i:string]:string}= {};

    static add(id:string, controller:OutlineRootView) {
        if (OutlineManager.deleted[id]) {
            delete OutlineManager.deleted[id];
        }
        OutlineManager.outlines[id] = controller;
    }
    static remove(outline:OutlineRootView) {
        var id:string = outline.id;
        OutlineManager.deleted[id] = id;
        delete OutlineManager.outlines[id];
    }

}

// nest horizontal pages, expand/contract? drag/drop?
// save perspectives? hmm.


