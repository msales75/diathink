
m_require('app/foundation/object.js');

M.INFO = 0;
M.DEBUG = 1;
M.WARN = 2;
M.ERR = 3;

$D.log = function() {};

M.Logger = M.Object.extend({

    type: 'M.Logger',

    _remoteAccess: YES,
    log: function(msg, level) {
        level = level || M.DEBUG;

        /* are we in production mode, then do not throw any logs */
        if(M.Application.getConfig('debugMode') === false) {
            return;
        }

        /* Prevent a console.log from blowing things up if we are on a browser that doesn't support this. */
        if (typeof console === 'undefined') {
            window.console = {} ;
            console.log = console.info = console.warn = console.error = function(){};
        }

        switch (level) {
            case M.DEBUG:
                this.debug(msg);
                break;
            case M.ERR:
                this.error(msg);
                break;
            case M.WARN:
                this.warn(msg);
                break;
            case M.INFO:
                this.info(msg);
                break;
            default:
                this.debug(msg);
                break;
        }
    },

    debug: function(msg) {
        console.debug(msg);
    },

    error: function(msg) {
        console.error(msg);
    },

    warn: function(msg) {
        console.warn(msg);
    },

    info: function(msg) {
        console.info(msg);
    },

    remote: function(msg){
        var that = this;
        try{
            if(that._remoteAccess){
                var m = JSON.stringify(msg);
                $.ajax({
                    url: "/__espresso_debug_console__",
                    data: m,
                    type: 'POST'
                }).done(function(){
                    that._remoteAccess = YES;
                }).fail(function(){
                    that._remoteAccess = NO;
                });
            }
        }catch(e){
            M.Logger.error(e);
        }
    }

});