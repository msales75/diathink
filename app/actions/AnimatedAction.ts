///<reference path="Action.ts"/>
m_require("app/actions/Action.js");
class AnimatedAction extends Action {
    disableAnimation:boolean = false;
    dropSource:DropSource; // defined by instantiation
    dropTarget:DropTarget;
    useAnim:boolean = true;
    usePostAnim:boolean = false;

    runinit() {
        super.runinit();
        _.extend(this.runtime, {
            oldLineContext: {},
            status: {
                context: 0,
                log: 0,
                undobuttons: 0,
                oldModelCollection: 0,
                oldModelRemove: 0,
                modelCreate: 0,
                newModelRank: 0,
                newModelAdd: 0,
                focus: 0,
                end: 0,
                createDockElem: 0,
                dockAnim: 0,
                anim: 0,
                anim2: 0,
                uniqueView: 0,
                view: {},
                oldLinePlace: {},
                newLinePlace: {}
            }
        });
    }
    animStepWrapper(f, duration, start, end, n) {
        var self:AnimatedAction = this;
        if (!n) {n=1;}
        var frac = ((new Date()).getTime() - start) / duration;
        if (frac > n/6) {frac = n/6;}
        if (frac >= 1) {
            frac = 1;
        }
        f(frac);
        if (frac === 1) {
            end();
        } else {
            setTimeout(function() {
                self.animStepWrapper(f, duration, start, end, n+1);
            }, 20);
        }
    }

    animSetup() {
        if (this.disableAnimation) {
            this.runtime.status.anim = 2;
            return;
        }
        var that = this;
        var r:RuntimeOptions = this.runtime;
        var outlines = OutlineRootView.outlinesById;
        var i:string;
        this.addQueue(['createDockElem'], [['context']], function() {
            if (that.dropSource) {
                that.options.dockView = that.dropSource.createDockElem();
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
                that.dropTarget.setupDockAnim(that.options.dockView);
            }
        });

        this.addAsync('anim', [['setupPlaceholderAnim'],['setupDockAnim']], function() {
            if (that.useAnim) {
                var time = 150; // was 1000
                if (that.options.speed) {time = that.options.speed;}
                var start = (new Date()).getTime();
                setTimeout(function() {
                    that.animStepWrapper(function(f) {
                        that.animStep(f);
                    }, time, start, function() {
                        that.runtime.status.anim = 2;
                        that.nextQueue();
                    }, 1);
                }, 0);
            } else {
                that.runtime.status.anim = 2;
                that.nextQueue();
            }
        });
    }
    animCleanup() {
        if (this.disableAnimation) {
            this.runtime.status.animCleanup = 2;
            return;
        }
        var that = this;
        var views = [];
        var o:string;
        var outlines = OutlineRootView.outlinesById;
        views = [['uniqueView']];
        for (o in outlines) {
            views.push(['view', o]);
        }
        this.addAsync(['anim2'],  _.extend(['anim'],views), function() {
            if (that.usePostAnim) {
                that.anim2setup();
                var time = 150; // was 100
                if (that.options.speed) {time = that.options.speed;}
                var start = (new Date()).getTime();
                setTimeout(function() {
                    that.animStepWrapper(function(f) {
                        that.anim2Step(f);
                    }, time, start, function() {
                        that.runtime.status.anim2 = 2;
                        that.nextQueue();
                    }, 1);
                }, 0);
            } else {
                that.runtime.status.anim2 = 2;
                that.nextQueue();
            }
        });
        this.addQueue('animCleanup', ['anim2'], function() {
            // console.log("starting animCleanup**");
            if (that.dropSource) {
                that.dropSource.cleanup();
                that.dropSource = null;
            }
            if (that.dropTarget) {
                that.dropTarget.cleanup();
                that.dropTarget = null;
            }
            that.options.dockView = null;
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
    anim2setup() {
        if (this.dropSource) {
            this.dropSource.postAnimSetup();
        }
        if (this.dropTarget) {
            this.dropSource.postAnimSetup();
        }
    }
    anim2Step(frac:number) {
        if (this.dropSource) {
            this.dropSource.postAnimStep(frac);
        }
        if (this.dropTarget) {
            this.dropSource.postAnimStep(frac);
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

