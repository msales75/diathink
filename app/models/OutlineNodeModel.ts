///<reference path="../views/View.ts"/>
///<reference path="../util/fixFontSize.ts"/>
// fixFOntSize is for getting the JQueryStaticD interface
m_require("app/LinkedList.js");

class PModel {
    cid:string;
    fromJSON(x:NodeOutlineJson) {}
}

interface NodeOutlineJson {
    cid?: string;
    owner?:string;
    text: string;
    children?: NodeOutlineJson[];
    links?: string[];
    collapsed?: boolean;
    deleted?:boolean;
}
function repossess(json:NodeOutlineJson, userID:string, prefix:string) {
    if (json.cid) {json.cid = prefix+json.cid;}
    json.owner = userID;
    var i:number;
    for (i=0; i<json.children.length; ++i) {
        repossess(json.children[i], userID, prefix);
    }
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
    cid?: string;
    text?: string;
    children?: OutlineNodeCollection;
    owner?:string;
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
        links?: OutlineNodeCollection;
        backLinks?: OutlineNodeCollection;
        collapsed?:boolean;
        deleted?:boolean;
        owner?:string;
    } = {};
    views:{[i:string]:NodeView} = {};
    importLinks; // temporary

    constructor(options?:ModelOptions) {
        super();
        if (options && options.cid) {
            this.cid = options.cid;
            if (this.cid.substr(0,$D.sessionID.length)===$D.sessionID) {
                var num = Number(this.cid.substr($D.sessionID.length+1));
                if (num>=View.nextId) {
                    View.nextId = num+1;
                }
            }
        } else {
            this.cid = View.getNextId();
        }
        assert(OutlineNodeModel.modelsById[this.cid]===undefined, "ERROR: Using same cid twice");
        this.attributes.deleted = false;
        this.attributes.parent = null;
        this.attributes.collapsed= false;
        OutlineNodeModel.modelsById[this.cid] = this;
        this.attributes.links = new OutlineNodeCollection;
        if (options!=null) {
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
    delete() { // delete recursively
        var i:string;
        var c = this.attributes.children;
        if (c && (c.count>0)) {
            for (i=c.first(); i!==''; i= c.next[i]) {
                c.obj[i].delete();
            }
            c.reset();
        }
        this.set('deleted', true);
        OutlineNodeModel.deletedById[this.cid] = this;
        delete OutlineNodeModel.modelsById[this.cid];
        this.set('parent', null);
    }
    resurrect():OutlineNodeModel {
        OutlineNodeModel.modelsById[this.cid] = this;
        delete OutlineNodeModel.deletedById[this.cid];
        this.set('deleted', false);
        return this;
    }
    updateLinks() {
        var i:number, o:string;
        // this.attributes.links = new OutlineNodeCollection;
        if (this.importLinks && (this.importLinks.length>0)) {
            for (i=0; i<this.importLinks.length; ++i) {
                var ref:OutlineNodeModel = OutlineNodeModel.getById(this.importLinks[i]);
                this.attributes.links.append(ref.cid, ref);
                if (ref.attributes.backLinks==null) {
                    ref.attributes.backLinks = new OutlineNodeCollection();
                }
                ref.attributes.backLinks.append(this.cid, this);
            }
            this.importLinks = undefined;
        }
        // recurse on children
        if (this.attributes.children) {
            for (o in this.attributes.children.obj) {
                (<OutlineNodeModel>this.attributes.children.obj[o]).updateLinks();
            }
        }
    }


    fromJSON(n:NodeOutlineJson):OutlineNodeModel {
        this._fromJSON(n); // create models and lists with child/parent relations
        this.updateLinks(); // update link-relationships
        return this;
    }

    _fromJSON(n:NodeOutlineJson):OutlineNodeModel {
        var children:OutlineNodeCollection;
        var links:OutlineNodeCollection;
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
    }
    toJSON() {
        return ((<JQueryStaticD>$).toJSON(this._toJSON()));
    }
    _toJSON():NodeOutlineJson {
        var links=this.attributes.links;
        var linklist:string[] = [];
        if (links && (links.count>0)) {
            var l:string;
            for (l=links.first();l!==''; l=links.next[l]) {
                linklist.push(links.obj[l].cid);
            }
        }
        var childlist:{}[] = [];
        var children = this.attributes.children;
        if (children && children.count>0) {
            var c:string;
            for (c=children.first(); c!==''; c=children.next[c]) {
                childlist.push(children.obj[c]._toJSON());
            }
        }
        return <NodeOutlineJson>{
            cid: this.cid,
            owner: this.attributes.owner,
            text: this.attributes.text,
            collapsed: this.attributes.collapsed,
            deleted: this.attributes.deleted,
            links: linklist,
            children: childlist
        };
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
            assert(typeof this.attributes.owner === 'string',
                "The model " + m + " has an owner-attribute that is not a string");
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

            // check links and back-links for consistency
            var links = this.attributes.links;
            var l:string;
            if (links != null) {
                assert(links instanceof OutlineNodeCollection, "");
                links.validate();
                for (l in links.obj) {
                    assert(l!==this.cid, "");
                    assert(links.obj[l] instanceof OutlineNodeModel, "");
                    assert((<OutlineNodeModel>links.obj[l]).attributes.backLinks.obj[this.cid] === this,
                        "");
                }
            }
            var backlinks = this.attributes.backLinks;
            if (backlinks != null) {
                backlinks.validate();
                for (l in backlinks.obj) {
                    assert(l!==this.cid, "");
                    assert(backlinks.obj[l] instanceof OutlineNodeModel, "");
                    assert((<OutlineNodeModel>backlinks.obj[l]).attributes.links.obj[this.cid] === this,
                        "");
                }
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
            assert(this.attributes.links === null,
                "Deleted model " + m + " has links not null");
            assert(this.attributes.backLinks === null,
                "Deleted model " + m + " has backLinks not null");
        }
    }
}

class OutlineNodeCollection extends LinkedList<OutlineNodeModel> {
    // model=OutlineNodeModel;
    // models:OutlineNodeModel[] = [];
    // modelsById:{[i:string]:OutlineNodeModel} = {};
    // at(i:number):Action;
    // push(a:Action):void;

    _fromJSON(input:NodeOutlineJson[]) {
        var i:number;
        if (!input) {return;}
        for (i = 0; i < input.length; ++i) {
            var m:OutlineNodeModel;
            if (input[i].cid && OutlineNodeModel.deletedById[input[i].cid]) {
                m = OutlineNodeModel.deletedById[input[i].cid].resurrect();
            } else {
                m = new OutlineNodeModel({cid: input[i].cid});
            }
            m._fromJSON(input[i]);
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

