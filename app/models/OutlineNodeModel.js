///<reference path="../views/View.ts"/>
var OutlineNodeModel = (function () {
    function OutlineNodeModel() {
    }
    OutlineNodeModel.getById = function (id) {
        return OutlineNodeModel.modelsById[id];
    };

    OutlineNodeModel.prototype.initialize = function () {
        // do whatever you want :)
        this.deleted = false;
    };

    OutlineNodeModel.prototype.parentCollection = function () {
        if (this.attributes.parent == null) {
            if ($D.data.get(this.cid) === this) {
                return $D.data;
            } else {
                return null;
            }
        } else {
            return this.attributes.parent.attributes.children;
        }
    };

    OutlineNodeModel.prototype.rank = function () {
        var c = this.parentCollection();
        for (var i = 0; i < c.models.length; ++i) {
            if (c.models[i] === this) {
                return i;
            }
        }
        return null;
    };

    OutlineNodeModel.prototype.addView = function (view) {
        if ((this.views == null) || (typeof this.views !== 'object')) {
            this.views = {};
        }
        this.views[view.nodeRootView.id] = view;
    };

    OutlineNodeModel.prototype.clearView = function (view) {
        if ((this.views == null) || (typeof this.views !== 'object')) {
            this.views = {};
        }
        delete this.views[view.id];
        if (_.size(this.views) === 0) {
            this.views = null;
        }
    };
    return OutlineNodeModel;
})();

var OutlineNodeCollection = (function () {
    function OutlineNodeCollection() {
    }
    return OutlineNodeCollection;
})();
//# sourceMappingURL=OutlineNodeModel.js.map
