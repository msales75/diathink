var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="../views/View.ts"/>
///<reference path="../util/fixFontSize.ts"/>
// fixFOntSize is for getting the JQueryStaticD interface
m_require("app/LinkedList.js");

var PModel = (function () {
    function PModel() {
    }
    PModel.prototype.fromJSON = function (x) {
    };
    return PModel;
})();

function repossess(json) {
    if (json.cid) {
        delete json['cid'];
    }
    json.owner = $D.userID;
    var i;
    for (i = 0; i < json.children.length; ++i) {
        repossess(json.children[i]);
    }
}

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
        var i;
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
        if (options && options.cid) {
            this.cid = options.cid;
            if (this.cid.substr(0, $D.sessionID.length) === $D.sessionID) {
                var num = Number(this.cid.substr($D.sessionID.length + 1));
                if (num >= View.nextId) {
                    View.nextId = num + 1;
                }
            }
        } else {
            this.cid = View.getNextId();
        }
        assert(OutlineNodeModel.modelsById[this.cid] === undefined, "ERROR: Using same cid twice");
        this.attributes.deleted = false;
        this.attributes.parent = null;
        this.attributes.collapsed = false;
        OutlineNodeModel.modelsById[this.cid] = this;
        this.attributes.links = new OutlineNodeCollection;
        if (options != null) {
            if (options.text != null) {
                this.attributes.text = options.text;
            } else {
                this.attributes.text = "";
            }
            this.setChildren(options.children);
            if (options.owner) {
                this.attributes.owner = options.owner;
            }
        } else {
            this.setChildren(null);
        }
        if (!this.attributes.owner) {
            this.attributes.owner = $D.userID;
        }
    }
    OutlineNodeModel.getById = function (id) {
        return OutlineNodeModel.modelsById[id];
    };

    OutlineNodeModel.prototype.setChildren = function (children) {
        if (children != null) {
            this.attributes.children = children;

            // fix parent of child-models
            var m;
            for (m = children.first(); m !== ''; m = children.next[m]) {
                var oldParent = children.obj[m].get('parent');
                assert((oldParent == null) || (oldParent === this), "Multiple parents given to child-node");
                children.obj[m].set('parent', this);
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
        assert(this.attributes.parent != null, "parentCollection with null parent");
        return this.attributes.parent.attributes.children;
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
    OutlineNodeModel.prototype.delete = function () {
        var i;
        var c = this.attributes.children;
        if (c && (c.count > 0)) {
            for (i = c.first(); i !== ''; i = c.next[i]) {
                c.obj[i].delete();
            }
        }
        this.set('deleted', true);
        OutlineNodeModel.deletedById[this.cid] = this;
        delete OutlineNodeModel.modelsById[this.cid];
        this.set('parent', null);
    };
    OutlineNodeModel.prototype.resurrect = function () {
        OutlineNodeModel.modelsById[this.cid] = this;
        delete OutlineNodeModel.deletedById[this.cid];
        this.set('deleted', false);
    };
    OutlineNodeModel.prototype.updateLinks = function () {
        var i, o;

        // this.attributes.links = new OutlineNodeCollection;
        if (this.importLinks && (this.importLinks.length > 0)) {
            for (i = 0; i < this.importLinks.length; ++i) {
                var ref = OutlineNodeModel.getById(this.importLinks[i]);
                this.attributes.links.append(ref.cid, ref);
                if (ref.attributes.backLinks == null) {
                    ref.attributes.backLinks = new OutlineNodeCollection();
                }
                ref.attributes.backLinks.append(this.cid, this);
            }
            this.importLinks = undefined;
        }

        // recurse on children
        if (this.attributes.children) {
            for (o in this.attributes.children.obj) {
                this.attributes.children.obj[o].updateLinks();
            }
        }
    };

    OutlineNodeModel.prototype.fromJSON = function (n) {
        this._fromJSON(n); // create models and lists with child/parent relations
        this.updateLinks(); // update link-relationships
        return this;
    };

    OutlineNodeModel.prototype._fromJSON = function (n) {
        var children;
        var links;
        children = new OutlineNodeCollection();
        children._fromJSON(n.children);
        this.attributes.text = n.text;
        this.attributes.deleted = n.deleted;
        this.attributes.collapsed = n.collapsed;
        if (n.owner) {
            this.attributes.owner = n.owner;
        }
        this.importLinks = n.links;
        this.setChildren(children);
        return this;
    };
    OutlineNodeModel.prototype.toJSON = function () {
        return ($.toJSON(this._toJSON()));
    };
    OutlineNodeModel.prototype._toJSON = function () {
        var links = this.attributes.links;
        var linklist = [];
        if (links && (links.count > 0)) {
            var l;
            for (l = links.first(); l !== ''; l = links.next[l]) {
                linklist.push(links.obj[l].cid);
            }
        }
        var childlist = [];
        var children = this.attributes.children;
        if (children && children.count > 0) {
            var c;
            for (c = children.first(); c !== ''; c = children.next[c]) {
                childlist.push(children.obj[c]._toJSON());
            }
        }
        return {
            cid: this.cid,
            owner: this.attributes.owner,
            text: this.attributes.text,
            collapsed: this.attributes.collapsed,
            deleted: this.attributes.deleted,
            links: linklist,
            children: childlist
        };
    };

    OutlineNodeModel.prototype.getContextAt = function () {
        var id = this.cid;
        var model = OutlineNodeModel.getById(id);
        var collection = model.parentCollection();
        var context = {};
        if (collection.prev[model.cid] === '') {
            context.prev = null;
        } else {
            context.prev = collection.prev[model.cid];
        }
        if (collection.next[model.cid] === '') {
            context.next = null;
        } else {
            context.next = collection.next[model.cid];
        }
        context.parent = model.get('parent').cid;
        return context;
    };

    // return the context for an item inserted after id
    OutlineNodeModel.prototype.getContextAfter = function () {
        var id = this.cid;
        var context;
        var collection = this.parentCollection();
        var parent = this.attributes.parent;
        assert(parent != null, "parent is null in getContextAfter");
        context = { parent: parent.cid };
        context.prev = id;
        if (collection.next[id] === '') {
            context.next = null;
        } else {
            context.next = collection.next[id];
        }
        return context;
    };

    // return the context for an item inserted before id
    OutlineNodeModel.prototype.getContextBefore = function () {
        var id = this.cid;
        var context;
        var collection = this.parentCollection();
        var parent = this.attributes.parent;
        assert(parent != null, "parent is null in getContextBefore");
        context = { parent: parent.cid };
        context.next = id;
        if (collection.prev[id] === '') {
            context.prev = null;
        } else {
            context.prev = collection.prev[id];
        }
        return context;
    };

    // return the context for an item inserted inside id, at end of list
    OutlineNodeModel.prototype.getContextIn = function () {
        var id = this.cid;
        var collection = this.attributes.children;
        var context = { parent: id, next: null };
        if (collection.count === 0) {
            context.prev = null;
        } else {
            context.prev = collection.last();
        }
        return context;
    };
    OutlineNodeModel.prototype.validate = function () {
        var m = this.cid;
        var outlines = OutlineRootView.outlinesById;
        var views = View.viewList;
        var models = OutlineNodeModel.modelsById;
        var deleted = OutlineNodeModel.deletedById;
        var cm;

        assert(typeof this.attributes === 'object', "Model " + m + " does not have an attributes field");
        if (this.attributes.deleted === false) {
            assert(models[m] === this, "Model " + m + " does not have a valid cid");
            assert(deleted[m] === undefined, "Model " + m + " is in deleted list");
            if (this.attributes.parent == null) {
                assert(OutlineNodeModel.root === this, "Model " + m + " has parent=null");
            }

            assert(this.attributes.text != null, "The model " + m + " does not have a text attribute");
            assert(typeof this.attributes.text === 'string', "The model " + m + " has a text-attribute that is not a string");
            assert(typeof this.attributes.owner === 'string', "The model " + m + " has an owner-attribute that is not a string");

            // parent matches children
            var c = this.attributes.children;
            assert(c instanceof OutlineNodeCollection, "The children of model " + m + " are not an OutlineNodeCollection");
            for (cm = c.first(); cm !== ''; cm = c.next[cm]) {
                var obj = c.obj[cm];
                assert(obj instanceof OutlineNodeModel, "The child " + cm + " of model " + m + " is not a RelationalModel");
                assert(models[obj.cid] === obj, "The child " + cm + " of model " + m + " is not in the model list");
                assert(obj.attributes.parent === this, "The child " + cm + " of model " + m + " does not have the matching parent-field");
            }

            if (this !== OutlineNodeModel.root) {
                var p = this.attributes.parent;
                assert(models[p.cid] === p, "The parent of model " + m + ", " + p.cid + ", does not point to a listed model");
                var parents = [m];
                var pt = p;
                while (pt && (!_.contains(parents, pt.cid))) {
                    parents.push(pt.cid);
                    pt = pt.attributes.parent;
                }
                assert(pt == null, "The model " + m + " does not have ancestry to a root model ");

                // (proves parent-refs are connected & acyclic)
                assert(p.attributes.children instanceof OutlineNodeCollection, "Parent-model " + p + " does not have children of type OutlineNodeCollection");
                p.attributes.children.validate(); // validate linked-list properties
                var foundit = false;
                var models1 = p.attributes.children;
                var cp, k;
                for (cp in models1.obj) {
                    if (models1.obj[cp] === this) {
                        foundit = true;
                        break;
                    }
                }
                assert(foundit, "Model " + m + " is not in the child-list of parent-model " + pt);
            }

            // check links and back-links for consistency
            var links = this.attributes.links;
            var l;
            if (links != null) {
                assert(links instanceof OutlineNodeCollection, "");
                links.validate();
                for (l in links.obj) {
                    assert(l !== this.cid, "");
                    assert(links.obj[l] instanceof OutlineNodeModel, "");
                    assert(links.obj[l].attributes.backLinks.obj[this.cid] === this, "");
                }
            }
            var backlinks = this.attributes.backLinks;
            if (backlinks != null) {
                backlinks.validate();
                for (l in backlinks.obj) {
                    assert(l !== this.cid, "");
                    assert(backlinks.obj[l] instanceof OutlineNodeModel, "");
                    assert(backlinks.obj[l].attributes.links.obj[this.cid] === this, "");
                }
            }

            assert(this.views !== undefined, "The model " + m + " does not have a views array defined.");
            assert(typeof this.views === 'object', "The model " + m + " does not have a views-object");
            for (k in this.views) {
                assert(outlines[k] != null, "The key " + k + " in the views of model " + m + " is not in the outline list");
                assert(this.views[k] instanceof NodeView, "The view in outline " + k + " for model " + m + " is not of type NodeView");
                assert(this.views[k] === views[this.views[k].id], "The view in outline " + k + " for model " + m + " is not in the views list");
                assert(this.views[k].value.cid === m, "The view " + this.views[k].id + " in model " + m + " and outline " + k + " does not have model Id=" + m);
            }
        } else {
            assert(models[m] === undefined, "Deleted model " + m + " was not removed from model list");
            assert(deleted[m] === this, "Deleted model " + m + " is not in deleted list");
            assert(this.attributes.parent === null, "Deleted model " + m + " has a parent not null");
            assert(this.attributes.children.count === 0, "Deleted model " + m + " has children not empty");
            assert(this.views === null, "Deleted model " + m + " has views not null");
            assert(this.attributes.links === null, "Deleted model " + m + " has links not null");
            assert(this.attributes.backLinks === null, "Deleted model " + m + " has backLinks not null");
        }
    };
    OutlineNodeModel.modelsById = {};
    OutlineNodeModel.deletedById = {};
    return OutlineNodeModel;
})(PModel);

var OutlineNodeCollection = (function (_super) {
    __extends(OutlineNodeCollection, _super);
    function OutlineNodeCollection() {
        _super.apply(this, arguments);
    }
    // model=OutlineNodeModel;
    // models:OutlineNodeModel[] = [];
    // modelsById:{[i:string]:OutlineNodeModel} = {};
    // at(i:number):Action;
    // push(a:Action):void;
    OutlineNodeCollection.prototype._fromJSON = function (input) {
        var i;
        if (!input) {
            return;
        }
        for (i = 0; i < input.length; ++i) {
            var m = new OutlineNodeModel({ cid: input[i].cid });
            m._fromJSON(input[i]);
            this.append(m.cid, m);
        }
    };
    return OutlineNodeCollection;
})(LinkedList);
//# sourceMappingURL=OutlineNodeModel.js.map
