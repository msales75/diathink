///<reference path="../views/View.ts"/>
class PModel {
    cid:string;
    fromJSON(x:NodeOutlineJson) {}
}

interface NodeOutlineJson {
    text: string;
    children: NodeOutlineJson[];
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
        var i:number, elem:NodeOutlineJson;
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
    cid:string;
    attributes:{
        children?:OutlineNodeCollection;
        parent?:OutlineNodeModel;
        text?:string;
        deleted?:boolean;
    } = {};
    views:{[i:string]:NodeView} = {};
    static modelsById:{[i:string]:OutlineNodeModel} = {};

    static getById(id:string) {
        return OutlineNodeModel.modelsById[id];
    }

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
            var cmodels = children.models;
            var i:number;
            for (i = 0; i < cmodels.length; ++i) {
                var oldParent = (<OutlineNodeModel>cmodels[i]).get('parent');
                assert((oldParent == null) || (oldParent === this), "Multiple parents given to child-node");
                (<OutlineNodeModel>cmodels[i]).set('parent', this);
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
        if (this.attributes.parent == null) {
            if ($D.data.get(this.cid) === this) {return $D.data;}
            else {return null;}
        } else {
            return this.attributes.parent.attributes.children;
        }
    }

    rank() {
        var c:OutlineNodeCollection = this.parentCollection();
        var i:number;
        for (i = 0; i < c.models.length; ++i) {
            if (c.models[i] === this) {
                return i;
            }
        }
        return null;
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

    fromJSON(n:NodeOutlineJson):OutlineNodeModel {
        var children:OutlineNodeCollection;
        children = new OutlineNodeCollection();
        children.fromJSON(n.children);
        this.attributes.text = n.text;
        this.setChildren(children);
        return this;
    }
}
class OutlineNodeCollection extends Collection {
    model=OutlineNodeModel;
    models:OutlineNodeModel[] = [];
    modelsById:{[i:string]:OutlineNodeModel} = {};
    // at(i:number):Action;
    // push(a:Action):void;
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

