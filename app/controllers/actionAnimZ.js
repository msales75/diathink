diathink.animHelpers = {

    animSetup: function() {
        var that = this;
        var r = this.runtime;
        this.addQueue('createDockElem', ['context'], function() {
            if (r.createDockElem) {
                that.createDockElem();
            }
        });

        if (r.performDock) {
            var newRoot = r.rNewRoot;
            console.log("Using newRoot = "+newRoot);
            this.addQueue('dockAnim', [['newLinePlace', newRoot], ['oldLinePlace', newRoot]], function () {
                that.dockAnim(newRoot);
            });
        } else {
            console.log('Skipping dockAnim because performDock=false, anim='+ this.options.anim);
            that.runtime.status.dockAnim = 2;
        }

        this.addQueue('panelPrep', ['context'], function() {
            that.panelPrep();
        });
        var outlines = diathink.OutlineManager.outlines;
        for (i in outlines) {
            (function(i) {
                that.addQueue(['oldLinePlace', i], ['createDockElem'], function() {
                    that.oldLinePlace(outlines[i]);
                });
                that.addQueue(['newLinePlace', i], ['context', ['oldLinePlace', i]], function() {
                    that.newLinePlace(outlines[i]);
                });
                that.addQueue(['linePlaceAnim', i], [['oldLinePlace', i], ['newLinePlace', i]], function() {
                    if (r.useLinePlaceholderAnim[i]) {
                        that.linePlaceAnim(outlines[i]);
                    }
                });
            })(i);
        }
        var animDeps = [];
        for (i in outlines) {
            animDeps.push(['linePlaceAnim', i]);
        }
        animDeps.push('dockAnim');
        this.addAsync('anim', animDeps, function() {
            if (r.performDock || _.contains(r.useLinePlaceholderAnim, true)) {
                var time = 200; // todo: this should vary.
                $.anim(function(f) {
                    that.animStep(f);
                }, time, function() {
                    that.runtime.status.anim = 2;
                    that.nextQueue();
                });
            } else {
                that.runtime.status.anim = 2;
                that.nextQueue();
            }
        });
    },
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
    },

    // SHOW methods - various visualization actions,
    //  often overriden by each action-type
    _showDisplacement:function () {
        // animate appearance/disappearance of a line
    },
    _showFinalization:function () {
        // animate indicating completion of an action (e.g. double-blink)
    },
    _showDifference:function () {
        // like arrows showing movement, might include user/time display
    },
    _showDrag:function () {
        // or text slide or cross-out
    },
    _showHiddenChange:function () {
        // for edits on invisible or minimized areas
    },
    _showOffscreen:function () {
        // show annotation for changes above/below the scroll-area
    },
    _focusScroll:function () {
        // scroll the view to show the new location
    },
    _focusCursor:function () {

    },
    _showKeystroke:function () {
        // for tutorials
    }
};

_.extend(diathink.animHelpers, diathink.animDock);
_.extend(diathink.animHelpers, diathink.animPlaceholder);
_.extend(diathink.animHelpers, diathink.animPanel);

