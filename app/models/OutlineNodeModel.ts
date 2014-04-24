///<reference path="../views/View.ts"/>

m_require("app/LinkedList.js");

class PModel {
    cid:string;
    fromJSON(x:NodeOutlineJson) {}
}

interface NodeOutlineJson {
    text: string;
    children?: NodeOutlineJson[];
}
class Collection {
    length:number = 0;
    model:any;
    models:PModel[] = [];
    modelsById:{[i:string]:PModel} = {};
    at(i:number) {
        return this.models[i];
    }
    get(k:string) {
        return this.modelsById[k];
    }
    addAt(m:PModel, rank:number) {
        this.models.splice(rank, 0, m);
        this.modelsById[m.cid] = m;
        this.length = this.models.length;
    }
    remove(m:PModel) {
        var i:number;
        var cid:string = m.cid;
        if (this.modelsById[m.cid] === m) {
            delete this.modelsById[m.cid];
            i = this.models.indexOf(m);
            assert(i !== -1, "Removing non-existent model from collection");
            this.models.splice(i, 1);
            this.length = this.models.length;
        }
        return cid;
    }
    push(m:PModel) {
        this.models.push(m);
        this.length=this.models.length;
        this.modelsById[m.cid] = m;
    }
    fromJSON(input:NodeOutlineJson[]) {
        var i:number;
        if (!input) {return;}
        for (i = 0; i < input.length; ++i) {
            var m = new this.model();
            m.fromJSON(input[i]);
            this.push(m);
        }
    }
}
interface ModelOptions {
    text?: string;
    children?: OutlineNodeCollection;
}
class OutlineNodeModel extends PModel {
    static root:OutlineNodeModel;
    static modelsById:{[i:string]:OutlineNodeModel} = {};
    static deletedById:{[i:string]:OutlineNodeModel} = {};
    static getById(id:string) {
        return OutlineNodeModel.modelsById[id];
    }
    cid:string;
    attributes:{
        children?:OutlineNodeCollection;
        parent?:OutlineNodeModel;
        text?:string;
        deleted?:boolean;
    } = {};
    views:{[i:string]:NodeView} = {};

    constructor(options?:ModelOptions) {
        super();
        this.cid = View.getNextId();
        this.attributes.deleted = false;
        this.attributes.parent = null;
        OutlineNodeModel.modelsById[this.cid] = this;
        if (options!=null) {
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
    setChildren(children:OutlineNodeCollection) {
        if (children != null) {
            this.attributes.children = children;
            // fix parent of child-models
            var m:string;
            for (m=children.first();m!=='';m=children.next[m]) {
                var oldParent = children.obj[m].get('parent');
                assert((oldParent == null) || (oldParent === this), "Multiple parents given to child-node");
                children.obj[m].set('parent', this);
            }
        } else {
            this.attributes.children = new OutlineNodeCollection();
        }
    }
    get(key:string) {
        return this.attributes[key];
    }
    set(key:string, value:any) {
        this.attributes[key] = value;
    }
    parentCollection():OutlineNodeCollection {
        assert(this.attributes.parent != null, "parentCollection with null parent");
        return this.attributes.parent.attributes.children;
    }
    addView(view) {
        if ((this.views == null) || (typeof this.views !== 'object')) {
            this.views = {};
        }
        this.views[view.nodeRootView.id] = view;
    }

    clearView(view) {
        if ((this.views == null) || (typeof this.views !== 'object')) {
            this.views = {};
        }
        delete this.views[view.id];
        if (_.size(this.views) === 0) {
            this.views = null;
        }
    }
    delete() {
        this.set('deleted', true);
        OutlineNodeModel.deletedById[this.cid] = this;
        delete OutlineNodeModel.modelsById[this.cid];
        this.set('parent', null);
    }
    resurrect() {
        OutlineNodeModel.modelsById[this.cid] = this;
        delete OutlineNodeModel.deletedById[this.cid];
        this.set('deleted', false);
    }



    fromJSON(n:NodeOutlineJson):OutlineNodeModel {
        var children:OutlineNodeCollection;
        children = new OutlineNodeCollection();
        children.fromJSON(n.children);
        this.attributes.text = n.text;
        this.setChildren(children);
        return this;
    }

    getContextAt() {
        var id:string = this.cid;
        var model:OutlineNodeModel = OutlineNodeModel.getById(id);
        var collection:OutlineNodeCollection= <OutlineNodeCollection>model.parentCollection();
        var context:ModelContext = {};
        if (collection.prev[model.cid]==='') {
            context.prev = null;
        } else {
            context.prev = collection.prev[model.cid];
        }
        if (collection.next[model.cid]==='') {
            context.next = null;
        } else {
            context.next = collection.next[model.cid];
        }
        context.parent = model.get('parent').cid;
        return context;
    }
    // return the context for an item inserted after id
    getContextAfter():ModelContext {
        var id:string = this.cid;
        var context:ModelContext;
        var collection:OutlineNodeCollection = this.parentCollection();
        var parent:OutlineNodeModel = this.attributes.parent;
        assert(parent != null, "parent is null in getContextAfter");
        context = {parent: parent.cid};
        context.prev = id;
        if (collection.next[id]==='') {
            context.next = null;
        } else {
            context.next = collection.next[id];
        }
        return context;
    }
    // return the context for an item inserted before id
    getContextBefore():ModelContext {
        var id:string = this.cid;
        var context:ModelContext;
        var collection:OutlineNodeCollection = this.parentCollection();
        var parent:OutlineNodeModel = this.attributes.parent;
        assert(parent != null, "parent is null in getContextBefore");
        context = {parent: parent.cid};
        context.next = id;
        if (collection.prev[id]==='') {
            context.prev = null;
        } else {
            context.prev = collection.prev[id];
        }
        return context;
    }
    // return the context for an item inserted inside id, at end of list
    getContextIn() {
        var id = this.cid;
        var collection:OutlineNodeCollection = this.attributes.children;
        var context:ModelContext = {parent: id, next: null};
        if (collection.count===0) {
            context.prev = null;
        } else {
            context.prev = collection.last();
        }
        return context;
    }
    validate() {
        var m:string = this.cid;
        var outlines = OutlineRootView.outlinesById;
        var views = View.viewList;
        var models = OutlineNodeModel.modelsById;
        var deleted = OutlineNodeModel.deletedById;
        var cm:string;


        assert(typeof this.attributes === 'object',
            "Model " + m + " does not have an attributes field");
        if (this.attributes.deleted === false) {
            assert(models[m] === this,
                "Model " + m + " does not have a valid cid");
            assert(deleted[m] === undefined,
                "Model "+m+" is in deleted list");
            if (this.attributes.parent == null) {
                assert(OutlineNodeModel.root === this,
                    "Model "+m+" has parent=null");
            }

            assert(this.attributes.text != null,
                "The model " + m + " does not have a text attribute");
            assert(typeof this.attributes.text === 'string',
                "The model " + m + " has a text-attribute that is not a string");
            // parent matches children
            var c = this.attributes.children;
            assert(c instanceof OutlineNodeCollection,
                "The children of model " + m + " are not an OutlineNodeCollection");
            for (cm=c.first(); cm!=='';cm= c.next[cm]) {
                var obj:OutlineNodeModel = <OutlineNodeModel>c.obj[cm];
                assert(obj instanceof OutlineNodeModel,
                    "The child " + cm + " of model " + m + " is not a RelationalModel");
                assert(models[obj.cid] === obj,
                    "The child " + cm + " of model " + m + " is not in the model list");
                assert(obj.attributes.parent === this,
                    "The child " + cm + " of model " + m + " does not have the matching parent-field");
            }

            if (this !== OutlineNodeModel.root) { // check ancestry of non-root items
                var p:OutlineNodeModel = this.attributes.parent;
                assert(models[p.cid] === p,
                    "The parent of model " + m + ", " + p.cid + ", does not point to a listed model");
                var parents:string[] = [m];
                var pt:OutlineNodeModel = p;
                while (pt && (!_.contains(parents, pt.cid))) {
                    parents.push(pt.cid);
                    pt = pt.attributes.parent;
                }
                assert(pt == null,
                    "The model " + m + " does not have ancestry to a root model ");
                // (proves parent-refs are connected & acyclic)

                assert(p.attributes.children instanceof OutlineNodeCollection,
                    "Parent-model " + p + " does not have children of type OutlineNodeCollection");
                p.attributes.children.validate(); // validate linked-list properties
                var foundit = false;
                var models1:OutlineNodeCollection = p.attributes.children;
                var cp:string, k:string;
                for (cp in models1.obj) {
                    if (models1.obj[cp] === this) {
                        foundit = true;
                        break;
                    }
                }
                assert(foundit,
                    "Model " + m + " is not in the child-list of parent-model " + pt);
            }

            assert(this.views !== undefined,
                "The model " + m + " does not have a views array defined.");
            assert(typeof this.views === 'object',
                "The model " + m + " does not have a views-object");
            for (k in this.views) {
                assert(outlines[k] != null,
                    "The key " + k + " in the views of model " + m + " is not in the outline list");
                assert(this.views[k] instanceof NodeView,
                    "The view in outline " + k + " for model " + m + " is not of type NodeView");
                assert(this.views[k] === views[this.views[k].id],
                    "The view in outline " + k + " for model " + m + " is not in the views list");
                assert(this.views[k].value.cid === m,
                    "The view " + this.views[k].id + " in model " + m + " and outline " + k + " does not have model Id=" + m);
            }
        } else { // deleted model
            assert(models[m] === undefined,
                "Deleted model " + m + " was not removed from model list");
            assert(deleted[m] === this,
                "Deleted model "+m+" is not in deleted list");
            assert(this.attributes.parent === null,
                "Deleted model " + m + " has a parent not null");
            assert(this.attributes.children.count === 0,
                "Deleted model " + m + " has children not empty");
            assert(this.views === null,
                "Deleted model " + m + " has views not null");
        }
    }
}

class OutlineNodeCollection extends LinkedList<OutlineNodeModel> {
    // model=OutlineNodeModel;
    // models:OutlineNodeModel[] = [];
    // modelsById:{[i:string]:OutlineNodeModel} = {};
    // at(i:number):Action;
    // push(a:Action):void;
    fromJSON(input:NodeOutlineJson[]) {
        var i:number;
        if (!input) {return;}
        for (i = 0; i < input.length; ++i) {
            var m:OutlineNodeModel = new OutlineNodeModel();
            m.fromJSON(input[i]);
            this.append(m.cid, m);
        }
    }
}
//    __name__:'OutlineNode',
//    reference:M.Model.hasOne('OutlineNode', {}),
//    tags: M.Model.attr('ReferenceList', {}),
//    triggers:M.Model.attr('ReferenceList', {}),
//    keywords
//    property-tag/values(tag-children-search?)
// todo: override constructor to permit cid's to be reused
//  allowing deleted model-elements to be removed from memory
// override Backbone.Model to allow specification of cid in attributes
/*
 constructor: function(attributes, options) {
 var defaults;
 var attrs = attributes || {};
 options || (options = {});
 // MS: if cid is specified, ensure it is unique then use it.
 if (attributes.cid) {
 // todo: check uniqueness - if (Backbone.Relational.store.find(attributes.cid));
 this.cid = attributes.cid;
 } else {
 this.cid = _.uniqueId('c');
 }
 this.attributes = {};
 var modelOptions = ['url', 'urlRoot', 'collection'];
 _.extend(this, _.pick(options, modelOptions));
 if (options.parse) attrs = this.parse(attrs, options) || {};
 if (defaults = _.result(this, 'defaults')) {
 attrs = _.defaults({}, attrs, defaults);
 }
 this.set(attrs, options);
 this.changed = {};
 this.initialize.apply(this, arguments);
 },
 */

