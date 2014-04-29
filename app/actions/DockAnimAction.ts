///<reference path="Action.ts"/>

m_require("app/actions/AnimatedAction.js");

class DockAnimAction extends AnimatedAction {
    oldModelContext; // these are tested for existence
    newModelContext;
/*
    getObjectParams(obj, textobj) {
// * Currently unused, precisely orients text in object-boundaries
        // if old-type = new-type, don't need to deal with this
        var oldParams = {};
        oldParams.elem = oldObject;
        var offset = $(oldObject).offset();
        oldParams.top = offset.top;
        oldParams.left = offset.left;
        var textoffset = $(textobj).offset();
        oldParams.textTop = textoffset.top - offset.top;
        oldParams.textLeft = textoffset.left - offset.left;
        oldParams.fontSize = Number($(textobj).css('font-size').replace(/px/,''));
        oldParams.textWidth = $(textobj).width();
        oldParams.textHeight = $(textobj).height();
        oldParams.color = $(textobj).css('color');
        return oldParams;
    } */
    dockAnimStep(frac, o) {
    }
    animFadeEnv() {
    }

    createDockElem() {
    }

    // this seems the same for PanelRootAction panel-docking
    // todo: for non-docking, start fade-in after restoreContext before focus
    // dock the dragged-helper



    dockAnim(newRoot) {
    }
}

