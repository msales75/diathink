///<reference path="Action.ts"/>

m_require("app/actions/Action.js");

class AnimatedAction extends Action {

    // Extensible subroutines
    createDockElem() {}
    dockAnim(newRoot:string) {}
    panelPrep() {}
    oldLinePlace(v:OutlineRootView) {}
    newLinePlace(v:OutlineRootView) {}
    linePlaceAnim(v:OutlineRootView) {}
    oldLinePlaceAnimStep(f:number, v:AnimViewOptions) {}
    newLinePlaceAnimStep(f:number, v:AnimViewOptions) {}
    dockAnimStep(f:number, o:AnimOptions) {}
    animFadeEnv(f:number, o:AnimOptions) {}


    animStepWrapper(f, duration, start, end) {
        var self:AnimatedAction = this;
        var frac = ((new Date()).getTime() - start) / duration;
        if (frac >= 1) {
            frac = 1;
        }
        f(frac);
        if (frac === 1) {
            end();
        } else {
            setTimeout(function() {
                self.animStepWrapper(f, duration, start, end);
            }, 20);
        }
    }

    animSetup() {
        var that = this;
        var r:RuntimeOptions = this.runtime;
        this.addQueue('createDockElem', ['context'], function() {
            if (r.createDockElem) {
                that.createDockElem();
            }
        });
        if (r.performDock) {
            var newRoot = r.rNewRoot;
            console.log("Using newRoot = " + newRoot);
            this.addQueue('dockAnim', [
                ['newLinePlace', newRoot],
                ['oldLinePlace', newRoot]
            ], function() {
                that.dockAnim(newRoot);
            });
        } else {
            console.log('Skipping dockAnim because performDock=false, anim=' + this.options.anim);
            that.runtime.status.dockAnim = 2;
        }
        this.addQueue('panelPrep', ['context'], function() {
            that.panelPrep();
        });
        var outlines = OutlineRootView.outlinesById;
        var i:string;
        for (i in outlines) {
            (function(i) {
                that.addQueue(['oldLinePlace', i], ['createDockElem'], function() {
                    that.oldLinePlace(outlines[i]);
                });
                that.addQueue(['newLinePlace', i], ['context', ['oldLinePlace', i]], function() {
                    that.newLinePlace(outlines[i]);
                });
                that.addQueue(['linePlaceAnim', i], [
                    ['oldLinePlace', i],
                    ['newLinePlace', i]
                ], function() {
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
                var start = (new Date()).getTime();
                setTimeout(function() {
                    that.animStepWrapper(function(f) {
                        that.animStep(f);
                    }, time, start, function() {
                        that.runtime.status.anim = 2;
                        that.nextQueue();
                    });
                }, 0);
            } else {
                that.runtime.status.anim = 2;
                that.nextQueue();
            }
        });
    }

    // Used for all animation-frame-steps
    animStep(frac:number) {
        var i, r:RuntimeOptions = this.runtime,
            o:AnimOptions = this.runtime.animOptions;
        // loop over all outlines
        var outlines = OutlineRootView.outlinesById;
        if (o.view) {
            for (i in outlines) {
                if (!o.view[i]) {
                    continue;
                }
                if (r.rUseOldLinePlaceholder[i]) {// visually collapse old line
                    this.oldLinePlaceAnimStep(frac, o.view[i]);
                }
                if (r.rUseNewLinePlaceholder[i]) {// visually expand new line
                    this.newLinePlaceAnimStep(frac, o.view[i]);
                }
                if (this.oldType === 'panel') {
                }
            }
        }
        if (o.dock) {
            this.dockAnimStep(frac, o);
            this.animFadeEnv(frac, o);
        }
    }

    // SHOW methods - various visualization actions,
    //  often overriden by each action-type
    _showDisplacement() {
        // animate appearance/disappearance of a line
    }

    _showFinalization() {
        // animate indicating completion of an action (e.g. double-blink)
    }

    _showDifference() {
        // like arrows showing movement, might include user/time display
    }

    _showDrag() {
        // or text slide or cross-out
    }

    _showHiddenChange() {
        // for edits on invisible or minimized areas
    }

    _showOffscreen() {
        // show annotation for changes above/below the scroll-area
    }

    _focusScroll() {
        // scroll the view to show the new location
    }

    _focusCursor() {
    }

    _showKeystroke() {
        // for tutorials
    }
}

