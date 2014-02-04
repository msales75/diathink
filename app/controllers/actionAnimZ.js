diathink.animHelpers = {

    // Used for all animation-frame-steps
    animStep: function(frac) {
        var i, r = this.runtime, o = this.runtime.animOptions;
        // loop over all outlines
        var outlines = diathink.OutlineManager.outlines;
        if (o.view) {
            for (i in outlines) {
                if (!o.view[i]) {continue;}
                if (r.rOldLinePlaceholder[i]) {// visually collapse old line
                    this.oldLinePlaceAnimStep(frac, o.view[i]);
                }
                if (r.rNewLinePlaceholder[i]) {// visually expand new line
                    this.newLinePlaceAnimStep(frac, o.view[i]);
                }
                if (this.oldType==='panel') {

                }
            }
        }
        if (o.dock) {
            this.dockAnimStep(frac, o);
            this.animFadeEnv(frac, o);
        }
    }

};

_.extend(diathink.animHelpers, diathink.animDock,
    diathink.animPanel, diathink.animPlaceholder);

