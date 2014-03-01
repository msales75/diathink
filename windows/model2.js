/**
* Created by Mark on 2/24/14.
*/
var Model = (function () {
    function Model() {
    }
    Model.getNextCid = function () {
        this.nextCid = this.nextCid + 1;
        return 'c' + this.nextCid;
    };
    Model.get = function (cid) {
        return this.modelList[cid];
    };
    Model.type = 'Model';
    Model.modelList = {};
    Model.nextCid = 0;
    return Model;
})();
//# sourceMappingURL=model2.js.map
