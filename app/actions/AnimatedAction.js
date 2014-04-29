var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="Action.ts"/>
m_require("app/actions/Action.js");
var AnimatedAction = (function (_super) {
    __extends(AnimatedAction, _super);
    function AnimatedAction() {
        _super.apply(this, arguments);
    }
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
        var outlines = OutlineRootView.outlinesById;
        var i;
        this.addQueue(['createDockElem'], [['context']], function () {
            if (that.dropSource && !that.options.dockElem && that.runtime.rNewModelContext) {
                that.options.dockElem = that.dropSource.createDockElem();
            }
        });
        this.addQueue(['createUniqueSourcePlace'], [['createDockElem']], function () {
            if (that.dropSource) {
                that.dropSource.createUniquePlaceholder();
            }
        });
        this.addQueue(['createUniqueTargetPlace'], [['createUniqueSourcePlace']], function () {
            if (that.dropTarget) {
                that.dropTarget.createUniquePlaceholder();
            }
        });
        var origplaceholders = [['createUniqueSourcePlace'], ['createUniqueTargetPlace']];
        var placeholders = [['createUniqueSourcePlace'], ['createUniqueTargetPlace']];
        for (i in outlines) {
            (function (i) {
                that.addQueue(['oldLinePlace', i], origplaceholders, function () {
                    if (that.dropSource) {
                        that.dropSource.createViewPlaceholder(outlines[i]);
                    }
                });
                that.addQueue(['newLinePlace', i], _.extend([['oldLinePlace', i]], origplaceholders), function () {
                    if (that.dropTarget) {
                        that.dropTarget.createViewPlaceholder(outlines[i]);
                    }
                });
                placeholders.push(['oldLinePlace', i]);
                placeholders.push(['newLinePlace', i]);
            })(i);
        }
        this.addQueue('setupPlaceholderAnim', _.extend([['context'], ['createDockElem']], placeholders), function () {
            if (that.dropSource) {
                that.dropSource.setupPlaceholderAnim();
            }
            if (that.dropTarget) {
                that.dropTarget.setupPlaceholderAnim();
            }
        });

        this.addQueue('setupDockAnim', placeholders, function () {
            if (that.dropTarget) {
                that.dropTarget.setupDockAnim(that.options.dockElem);
            }
        });

        this.addAsync('anim', [['setupPlaceholderAnim'], ['setupDockAnim']], function () {
            if (true) {
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
    AnimatedAction.prototype.animCleanup = function () {
        var that = this;
        var views = [];
        var o;
        var outlines = OutlineRootView.outlinesById;
        for (o in outlines) {
            views.push(['view', o]);
        }
        this.addQueue('animCleanup', _.extend(['anim'], views), function () {
            if (that.dropSource) {
                that.dropSource.cleanup();
            }
            if (that.dropTarget) {
                that.dropTarget.cleanup();
            }
            that.options.dockElem = null;
        });
    };

    // Used for all animation-frame-steps
    AnimatedAction.prototype.animStep = function (frac) {
        if (this.dropSource) {
            this.dropSource.placeholderAnimStep(frac);
        }
        if (this.dropTarget) {
            this.dropTarget.placeholderAnimStep(frac);
            this.dropTarget.dockAnimStep(frac);
            this.dropTarget.fadeAnimStep(frac);
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
