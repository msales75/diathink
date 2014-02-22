
$D.animPlaceholder = {
    createSpeed: 80,
    deleteSpeed: 80,
    placeholderSpeed: 160,
    oldLinePlace: function(outline) {
        var r = this.runtime;
        if (r.rOldLinePlaceholder[outline.rootID]) {
            var activeLineView = this.getLineView(this.options.activeID, outline.rootID);

            // if view doesn't exist, insert no placeholder because it's invisible
            if (activeLineView == null) {
                // console.log("activeLineView is null in oldLinePlace for action type="+
                // this.type+"; undo="+this.options.undo+"; redo="+
                // this.options.redo+"; activeID="+this.options.activeID+
                // "; rootID="+outline.rootID);
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
            r.activeLineHeight[outline.rootID] = activeLineHeight;
            r.rOldLinePlaceholder[outline.rootID] = rOldLinePlaceholder[0];
            r.activeLineElem[outline.rootID] = activeObj[0];
            console.log('Added oldline placeholder to outline '+outline.rootID);
            console.log(r.rOldLinePlaceholder[outline.rootID]);
            console.log('ActiveLineElem changed to: ');
            console.log(r.activeLineElem[outline.rootID]);
        }
    },
    newLinePlace: function(outline) {
        // if (this.options.anim==='indent') {return;}
        var r = this.runtime;
        var newModelContext = r.rNewModelContext;
        if (!outline) {return;}
        if (r.rNewLinePlaceholder[outline.rootID]) {
            var parentView = this.contextParentVisible(newModelContext, outline);
            if (!parentView || parentView.collapsed) {
                console.log('ERROR');
                debugger;
            }
            var place = $('<li></li>').addClass('li-placeholder').css('height', 0);
            r.rNewLinePlaceholder[outline.rootID] = place.get(0);
            if (! newModelContext.prev) {
                place.addClass('ui-first-child');
            }
            if (! newModelContext.next) {
                place.addClass('ui-last-child');
            }
            if (newModelContext.next) {
                place.insertBefore('#'+this.getLineView(newModelContext.next, outline.rootID).id);
            } else if (newModelContext.prev) {
                place.insertAfter('#'+this.getLineView(newModelContext.prev, outline.rootID).id);
            } else if (newModelContext.parent) {
                place.appendTo('#'+parentView.id);
            }
            console.log('Added newline placeholder to outline '+outline.rootID);
            console.log(r.rNewLinePlaceholder[outline.rootID]);
        }
    },
    linePlaceAnim: function(outline) {
        var r = this.runtime;
        if (r.useLinePlaceholderAnim[outline.rootID]) {
            var speed, startOldHeight, endNewHeight, sameHeight=false;
            if (this.options.anim==='delete') {speed = this.deleteSpeed;}
            else if (this.options.anim==='create') {speed = this.createSpeed;}
            else {speed = this.placeholderSpeed;}
            if (r.rOldLinePlaceholder[outline.rootID]) {
                startOldHeight = r.rOldLinePlaceholder[outline.rootID].clientHeight;
            }
            if (r.rNewLinePlaceholder[outline.rootID]) {
                endNewHeight = r.activeLineHeight[outline.rootID];
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
            r.animOptions.view[outline.rootID] = {
                rootID: outline.rootID,
                startOldHeight: startOldHeight,
                endNewHeight: endNewHeight,
                sameHeight: sameHeight
            };
            // console.log("Updating status after finishing async sourceAnim:"+outline.rootID);
        }
    },
    // animation-step if the oldLinePlaceholder is animated
    oldLinePlaceAnimStep: function(frac, o) {
        var startOldHeight = o.startOldHeight, rootID = o.rootID;
        $(this.runtime.rOldLinePlaceholder[rootID]).css('height',
            String(Math.round(startOldHeight*(1-frac)))+'px');
    },

    newLinePlaceAnimStep: function(frac, o) {
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

};