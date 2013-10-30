
var diathink = diathink || {};

diathink.keyboardSetup = M.Object.extend({

    /* hiddeninput: 'hiddeninput', */
    startTime: null,
    oldWidth: null,
    oldHeight: null,
    listenForResize: 0,
    isOpen: false,

    init: function(config) {

        var self = this;
        diathink.is_touch_device = 'ontouchstart' in document.documentElement;

        var is_mobile_ios =  (navigator.userAgent.match(/iPhone/i) ||
            navigator.userAgent.match(/iPad/i) ||
            navigator.userAgent.match(/iPod/i));
        is_mobile_ios != null ? this.is_mobile_ios = true : this.is_mobile_ios = false;

// alert("Touch device?: "+is_touch_device);
// alert("Mobile IOS DEVICE = "+is_mobile_ios);

// use ios keyboard-detection-hack
        if (diathink.is_touch_device) {
// for touch devices, don't let mousedown propogate to window,
//   to prevent unintended focus/blurs that change keyboard
            document.ontouchmove = function(e) {
                if ($('#debuglog').css('display')==='none') {
                    e.preventDefault(); // helps prevent scrolling
                }
            }

            $(window).bind('click keydown', function(e) {
                if (e.target && e.target.nodeName && e.target.nodeName.toUpperCase()==='TEXTAREA') {
                    setTimeout(function() {
                        window.scrollTo(0, 0);
                        document.body.scrollTop = 0;
                    }, 0);
                }
            });


            if (!this.is_mobile_ios) {
// for android devices, resize might be indicating a keyboard-change
// hiddenlog("Defining window resize listener");
                $(window).resize(function(e) {
                    // hiddenlog("window resized");
                    if (self.listenForResize) {
                        var diff = Number((new Date()).getTime())-self.startTime;
                        var newWidth = $(window).width();
                        var newHeight = $(window).height();
                        // hiddenlog("window = Probable Resize in time-interval with dwidth = "+(newWidth-self.oldWidth)+" dheight = "+(newHeight-self.oldHeight));
                        if ( (self.listenForResize===1) &&
                            (Math.abs(newWidth-self.oldWidth)<20) &&
                            (newHeight < self.oldHeight - 50) &&
                            (newHeight > 0.2*self.oldHeight)) {
                            if (! self.isOpen) {
                                self.softKeyboardOpen();
                                self.isOpen = true;
                            }
                            self.listenForResize = 0;
                        } else if ( (self.listenForResize===-1) &&
                            (Math.abs(newWidth-self.oldWidth)<20) &&
                            (self.oldHeight < newHeight - 50) &&
                            (self.oldHeight > 0.2*newHeight)) {
                            if (self.isOpen) {
                                self.softKeyboardClose();
                                self.isOpen = false;
                            }
                            self.listenForResize = 0;
                        }
                    }
                });
            }
        }
    },

    _virtualKeyboardHeight: function () {
        var sx = document.body.scrollLeft, sy = document.body.scrollTop;
        var naturalHeight = window.innerHeight;
        window.scrollTo(sx, document.body.scrollHeight);
        var keyboardHeight = naturalHeight - window.innerHeight;
        window.scrollTo(sx, sy);
        return keyboardHeight;
    },

    focus: function() {
        var self = this;
        if (diathink.is_touch_device) {
            if (! this.is_mobile_ios) { // not-ios; check for keyboard-resize-event
                this.listenForResize = 1;
                this.oldWidth = $(window).width();
                this.oldHeight = $(window).height();
                this.startTime = (new Date()).getTime();
                // hiddenlog("listening for resize open with width/height="+this.oldWidth+"x"+this.oldHeight);
                setTimeout(function() {
                    if (self.listenForResize===1) {
                        listenForRezize = 0;
                    }
                }, 2500);
            }
        }
        if (diathink.is_touch_device && this.is_mobile_ios) {
            setTimeout(function() {
                if (self._virtualKeyboardHeight()>10) {
                    if (! self.isOpen) {
                        self.softKeyboardOpen();
                        self.isOpen = true;
                    }
                }
            }, 1);
        }
    },

    blur: function() {
        // keep track of selected textarea, and define blur on it,
        // especially a blur without any keyboard event?
            // did user close keyboard?
        var self = this;
                if (self.is_mobile_ios) {
                setTimeout(function() {
                    if (self.isOpen) {
                        alert("test-close keyboard-height = "+self._virtualKeyboardHeight());
                        if (self._virtualKeyboardHeight()<10) {
                            self.softKeyboardClose();
                            self.isOpen = false;
                        }
                    }
                }, 1);
            } else {
                self.listenForResize = -1;
                self.oldWidth = $(window).width();
                self.oldHeight = $(window).height();
                // hiddenlog("listening for resize close with width/height="+self.oldWidth+"x"+self.oldHeight);
                self.startTime = (new Date()).getTime();
                setTimeout(function() {
                    listenForRezize = 0;
                }, 2500);
            }
    },

    softKeyboardOpen: function() {
        // override
    },

    softKeyboardClose: function() {
        // override
    }
});

