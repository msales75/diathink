///<reference path="../../frameworks/m.ts"/>
///<reference path="ScrollEasing.ts"/>
///<reference path="DragHandler.ts"/>
function getCurrentTime() {
    return (new Date()).getTime();
}

var ScrollHandler = (function () {
    function ScrollHandler(opts) {
        this.options = {
            element: null,
            fps: 60,
            direction: 'y',
            scrollDuration: 2000,
            overshootDuration: 250,
            snapbackDuration: 500,
            moveThreshold: 10,
            moveIntervalThreshold: 150,
            scrollMethod: "translate",
            startEventName: "scrollstart",
            updateEventName: "scrollupdate",
            stopEventName: "scrollstop",
            eventType: 'ontouchstart' in document.documentElement ? "touch" : "mouse",
            showScrollBars: true,
            pagingEnabled: false,
            delayedClickSelector: "a,input,textarea,select,button,.ui-btn"
        };
        this.options = _.extend(this.options, opts);
        this.element = this.options.element;
        this._create();
    }
    ScrollHandler.prototype._makePositioned = function ($ele) {
        if ($ele.css("position") == "static")
            $ele.css("position", "relative");
    };

    ScrollHandler.prototype._create = function () {
        // todo: move this DOM manipulation into static rendering with constraints
        this._$clip = $(this.element).addClass("ui-scrollview-clip");
        var $child = this._$clip.children();
        if ($child.length > 1) {
            $child = this._$clip.wrapInner("<div></div>").children();
        }
        this._$view = $child.addClass("ui-scrollview-view");
        this._makePositioned(this._$clip);
        this._$view.css("overflow", "hidden");
        this._makePositioned(this._$view);
        this._$view.css({ left: 0, top: 0 });

        // MS hack to make overflow-x visible
        // this._$clip.css("overflow-y", this.options.scrollMethod === "scroll" ? "scroll" : "hidden");
        // Turn off our faux scrollbars if we are using native scrolling
        // to position the view.
        this.options.showScrollBars = this.options.scrollMethod === "scroll" ? false : this.options.showScrollBars;

        // We really don't need this if we are using a translate transformation
        // for scrolling. We set it just in case the user wants to switch methods
        // on the fly.
        this._sx = 0;
        this._sy = 0;

        var direction = this.options.direction;
        this._hTracker = (direction !== "y") ? new MomentumTracker(this.options) : null;
        this._vTracker = (direction !== "x") ? new MomentumTracker(this.options) : null;

        this._timerInterval = 1000 / this.options.fps;
        this._timerID = 0;

        var self = this;
        this._timerCB = function () {
            self._handleMomentumScroll();
        };

        this._addBehaviors();
    };

    ScrollHandler.prototype._startMScroll = function (speedX, speedY) {
        this._stopMScroll();
        this._showScrollBars();

        var keepGoing = false;
        var duration = this.options.scrollDuration;

        this._$clip.trigger(this.options.startEventName);

        var ht = this._hTracker;
        if (ht) {
            var c = this._$clip.width();
            var v = this._$view.width();
            ht.start(this._sx, speedX, duration, (v > c) ? -(v - c) : 0, 0);
            keepGoing = !ht.done();
        }

        var vt = this._vTracker;
        if (vt) {
            var c = this._$clip.height();
            var v = this._$view.height();
            vt.start(this._sy, speedY, duration, (v > c) ? -(v - c) : 0, 0);
            keepGoing = keepGoing || !vt.done();
        }

        if (keepGoing)
            this._timerID = setTimeout(this._timerCB, this._timerInterval);
        else
            this._stopMScroll();
    };

    ScrollHandler.prototype._stopMScroll = function () {
        if (this._timerID) {
            this._$clip.trigger(this.options.stopEventName);
            clearTimeout(this._timerID);
        }
        this._timerID = 0;

        if (this._vTracker)
            this._vTracker.reset();

        if (this._hTracker)
            this._hTracker.reset();

        this._hideScrollBars();
    };

    ScrollHandler.prototype._handleMomentumScroll = function () {
        var keepGoing = false;

        var x = 0, y = 0;

        var vt = this._vTracker;
        if (vt) {
            vt.update();
            y = vt.getPosition();
            keepGoing = !vt.done();
        }

        var ht = this._hTracker;
        if (ht) {
            ht.update();
            x = ht.getPosition();
            keepGoing = keepGoing || !ht.done();
        }

        this._setScrollPosition(x, y);
        this._$clip.trigger(this.options.updateEventName, { x: x, y: y });

        if (keepGoing)
            this._timerID = setTimeout(this._timerCB, this._timerInterval);
        else
            this._stopMScroll();
    };

    ScrollHandler.prototype._setScrollPosition = function (x, y) {
        this._sx = x;
        this._sy = y;

        var $v = this._$view;

        var sm = this.options.scrollMethod;

        switch (sm) {
            case "translate":
                this.setElementTransform($v, x + "px", y + "px");
                this._$clip[0].scrollTop = 0; // MS fix for scrollTop drifting
                break;
            case "position":
                $v.css({ left: x + "px", top: y + "px" });
                break;
            case "scroll":
                var c = this._$clip[0];
                alert('Changing scrollTop via scrollview!');
                c.scrollLeft = -x;
                c.scrollTop = -y;
                break;
        }
        var $vsb = this._$vScrollBar;
        var $hsb = this._$hScrollBar;

        if ($vsb) {
            var $sbt = $vsb.find(".ui-scrollbar-thumb");
            if (sm === "translate")
                this.setElementTransform($sbt, "0px", -y / $v.height() * $sbt.parent().height() + "px");
            else
                $sbt.css("top", -y / $v.height() * 100 + "%");
        }

        if ($hsb) {
            var $sbt = $hsb.find(".ui-scrollbar-thumb");
            if (sm === "translate")
                this.setElementTransform($sbt, -x / $v.width() * $sbt.parent().width() + "px", "0px");
            else
                $sbt.css("left", -x / $v.width() * 100 + "%");
        }
        /*
        if (this.options.updateScroll) {
        this.options.updateScroll();
        }
        */
    };

    ScrollHandler.prototype.scrollTo = function (x, y, duration) {
        this._stopMScroll();
        if (!duration) {
            this._setScrollPosition(x, y);
            return;
        }

        x = -x;
        y = -y;

        var self = this;
        var start = getCurrentTime();
        var efunc = ScrollEasing.easeOutQuad;
        var sx = this._sx;
        var sy = this._sy;
        var dx = x - sx;
        var dy = y - sy;
        var tfunc = function () {
            var elapsed = getCurrentTime() - start;
            if (elapsed >= duration) {
                self._timerID = 0;
                self._setScrollPosition(x, y);
            } else {
                var ec = efunc(elapsed / duration, elapsed, 0, 1, duration);
                self._setScrollPosition(sx + (dx * ec), sy + (dy * ec));
                self._timerID = setTimeout(tfunc, self._timerInterval);
            }
        };

        this._timerID = setTimeout(tfunc, this._timerInterval);
    };

    ScrollHandler.prototype.getScrollPosition = function () {
        return { x: -this._sx, y: -this._sy };
    };

    ScrollHandler.prototype._getScrollHierarchy = function () {
        var svh = [];

        // this._$clip.parents(".ui-scrollview-clip").each(function () {
        //     var d = $(this).data("scrollview");
        //     if (d) svh.unshift(d);
        // });
        return svh;
    };

    ScrollHandler.prototype._getAncestorByDirection = function (dir) {
        var svh = this._getScrollHierarchy();
        var n = svh.length;
        while (0 < n--) {
            var sv = svh[n];
            var svdir = sv.options.direction;

            if (!svdir || svdir == dir)
                return sv;
        }
        return null;
    };

    ScrollHandler.prototype.scrollStart = function (params) {
        var ex = params.pos.left, ey = params.pos.top;

        $D.log(['scroll', 'debug'], 'Starting drag-scroll at ' + ex + 'x' + ey);

        // Stop any scrolling of elements in our parent hierarcy.
        $.each(this._getScrollHierarchy(), function (i, sv) {
            sv._stopMScroll();
        });
        this._stopMScroll();

        var c = this._$clip;
        var v = this._$view;
        this._lastX = ex;
        this._lastY = ey;
        this._doSnapBackX = false;
        this._doSnapBackY = false;
        this._speedX = 0;
        this._speedY = 0;
        this._directionLock = "";
        this._didDrag = false;

        if (this._hTracker) {
            var cw = parseInt(c.css("width"), 10);
            var vw = parseInt(v.css("width"), 10);
            this._maxX = cw - vw;
            if (this._maxX > 0)
                this._maxX = 0;
            if (this._$hScrollBar)
                this._$hScrollBar.find(".ui-scrollbar-thumb").css("width", (cw >= vw ? "100%" : Math.floor(cw / vw * 100) + "%"));
        }

        if (this._vTracker) {
            var ch = parseInt(c.css("height"), 10);
            var vh = parseInt(v.css("height"), 10);
            this._maxY = ch - vh;
            if (this._maxY > 0)
                this._maxY = 0;
            if (this._$vScrollBar)
                this._$vScrollBar.find(".ui-scrollbar-thumb").css("height", (ch >= vh ? "100%" : Math.floor(ch / vh * 100) + "%"));
        }

        var svdir = this.options.direction;

        this._pageDelta = 0;
        this._pageSize = 0;
        this._pagePos = 0;

        if (this.options.pagingEnabled && (svdir === "x" || svdir === "y")) {
            this._pageSize = svdir === "x" ? cw : ch;
            this._pagePos = svdir === "x" ? this._sx : this._sy;
            this._pagePos -= this._pagePos % this._pageSize;
        }
        this._lastMove = 0;
        // If we're using mouse events, we need to prevent the default
        // behavior to suppress accidental selection of text, etc. We
        // can't do this on touch devices because it will disable the
        // generation of "click" events.
        //
        // XXX: We should test if this has an effect on links! - kin
        // TODO: MS We can't prevent-default on textarea if we want to place cursor correctly.
        // MS edit to allow default at this point, but might prevent it after bubbling to doc.
        // if (this.options.eventType == "mouse" || this.options.delayedClickEnabled)
        // e.preventDefault();
        // e.stopPropagation(); // MS edit to enable propogation of mousedown events
    };

    ScrollHandler.prototype._propagateDragMove = function (sv, params, dir) {
        this._hideScrollBars();

        // this._disableTracking();
        sv._handleDragStart(params);
        sv._directionLock = dir;
        sv._didDrag = this._didDrag;
    };

    // MS addition for drag-scrolling
    //  todo: stop quickly when mouse-drag-direction changes
    ScrollHandler.prototype.scrollWhileDragging = function (ey) {
        var cheight = this._$clip.height();
        var vheight = this._$view.height();
        if (this._lastY == null) {
            this._lastY = ey;
            $D.log(['scroll', 'debug'], "Initialized lastY for scrollWhileDragging");
            return;
        }
        this._maxY = cheight - vheight;
        if (this._maxY > 0)
            this._maxY = 0;
        var dy = ey - this._lastY;
        var dt = getCurrentTime() - this._lastMove;
        var sy = 0;
        var frac = ey / cheight;
        this._doSnapBackY = false;

        // console.log("Examining motion with dy = "+dy+", frac = "+frac+", dt = "+dt);
        var stop = true;
        if (frac < 0.12) {
            if (this._sy >= 0) {
                // follow mouse/2 pattern
                this._doSnapBackY = true;
                $D.log(['scroll', 'debug'], "Doing snapback over top frac=" + frac + "; sy=" + this._sy + "; ey=" + ey);
            } else if (dy <= 0) {
                stop = false;
                sy = -30 * dy / dt;
                if (sy > 20) {
                    sy = 20;
                }
                $D.log(['scroll', 'debug'], "Scrolling up with frac=" + frac + "; dy = " + dy + "; dt = " + dt);
            }
        } else if (frac > 0.88) {
            if (this._sy <= this._maxY) {
                // follow mouse-2 pattern
                this._doSnapBackY = true;
                $D.log(['scroll', 'debug'], "Doing snapback with frac=" + frac + "; sy=" + this._sy + "; ey=" + ey);
            } else if (dy >= 0) {
                stop = false;
                sy = -30 * dy / dt;
                if (sy < -20) {
                    sy = -20;
                }
                $D.log(['scroll', 'debug'], "Scrolling down with frac=" + frac + "; dy = " + dy + "; dt = " + dt);
            }
        } else {
            $D.log(['scroll', 'debug'], "No scroll with frac=" + frac + "; ey=" + ey);
        }
        this._stopMScroll();
        if (!stop) {
            $D.log(['scroll', 'debug'], "Momemtum scroll set to sy= " + sy + "; ey=" + ey);
            this._startMScroll(0, sy);
            this._didDrag = true;
        } else {
            $D.log(['scroll', 'debug'], "Hiding scrollbars with sy=0; ey=" + ey);
            this._hideScrollBars();
        }
        this._lastMove = getCurrentTime();
        this._lastY = ey;
        return false;
    };

    ScrollHandler.prototype.scrollMove = function (params) {
        var ex = params.pos.left, ey = params.pos.top;
        this._lastMove = getCurrentTime();

        var dx = ex - this._lastX;
        var dy = ey - this._lastY;
        var svdir = this.options.direction;

        if (!this._directionLock) {
            var x = Math.abs(dx);
            var y = Math.abs(dy);
            var mt = this.options.moveThreshold;

            if (x < mt && y < mt) {
                return false;
            }

            var dir = null;
            if (x < y && (x / y) < 0.5) {
                dir = "y";
            } else if (x > y && (y / x) < 0.5) {
                dir = "x";
            }

            if (svdir && dir && svdir != dir) {
                // This scrollview can't handle the direction the user
                // is attempting to scroll. Find an ancestor scrollview
                // that can handle the request.
                var sv = this._getAncestorByDirection(dir);
                if (sv) {
                    this._propagateDragMove(sv, params, dir);
                    return false;
                }
            }

            this._directionLock = svdir ? svdir : (dir ? dir : "none");
        }

        var newX = this._sx;
        var newY = this._sy;

        if (this._directionLock !== "y" && this._hTracker) {
            var x = this._sx;
            this._speedX = dx;
            newX = x + dx;

            // Simulate resistance.
            this._doSnapBackX = false;
            if (newX > 0 || newX < this._maxX) {
                if (this._directionLock === "x") {
                    var sv = this._getAncestorByDirection("x");
                    if (sv) {
                        this._setScrollPosition(newX > 0 ? 0 : this._maxX, newY);
                        this._propagateDragMove(sv, params, dir);
                        return false;
                    }
                }
                newX = x + (dx / 2);
                this._doSnapBackX = true;
            }
        }

        if (this._directionLock !== "x" && this._vTracker) {
            var y = this._sy;
            this._speedY = dy;
            newY = y + dy;

            // Simulate resistance.
            this._doSnapBackY = false;
            if (newY > 0 || newY < this._maxY) {
                if (this._directionLock === "y") {
                    var sv = this._getAncestorByDirection("y");
                    if (sv) {
                        this._setScrollPosition(newX, newY > 0 ? 0 : this._maxY);
                        this._propagateDragMove(sv, params, dir);
                        return false;
                    }
                }

                newY = y + (dy / 2);
                this._doSnapBackY = true;
            }
        }

        if (this.options.pagingEnabled && (svdir === "x" || svdir === "y")) {
            if (this._doSnapBackX || this._doSnapBackY)
                this._pageDelta = 0;
            else {
                var opos = this._pagePos;
                var cpos = svdir === "x" ? newX : newY;
                var delta = svdir === "x" ? dx : dy;

                this._pageDelta = (opos > cpos && delta < 0) ? this._pageSize : ((opos < cpos && delta > 0) ? -this._pageSize : 0);
            }
        }

        this._didDrag = true;
        this._lastX = ex;
        this._lastY = ey;

        this._setScrollPosition(newX, newY);

        this._showScrollBars();

        // Call preventDefault() to prevent touch devices from
        // scrolling the main window.
        // e.preventDefault();
        return false;
    };

    ScrollHandler.prototype.scrollStop = function () {
        var l = this._lastMove;
        var t = getCurrentTime();
        var doScroll = l && (t - l) <= this.options.moveIntervalThreshold;
        $D.log(['debug', 'scroll'], "Handling drag stop");

        var sx = (this._hTracker && this._speedX && doScroll) ? this._speedX : (this._doSnapBackX ? 1 : 0);
        var sy = (this._vTracker && this._speedY && doScroll) ? this._speedY : (this._doSnapBackY ? 1 : 0);

        var svdir = this.options.direction;
        if (this.options.pagingEnabled && (svdir === "x" || svdir === "y") && !this._doSnapBackX && !this._doSnapBackY) {
            var x = this._sx;
            var y = this._sy;
            if (svdir === "x")
                x = -this._pagePos + this._pageDelta;
            else
                y = -this._pagePos + this._pageDelta;

            this.scrollTo(x, y, this.options.snapbackDuration);
        } else if (sx || sy)
            this._startMScroll(sx, sy);
        else
            this._hideScrollBars();

        // this._disableTracking();
        // If a view scrolled, then we need to absorb
        // the event so that links etc, underneath our
        // cursor/finger don't fire.
        return this._didDrag ? false : undefined;
    };

    ScrollHandler.prototype._showScrollBars = function () {
        var vclass = "ui-scrollbar-visible";
        if (this._$vScrollBar)
            this._$vScrollBar.addClass(vclass);
        if (this._$hScrollBar)
            this._$hScrollBar.addClass(vclass);
    };

    ScrollHandler.prototype._hideScrollBars = function () {
        var vclass = "ui-scrollbar-visible";
        if (this._$vScrollBar)
            this._$vScrollBar.removeClass(vclass);
        if (this._$hScrollBar)
            this._$hScrollBar.removeClass(vclass);
    };

    ScrollHandler.prototype._addBehaviors = function () {
        var self = this;
        if (this.options.showScrollBars) {
            var $c = this._$clip;
            var prefix = "<div class=\"ui-scrollbar ui-scrollbar-";
            var suffix = "\"><div class=\"ui-scrollbar-track\"><div class=\"ui-scrollbar-thumb\"></div></div></div>";
            if (this._vTracker) {
                $c.append(prefix + "y" + suffix);
                this._$vScrollBar = $c.children(".ui-scrollbar-y");
            }
            if (this._hTracker) {
                $c.append(prefix + "x" + suffix);
                this._$hScrollBar = $c.children(".ui-scrollbar-x");
            }
        }
    };

    ScrollHandler.prototype.setElementTransform = function ($ele, x, y) {
        var v = "translate3d(" + x + "," + y + ", 0px)";
        $ele.css({
            "-moz-transform": v,
            "-webkit-transform": v,
            "transform": v
        });
    };
    return ScrollHandler;
})();

var tstates = {
    scrolling: 0,
    overshot: 1,
    snapback: 2,
    done: 3
};

var MomentumTracker = (function () {
    function MomentumTracker(options) {
        this.options = _.extend({}, options);
        this.easing = "easeOutQuad";
        this.reset();
    }
    MomentumTracker.prototype.start = function (pos, speed, duration, minPos, maxPos) {
        this.state = (speed != 0) ? ((pos < minPos || pos > maxPos) ? tstates.snapback : tstates.scrolling) : tstates.done;
        this.pos = pos;
        this.speed = speed;
        this.duration = (this.state == tstates.snapback) ? this.options.snapbackDuration : duration;
        this.minPos = minPos;
        this.maxPos = maxPos;

        this.fromPos = (this.state == tstates.snapback) ? this.pos : 0;
        this.toPos = (this.state == tstates.snapback) ? ((this.pos < this.minPos) ? this.minPos : this.maxPos) : 0;

        this.startTime = getCurrentTime();
    };

    MomentumTracker.prototype.reset = function () {
        this.state = tstates.done;
        this.pos = 0;
        this.speed = 0;
        this.minPos = 0;
        this.maxPos = 0;
        this.duration = 0;
    };

    MomentumTracker.prototype.update = function () {
        var state = this.state;
        if (state == tstates.done)
            return this.pos;

        var duration = this.duration;
        var elapsed = getCurrentTime() - this.startTime;
        elapsed = elapsed > duration ? duration : elapsed;

        if (state == tstates.scrolling || state == tstates.overshot) {
            var dx = this.speed * (1 - ScrollEasing[this.easing](elapsed / duration, elapsed, 0, 1, duration));

            var x = this.pos + dx;

            var didOverShoot = (state == tstates.scrolling) && (x < this.minPos || x > this.maxPos);
            if (didOverShoot)
                x = (x < this.minPos) ? this.minPos : this.maxPos;

            this.pos = x;

            if (state == tstates.overshot) {
                if (elapsed >= duration) {
                    this.state = tstates.snapback;
                    this.fromPos = this.pos;
                    this.toPos = (x < this.minPos) ? this.minPos : this.maxPos;
                    this.duration = this.options.snapbackDuration;
                    this.startTime = getCurrentTime();
                }
            } else if (state == tstates.scrolling) {
                if (didOverShoot) {
                    this.state = tstates.overshot;
                    this.speed = dx / 2;
                    this.duration = this.options.overshootDuration;
                    this.startTime = getCurrentTime();
                } else if (elapsed >= duration)
                    this.state = tstates.done;
            }
        } else if (state == tstates.snapback) {
            if (elapsed >= duration) {
                this.pos = this.toPos;
                this.state = tstates.done;
            } else
                this.pos = this.fromPos + ((this.toPos - this.fromPos) * ScrollEasing[this.easing](elapsed / duration, elapsed, 0, 1, duration));
        }

        return this.pos;
    };

    MomentumTracker.prototype.done = function () {
        return this.state == tstates.done;
    };

    MomentumTracker.prototype.getPosition = function () {
        return this.pos;
    };
    return MomentumTracker;
})();
//# sourceMappingURL=ScrollHandler.js.map
