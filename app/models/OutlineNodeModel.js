var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="../views/View.ts"/>
var PModel = (function () {
    function PModel() {
    }
    PModel.prototype.fromJSON = function (x) {
    };
    return PModel;
})();

var Collection = (function () {
    function Collection() {
        this.length = 0;
        this.models = [];
        this.modelsById = {};
    }
    Collection.prototype.at = function (i) {
        return this.models[i];
    };
    Collection.prototype.get = function (k) {
        return this.modelsById[k];
    };
    Collection.prototype.addAt = function (m, rank) {
        this.models.splice(rank, 0, m);
        this.modelsById[m.cid] = m;
        this.length = this.models.length;
    };
    Collection.prototype.remove = function (m) {
        var i;
        var cid = m.cid;
        if (this.modelsById[m.cid] === m) {
            delete this.modelsById[m.cid];
            i = this.models.indexOf(m);
            assert(i !== -1, "Removing non-existent model from collection");
            this.models.splice(i, 1);
            this.length = this.models.length;
        }
        return cid;
    };
    Collection.prototype.push = function (m) {
        this.models.push(m);
        this.length = this.models.length;
        this.modelsById[m.cid] = m;
    };
    Collection.prototype.fromJSON = function (input) {
        var i, elem;
        if (!input) {
            return;
        }
        for (i = 0; i < input.length; ++i) {
            var m = new this.model();
            m.fromJSON(input[i]);
            this.push(m);
        }
    };
    return Collection;
})();

var OutlineNodeModel = (function (_super) {
    __extends(OutlineNodeModel, _super);
    function OutlineNodeModel(options) {
        _super.call(this);
        this.attributes = {};
        this.views = {};
        this.cid = View.getNextId();
        this.attributes.deleted = false;
        this.attributes.parent = null;
        OutlineNodeModel.modelsById[this.cid] = this;
        if (options != null) {
            if (options.text != null) {
                this.attributes.text = options.text;
            } else {
                this.attributes.text = "";
            }
            this.setChildren(options.children);
        } else {
            this.setChildren(null);
        }
    }
    OutlineNodeModel.getById = function (id) {
        return OutlineNodeModel.modelsById[id];
    };

    OutlineNodeModel.prototype.setChildren = function (children) {
        if (children != null) {
            this.attributes.children = children;
            var cmodels = children.models;
            var i;
            for (i = 0; i < cmodels.length; ++i) {
                var oldParent = cmodels[i].get('parent');
                assert((oldParent == null) || (oldParent === this), "Multiple parents given to child-node");
                cmodels[i].set('parent', this);
            }
        } else {
            this.attributes.children = new OutlineNodeCollection();
        }
    };
    OutlineNodeModel.prototype.get = function (key) {
        return this.attributes[key];
    };
    OutlineNodeModel.prototype.set = function (key, value) {
        this.attributes[key] = value;
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
        var i;
        for (i = 0; i < c.models.length; ++i) {
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

    OutlineNodeModel.prototype.fromJSON = function (n) {
        var children;
        children = new OutlineNodeCollection();
        children.fromJSON(n.children);
        this.attributes.text = n.text;
        this.setChildren(children);
        return this;
    };
    OutlineNodeModel.modelsById = {};
    return OutlineNodeModel;
})(PModel);
var OutlineNodeCollection = (function (_super) {
    __extends(OutlineNodeCollection, _super);
    function OutlineNodeCollection() {
        _super.apply(this, arguments);
        this.model = OutlineNodeModel;
        this.models = [];
        this.modelsById = {};
    }
    return OutlineNodeCollection;
})(Collection);
//# sourceMappingURL=OutlineNodeModel.js.map
