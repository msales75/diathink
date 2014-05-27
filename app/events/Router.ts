///<reference path="../views/View.ts"/>
///<reference path="DragHandler.ts"/>

class Router {
    public dragMode:number = 0;
    public scrollMode:number = 0;
    public dragStart:DragStartI = null;
    private lastClicked:number = null;
    private doubleClickFlag:boolean = false;
    private hoverTimer:number = null;
    dragger:DragHandler;

    public static getTarget(e:Event):HTMLElement {
        if (e.target) {
            if ((<HTMLElement>e.target).nodeType === 3) { // Target should not be a text node
                // Support: Chrome 23+, Safari?
                return <HTMLElement>(<HTMLElement>e.target).parentNode;
            }
            return <HTMLElement>e.target;
        }
        if (e.srcElement) {return <HTMLElement>e.srcElement;} // Support: IE<9
        return null;
    }

    public static getPosition(e:any) {
        var p:PositionI;
        // Calculate pageX/Y if missing and clientX/Y available
        if ((e.changedTouches != null)&&(e.changedTouches.length>0)) {
            p = {
                left: e.changedTouches[0].pageX,
                top: e.changedTouches[0].pageY
            };
        } else if (e.pageX != null) {
            p = {
                left: e.pageX,
                top: e.pageY
            };
        } else if (e.clientX != null) {
            var eventDoc = Router.getTarget(e).ownerDocument || document;
            var doc = eventDoc.documentElement;
            var body = eventDoc.body;
            p = {
                left: e.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 ),
                top: e.clientY + ( doc && doc.scrollTop || body && body.scrollTop || 0 ) - ( doc && doc.clientTop || body && body.clientTop || 0 )
            };
        }
        return p;
    }

    public static bind(elem:HTMLElement, type:string, eventHandle:{(e:any)}) {
        if (elem.addEventListener) {
            elem.addEventListener(type, eventHandle, false);
        } else if (elem.attachEvent) {
            elem.attachEvent("on" + type, eventHandle);
        }
    }

    static getEventParams(e):DragStartI {
        var target:HTMLElement = Router.getTarget(e);
        return {
            view: View.getFromElement(target),
            pos: Router.getPosition(e),
            time: (new Date()).getTime(),
            elem: target
        };
    }

    testDragStart(params:DragStartI):boolean {
        var p1 = params.pos, p0 = this.dragStart.pos;
        if (Math.abs(p1.left-p0.left)+Math.abs(p1.top-p0.top) >= 5) {
            return true;
        }
        return false;
    }
    testScrollStart(params:DragStartI):boolean {
        var p1 = params.pos, p0 = this.dragStart.pos;
        if (Math.abs(p1.left-p0.left)+Math.abs(p1.top-p0.top) >= 5) {
            return true;
        }
        return false;
    }
    testClick(params:DragStartI):boolean {
        var p1 = params.pos, p0 = this.dragStart.pos;
        if ((params.time-this.dragStart.time > 500) ||
            (params.view !== this.dragStart.view) ||
            (Math.abs(p1.left-p0.left)+Math.abs(p1.top-p0.top) >= 5)) {
            return false;
        }
        return true;
    }

    constructor(private rootElement:HTMLElement) {
        var is_touch_device:boolean = 'ontouchstart' in document.documentElement;
        var press:string = is_touch_device ? 'touchstart' : 'mousedown';
        console.log("Using press = "+press);
        var self:Router = this;
        this.dragger = new DragHandler();
        Router.bind(rootElement, press, function(e) {
            var preventDefault = true;
            self.dragStart = Router.getEventParams(e);
            var view = self.dragStart.view;
            self.scrollMode = 0;
            self.dragMode = 0;
            if (view.handleView != null) {
                console.log("Processing touch as handle");
                if (View.focusedView !== view.nodeView) {
                    View.setFocus(view);
                    (<TextAreaView>View.focusedView.header.name.text.addClass('hide-selection')).selectAllText().focus();
                }
                self.dragMode = 1;
            } else if (view.scrollView != null) {
                if (!View.focusedView || (view.nodeView!==View.focusedView)) {
                    // only enable scrolling if drag doesn't start from an already-focused-node
                    //   (this is important for text-selection)
                    console.log("Processing touch as scroll of unfocused field");
                    self.scrollMode = 1;
                }
                if (view.nodeView != null) { // we touched inside a line-node
                    console.log("Processing touch as virtual-focus event");
                    View.setFocus(view); // this should trigger checkTextChange- but not on handle change?
                    if (view instanceof TextAreaView) {
                        console.log("Permitting default inside textarea");
                        // need native event to capture cursor position, even if we're not focusing
                        preventDefault = false;
                        // self.hidingFocus = view; // todo: make sure we don't need earlier delayed-focus list?
                        view.removeClass('hide-selection');
                    } else {
                        console.log("In node but not handle or textarea, so focusing entire node");
                        (<TextAreaView>View.focusedView.header.name.text.addClass('hide-selection')).selectAllText().focus();
                    }
                }
            }
            if (preventDefault) {
                console.log("In touchstart preventing default");
                e.preventDefault();
            }
        });
        var move = is_touch_device ? 'touchmove' : 'mousemove';
        console.log("Using move = "+move);
        Router.bind(rootElement, move, function(e) {
            // console.log('Event type '+e.type);
            if (!self.dragMode && !self.scrollMode) {return;}
            var params = Router.getEventParams(e);
            if (self.dragMode===2) { // continue dragging
                // console.log("Processing touchmove as dragMove");
                self.dragger.dragMove(params);
                return;
            } else if (self.scrollMode===2) { // continue scrolling
                // console.log("Processing touchmove as scrollMove");
                self.dragStart.view.scrollView.scrollHandler.scrollMove(params);
                return;
            }
            if (self.dragMode===1) { // possibly dragging
                console.log("Processing touchmove as testDragStart");
                if (self.testDragStart(params)) {
                    console.log("Passed test to start dragging");
                    self.dragMode=2; // we are definitely dragging
                    self.dragger.dragStart(self.dragStart);
                } else {
                    console.log("Distance not great enough to start dragging");
                }
            } else if (self.scrollMode===1) { // possibly scrolling
                console.log("Processing touchmove as testScrollStart");
                if (self.testScrollStart(params)) {
                    console.log("Passed test to start scrolling");
                    self.scrollMode=2;
                    self.dragStart.view.scrollView.scrollHandler.scrollStart(params);
                } else {
                    console.log("Distance not great enough to start scrolling");
                }
            }
            e.preventDefault();
        });
        var release = is_touch_device ? 'touchend' : 'mouseup';
        console.log("Using release = "+release);
        Router.bind(rootElement, release, function(e) {
            console.log("Processing touch release");
            var params = Router.getEventParams(e);
            var view = params.view;
            // handle click, double-click
            if ((self.scrollMode!==2)&&(self.dragMode!==2)&&view.clickView) {
                // console.log("Testing touch for click");
                if (self.testClick(params)) { // if release is consistent with a click
                    // console.log("Processing click");
                    var clickView = view.clickView;
                    var now = params.time;
                    if (self.lastClicked && (self.lastClicked > now - 500) && !self.doubleClickFlag) {
                        self.lastClicked = self.dragStart.time;
                        self.doubleClickFlag = true;
                        clickView.onDoubleClick(params);
                    } else { // single-click
                        self.lastClicked = self.dragStart.time;
                        self.doubleClickFlag = false;
                        clickView.onClick(params);
                    }
                }
            }
            if (self.scrollMode===2) {
                self.dragStart.view.scrollView.scrollHandler.scrollStop();
            }
            if (self.dragMode===2) {
                self.dragger.dragStop(params);
            }
            self.dragMode = 0;
            self.scrollMode = 0;
            self.dragStart = null;
            // todo: preventDefault if we didn't click on text?
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
}

