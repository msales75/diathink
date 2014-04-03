///<reference path="Action.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
m_require("app/actions/Action.js");

var AnimatedAction = (function (_super) {
    __extends(AnimatedAction, _super);
    function AnimatedAction() {
        _super.apply(this, arguments);
    }
    // Extensible subroutines
    AnimatedAction.prototype.createDockElem = function () {
    };
    AnimatedAction.prototype.dockAnim = function (newRoot) {
    };
    AnimatedAction.prototype.panelPrep = function () {
    };
    AnimatedAction.prototype.oldLinePlace = function (v) {
    };
    AnimatedAction.prototype.newLinePlace = function (v) {
    };
    AnimatedAction.prototype.linePlaceAnim = function (v) {
    };
    AnimatedAction.prototype.oldLinePlaceAnimStep = function (f, v) {
    };
    AnimatedAction.prototype.newLinePlaceAnimStep = function (f, v) {
    };
    AnimatedAction.prototype.dockAnimStep = function (f, o) {
    };
    AnimatedAction.prototype.animFadeEnv = function (f, o) {
    };

    AnimatedAction.prototype.animStepWrapper = function (f, duration, start, end) {
        var self = this;
        var frac = ((new Date()).getTime() - start) / duration;
        if (frac >= 1) {
            frac = 1;
        }
        f(frac);
        if (frac === 1) {
            end();
        } else {
            setTimeout(function () {
                self.animStepWrapper(f, duration, start, end);
            }, 20);
        }
    };

    AnimatedAction.prototype.animSetup = function () {
        var that = this;
        var r = this.runtime;
        this.addQueue('createDockElem', ['context'], function () {
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
            ], function () {
                that.dockAnim(newRoot);
            });
        } else {
            console.log('Skipping dockAnim because performDock=false, anim=' + this.options.anim);
            that.runtime.status.dockAnim = 2;
        }
        this.addQueue('panelPrep', ['context'], function () {
            that.panelPrep();
        });
        var outlines = OutlineManager.outlines;
        var i;
        for (i in outlines) {
            (function (i) {
                that.addQueue(['oldLinePlace', i], ['createDockElem'], function () {
                    that.oldLinePlace(outlines[i]);
                });
                that.addQueue(['newLinePlace', i], ['context', ['oldLinePlace', i]], function () {
                    that.newLinePlace(outlines[i]);
                });
                that.addQueue(['linePlaceAnim', i], [
                    ['oldLinePlace', i],
                    ['newLinePlace', i]
                ], function () {
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
        this.addAsync('anim', animDeps, function () {
            if (r.performDock || _.contains(r.useLinePlaceholderAnim, true)) {
                var time = 200;
                var start = (new Date()).getTime();
                setTimeout(function () {
                    that.animStepWrapper(function (f) {
                        that.animStep(f);
                    }, time, start, function () {
                        that.runtime.status.anim = 2;
                        that.nextQueue();
                    });
                }, 0);
            } else {
                that.runtime.status.anim = 2;
                that.nextQueue();
            }
        });
    };

    // Used for all animation-frame-steps
    AnimatedAction.prototype.animStep = function (frac) {
        var i, r = this.runtime, o = this.runtime.animOptions;

        // loop over all outlines
        var outlines = OutlineManager.outlines;
        if (o.view) {
            for (i in outlines) {
                if (!o.view[i]) {
                    continue;
                }
                if (r.rUseOldLinePlaceholder[i]) {
                    this.oldLinePlaceAnimStep(frac, o.view[i]);
                }
                if (r.rUseNewLinePlaceholder[i]) {
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
    };

    // SHOW methods - various visualization actions,
    //  often overriden by each action-type
    AnimatedAction.prototype._showDisplacement = function () {
        // animate appearance/disappearance of a line
    };

    AnimatedAction.prototype._showFinalization = function () {
        // animate indicating completion of an action (e.g. double-blink)
    };

    AnimatedAction.prototype._showDifference = function () {
        // like arrows showing movement, might include user/time display
    };

    AnimatedAction.prototype._showDrag = function () {
        // or text slide or cross-out
    };

    AnimatedAction.prototype._showHiddenChange = function () {
        // for edits on invisible or minimized areas
    };

    AnimatedAction.prototype._showOffscreen = function () {
        // show annotation for changes above/below the scroll-area
    };

    AnimatedAction.prototype._focusScroll = function () {
        // scroll the view to show the new location
    };

    AnimatedAction.prototype._focusCursor = function () {
    };

    AnimatedAction.prototype._showKeystroke = function () {
        // for tutorials
    };
    return AnimatedAction;
})(Action);
//# sourceMappingURL=AnimatedAction.js.map
