///<reference path="underscore.d.ts"/>
///<reference path="jquery.d.ts"/>
///<reference path="backbone.d.ts"/>
var $D = $D || {};
var M = M || {};
var YES = true;
var NO = false;
var m_require = m_require || function require() {
};
function assert(test, message) {
    if (!test) {
        if (message) {
            // $D.log([], "INVALID: " + message);
            console.log("INVALID: " + message);
        } else {
            // $D.log([], "INVALID: Unspecified validation error");
            console.log("INVALID: Unspecified validation error");
        }
    }
}
;
//# sourceMappingURL=m.js.map
