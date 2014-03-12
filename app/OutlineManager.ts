

class OutlineManager {
    static outlines= {};
    static deleted= {};

    static add(id, controller) {
        if (OutlineManager.deleted[id]) {
            delete OutlineManager.deleted[id];
        }
        OutlineManager.outlines[id] = controller;
    }
    static remove(outline) {
        var id = outline.id;
        OutlineManager.deleted[id] = id;
        delete OutlineManager.outlines[id];
    }

}

// nest horizontal pages, expand/contract? drag/drop?
// save perspectives? hmm.


