///<reference path="Action.ts"/>
m_require("app/actions/DockAnimAction.js");

class PlaceholderAnimAction extends DockAnimAction {
    createSpeed= 80;
    deleteSpeed= 80;
    placeholderSpeed= 160;
    oldLinePlace(outline) {
        var r = this.runtime;
        if (r.rUseOldLinePlaceholder[outline.nodeRootView.id]) {
            var activeLineView = this.getLineView(this.options.activeID, outline.nodeRootView.id);

            // if view doesn't exist, insert no placeholder because it's invisible
            if (activeLineView == null) {
                // console.log("activeLineView is null in oldLinePlace for action type="+
                // this.type+"; undo="+this.options.undo+"; redo="+
                // this.options.redo+"; activeID="+this.options.activeID+
                // "; rootID="+outline.nodeRootView.id);
                return;
            }
            // vanish if not already hidden & shrink over 80ms
            if ($('#'+activeLineView.id).length===0) {
                console.log('ERROR: activeLineView '+activeLineView.id+' exists but has not element for oldLinePlace');
                debugger;
            }
            var activeObj = $('#'+activeLineView.id).addClass('drag-hidden');
            var activeLineHeight = activeObj[0].clientHeight;
            console.log("Creating placeholder with css-height="+activeLineHeight);
            var rOldLinePlaceholder = $('<li></li>').addClass('li-placeholder').css('height',String(activeLineHeight)+'px');
            if (activeObj.hasClass('ui-first-child')) {
                rOldLinePlaceholder.addClass('ui-first-child');
            }
            if (activeObj.hasClass('ui-last-child')) {
                rOldLinePlaceholder.addClass('ui-last-child');
            }
            // if placeholder is present, old activeLineView-element must be removed.
            activeObj[0].parentNode.replaceChild(rOldLinePlaceholder[0],activeObj[0]);
            // activeObj is here removed from DOM, though still has a view.
            r.activeLineHeight[outline.nodeRootView.id] = activeLineHeight;
            r.rOldLinePlaceholder[outline.nodeRootView.id] = rOldLinePlaceholder[0];
            r.activeLineElem[outline.nodeRootView.id] = activeObj[0];
            console.log('Added oldline placeholder to outline '+outline.nodeRootView.id);
            console.log(r.rOldLinePlaceholder[outline.nodeRootView.id]);
            console.log('ActiveLineElem changed to: ');
            console.log(r.activeLineElem[outline.nodeRootView.id]);
        }
    }
    newLinePlace(outline) {
        // if (this.options.anim==='indent') {return;}
        var r = this.runtime;
        var newModelContext = r.rNewModelContext;
        if (!outline) {return;}
        if (r.rUseNewLinePlaceholder[outline.nodeRootView.id]) {
            var parentView:ListView = this.contextParentVisible(newModelContext, outline);
            if (!parentView || parentView.hideList) {
                console.log('ERROR');
                debugger;
            }
            var place = $('<li></li>').addClass('li-placeholder').css('height', 0);
            r.rNewLinePlaceholder[outline.nodeRootView.id] = place.get(0);
            if (! newModelContext.prev) {
                place.addClass('ui-first-child');
            }
            if (! newModelContext.next) {
                place.addClass('ui-last-child');
            }
            if (newModelContext.next) {
                place.insertBefore('#'+this.getLineView(newModelContext.next, outline.nodeRootView.id).id);
            } else if (newModelContext.prev) {
                place.insertAfter('#'+this.getLineView(newModelContext.prev, outline.nodeRootView.id).id);
            } else if (newModelContext.parent) {
                place.appendTo('#'+parentView.id);
            }
            console.log('Added newline placeholder to outline '+outline.nodeRootView.id);
            console.log(r.rNewLinePlaceholder[outline.nodeRootView.id]);
        }
    }
    linePlaceAnim(outline) {
        var r = this.runtime;
        if (r.useLinePlaceholderAnim[outline.nodeRootView.id]) {
            var speed, startOldHeight, endNewHeight, sameHeight=false;
            if (this.options.anim==='delete') {speed = this.deleteSpeed;}
            else if (this.options.anim==='create') {speed = this.createSpeed;}
            else {speed = this.placeholderSpeed;}
            if (r.rUseOldLinePlaceholder[outline.nodeRootView.id]) {
                startOldHeight = r.rOldLinePlaceholder[outline.nodeRootView.id].clientHeight;
            }
            if (r.rUseNewLinePlaceholder[outline.nodeRootView.id]) {
                endNewHeight = r.activeLineHeight[outline.nodeRootView.id];
                if (!endNewHeight) {
                    endNewHeight = Math.round(1.5*Number($(document.body).css('font-size').replace(/px/,'')));
                }
            }
            if (startOldHeight && endNewHeight && (Math.round(startOldHeight)===Math.round(endNewHeight))) {
                sameHeight = true;
            }
            // this.runtime.startOldHeight = startOldHeight;
            // this.runtime.rootID =
            if (r.animOptions.view===undefined) {
                r.animOptions.view = {};
            }
            r.animOptions.view[outline.nodeRootView.id] = {
                rootID: outline.nodeRootView.id,
                startOldHeight: startOldHeight,
                endNewHeight: endNewHeight,
                sameHeight: sameHeight
            };
            // console.log("Updating status after finishing async sourceAnim:"+outline.nodeRootView.id);
        }
    }
    // animation-step if the oldLinePlaceholder is animated
    oldLinePlaceAnimStep(frac, o) {
        var startOldHeight = o.startOldHeight, rootID = o.rootID;
        $(this.runtime.rOldLinePlaceholder[rootID]).css('height',
            String(Math.round(startOldHeight*(1-frac)))+'px');
    }

    newLinePlaceAnimStep(frac, o) {
        var endNewHeight = o.endNewHeight, sameHeight = o.sameHeight,
            rootID = o.rootID, startOldHeight = o.startOldHeight;
        if ((this.oldType==='line') && sameHeight) {
            $(this.runtime.rNewLinePlaceholder[rootID]).css('height',
                String(startOldHeight - Math.round(startOldHeight*(1-frac)))+'px');
        } else {
            $(this.runtime.rNewLinePlaceholder[rootID]).css('height',
                String(Math.round(frac*endNewHeight))+'px');
        }
    }

    contextParentVisible(a,b):ListView {return null;} // defined in OutlineAction

}