///<reference path="Action.ts"/>
m_require("app/actions/Action.js");
class AnimatedAction extends Action {
    dropSource:DropSource; // defined by instantiation
    dropTarget:DropTarget;

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
        var outlines = OutlineRootView.outlinesById;
        var i:string;
        this.addQueue(['createDockElem'], [['context']], function() {
            if (that.dropSource && !that.options.dockElem && that.runtime.rNewModelContext) {
                that.options.dockElem = that.dropSource.createDockElem();
            }
        });
        this.addQueue(['createUniqueSourcePlace'], [['createDockElem']], function() {
            if (that.dropSource) {
                that.dropSource.createUniquePlaceholder();
            }
        });
        this.addQueue(['createUniqueTargetPlace'], [['createUniqueSourcePlace']], function() {
            if (that.dropTarget) {
                that.dropTarget.createUniquePlaceholder();
            }
        });
        var origplaceholders = [['createUniqueSourcePlace'], ['createUniqueTargetPlace']];
        var placeholders = [['createUniqueSourcePlace'], ['createUniqueTargetPlace']];
        for (i in outlines) {
            (function(i) {
                that.addQueue(['oldLinePlace', i], origplaceholders, function() {
                    if (that.dropSource) {
                        that.dropSource.createViewPlaceholder(outlines[i]);
                    }
                });
                that.addQueue(['newLinePlace', i],
                    _.extend([['oldLinePlace', i]], origplaceholders), function() {
                        if (that.dropTarget) {
                            that.dropTarget.createViewPlaceholder(outlines[i]);
                        }
                    });
                placeholders.push(['oldLinePlace',i]);
                placeholders.push(['newLinePlace',i]);
            })(i);
        }
        this.addQueue('setupPlaceholderAnim',
            _.extend([['context'], ['createDockElem']], placeholders),
            function() {
            if (that.dropSource) {
                that.dropSource.setupPlaceholderAnim();
            }
            if (that.dropTarget) {
                that.dropTarget.setupPlaceholderAnim();
            }
        });

        this.addQueue('setupDockAnim', placeholders, function() {
            if (that.dropTarget) {
                that.dropTarget.setupDockAnim(that.options.dockElem);
            }
        });

        this.addAsync('anim', [['setupPlaceholderAnim'],['setupDockAnim']], function() {
            if (true) {
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
    animCleanup() {
        var that = this;
        var views = [];
        var o:string;
        var outlines = OutlineRootView.outlinesById;
        for (o in outlines) {
            views.push(['view', o]);
        }
        this.addQueue('animCleanup', _.extend(['anim'],views), function() {
            if (that.dropSource) {
                that.dropSource.cleanup();
            }
            if (that.dropTarget) {
                that.dropTarget.cleanup();
            }
            that.options.dockElem = null;
        });
    }

    // Used for all animation-frame-steps
    animStep(frac:number) {
        if (this.dropSource) {
            this.dropSource.placeholderAnimStep(frac);
        }
        if (this.dropTarget) {
            this.dropTarget.placeholderAnimStep(frac);
            this.dropTarget.dockAnimStep(frac);
            this.dropTarget.fadeAnimStep(frac);
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

