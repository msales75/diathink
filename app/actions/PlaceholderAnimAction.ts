///<reference path="Action.ts"/>
m_require("app/actions/DockAnimAction.js");

class PlaceholderAnimAction extends DockAnimAction {
    oldLinePlace(outline) {

    }
    newLinePlace(outline) {

    }
    linePlaceAnim(outline) {
    }
    // animation-step if the oldLinePlaceholder is animated
    oldLinePlaceAnimStep(frac, o) {
    }

    newLinePlaceAnimStep(frac, o) {
    }

    contextParentVisible(a,b):ListView {return null;} // defined in OutlineAction

}