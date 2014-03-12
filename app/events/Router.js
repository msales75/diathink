///<reference path="../views/View.ts"/>
///<reference path="DragHandler.ts"/>
var Router = (function () {
    function Router(rootElement, controllers) {
        this.rootElement = rootElement;
        this.controllers = controllers;
        this.dragMode = 0;
        this.scrollMode = 0;
        this.dragStart = null;
        this.lastClicked = null;
        this.doubleClickFlag = false;
        this.hoverTimer = null;
        var is_touch_device = 'ontouchstart' in document.documentElement;
        var press = is_touch_device ? 'touchstart' : 'mousedown';
        var self = this;
        this.dragger = new DragHandler();
        Router.bind(rootElement, press, function (e) {
            var preventDefault = true;
            var view = View.getFromElement(Router.getTarget(e));
            self.dragStart = {
                view: view,
                pos: Router.getPosition(e),
                time: (new Date()).getTime()
            };
            self.scrollMode = 0;
            self.dragMode = 0;
            if (view.handleView != null) {
                self.dragMode = 1;
            } else if (view.scrollView != null) {
                self.scrollMode = 1;

                // view.scrollView.scrollStart();
                if (view.nodeView != null) {
                    if (View.focusedView) {
                        if (View.focusedView !== view.nodeView) {
                            View.focusedView.header.name.text.blur(); // call view.blur()
                        }
                    }
                    View.focusedView = view.nodeView;
                    View.focusedView.header.name.text.focus();
                    if (view instanceof TextAreaView) {
                        // need native event to capture cursor position, even if we're not focusing
                        preventDefault = false;
                        self.hidingFocus = view; // todo: make sure we don't need earlier delayed-focus list?
                        view.removeClass('hide-selection');
                    } else {
                        $(view.nodeView.header.name.text.elem).addClass('hide-selection').selectText().focus().selectText();
                    }
                }
            }
            if (preventDefault) {
                e.preventDefault();
            }
        });
        var move = is_touch_device ? 'touchmove' : 'mousemove';
        Router.bind(rootElement, move, function (e) {
            if (!self.dragMode && !self.scrollMode) {
                return;
            }
            var params = Router.getEventParams(e);
            if (self.dragMode === 2) {
                self.dragger.dragMove(params);
                return;
            } else if (self.scrollMode === 2) {
                //self.dragStart.view.scrollView.scrollMove(params);
                return;
            }
            if (self.dragMode === 1) {
                if (self.testDragStart(params)) {
                    self.dragMode = 2; // we are definitely dragging
                    self.dragger.dragStart(self.dragStart);
                }
            } else if (self.scrollMode === 1) {
                if (self.testScrollStart(params)) {
                    self.scrollMode = 2;
                    // self.dragStart.view.scrollView.scrollStart(params);
                }
            }
        });
        var release = is_touch_device ? 'touchend' : 'mouseup';
        Router.bind(rootElement, release, function (e) {
            var params = Router.getEventParams(e);
            var view = params.view;

            // handle click, double-click
            if ((self.scrollMode !== 2) && (self.dragMode !== 2) && view.clickView) {
                if (self.testClick(params)) {
                    var clickView = view.clickView;
                    var now = params.time;
                    if (self.lastClicked && (self.lastClicked > now - 500) && !self.doubleClickFlag) {
                        self.lastClicked = self.dragStart.time;
                        self.doubleClickFlag = true;
                        clickView.onDoubleClick();
                    } else {
                        self.lastClicked = self.dragStart.time;
                        self.doubleClickFlag = false;
                        clickView.onClick();
                    }
                }
            }
            if (self.scrollMode === 2) {
                // self.dragStart.view.scrollView.scrollStop(params);
            }
            if (self.dragMode === 2) {
                self.dragger.dragStop(params);
            }
            self.dragMode = 0;
            self.scrollMode = 0;
            self.dragStart = null;
            // todo: preventDefault? if we clicked on text?
        });
        // todo: swiping and scroll-wheel
        // handle mouse-only hover-effects for nodes
        /* // deal with this later
        if (! is_touch_device) {
        Router.bind(rootElement, 'mouseover', function(e) {
        var view = View.getFromElement(Router.getTarget(e));
        var node:View = view.nodeView;
        if (!node) {return;}
        if (self.hoverTimer) {
        clearTimeout(self.hoverTimer);
        }
        if (node !== View.hovering) {
        View.hovering.removeClass('ui-btn-hover-c');
        }
        node.addClass('ui-btn-hover-c');
        View.hovering = view.nodeView;
        });
        Router.bind(rootElement, 'mouseout', function(e) {
        var view = View.getFromElement(Router.getTarget(e));
        var node:View = view.nodeView;
        if (!node) {return;}
        if (self.hoverTimer) {
        clearTimeout(self.hoverTimer);
        }
        if (view.nodeView === View.hovering) {
        self.hoverTimer = setTimeout(function () {
        node.removeClass('ui-btn-hover-c');
        }, 500);
        }
        });
        }
        */
    }
    Router.getTarget = function (e) {
        if (e.target) {
            if (e.target.nodeType === 3) {
                // Support: Chrome 23+, Safari?
                return e.target.parentNode;
            }
            return e.target;
        }
        if (e.srcElement) {
            return e.srcElement;
        }
        return null;
    };

    Router.getPosition = function (e) {
        var p;

        // Calculate pageX/Y if missing and clientX/Y available
        if (e.pageX != null) {
            p = {
                left: e.pageX,
                top: e.pageY
            };
        } else if (e.clientX != null) {
            var eventDoc = Router.getTarget(e).ownerDocument || document;
            var doc = eventDoc.documentElement;
            var body = eventDoc.body;
            p = {
                left: e.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0),
                top: e.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc && doc.clientTop || body && body.clientTop || 0)
            };
        }
        return p;
    };

    Router.bind = function (elem, type, eventHandle) {
        if (elem.addEventListener) {
            elem.addEventListener(type, eventHandle, false);
        } else if (elem.attachEvent) {
            elem.attachEvent("on" + type, eventHandle);
        }
    };

    Router.getEventParams = function (e) {
        return {
            view: View.getFromElement(Router.getTarget(e)),
            pos: Router.getPosition(e),
            time: (new Date()).getTime()
        };
    };

    Router.prototype.testDragStart = function (params) {
        var p1 = params.pos, p0 = this.dragStart.pos;
        if (Math.abs(p1.left - p0.left) + Math.abs(p1.top - p0.top) >= 5) {
            return true;
        } else {
            return false;
        }
    };
    Router.prototype.testScrollStart = function (params) {
        var p1 = params.pos, p0 = this.dragStart.pos;
        if (Math.abs(p1.left - p0.left) + Math.abs(p1.top - p0.top) >= 5) {
            return true;
        } else {
            return false;
        }
    };
    Router.prototype.testClick = function (params) {
        var p1 = params.pos, p0 = this.dragStart.pos;
        if ((params.time - this.dragStart.time > 500) || (params.view !== this.dragStart.view) || (Math.abs(p1.left - p0.left) + Math.abs(p1.top - p0.top) >= 5)) {
            return false;
        } else {
            return true;
        }
    };
    return Router;
})();
//# sourceMappingURL=Router.js.map
