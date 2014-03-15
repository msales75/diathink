///<reference path="../views/View.ts"/>

interface PModel {};

class Collection {
    length:number;
    models: PModel[];
    _byId: {[i:string]:PModel};
    at(i:number) {
        return this.models[i];
    }
    push(m:PModel) {
        this.models.push(m);
    }
}

interface ModelOptions {
    text?: string;
    children?: OutlineNodeCollection;
}
class OutlineNodeModel implements PModel {
    cid:string;
    children:OutlineNodeCollection;
    parent:OutlineNodeModel;
    text:string;
    deleted:boolean;
    attributes;
    views:{[i:string]:View};
    static modelsById: {[i:string]:OutlineNodeModel};

    static getById(id:string) {
        return OutlineNodeModel.modelsById[id];
    }
    constructor(options:ModelOptions) {
        if (options.text!=null) {
            this.text= options.text;
        }
        if (options.children!=null) {
            this.children = options.children;
            // todo: set parent implicitly?
        }
    }
    get(i:string) {

    }
    set() {

    }

    initialize() {
        // do whatever you want :)
        this.deleted = false;
    }

    parentCollection() {
        if (this.attributes.parent == null) {
            if ($D.data.get(this.cid) === this) {return $D.data;}
            else {return null;}
        } else {
            return this.attributes.parent.attributes.children;
        }
    }

    rank() {
        var c = this.parentCollection();
        for (var i = 0; i < c.models.length; ++i) {
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
}

class OutlineNodeCollection {
    model:typeof OutlineNodeModel;
    length:number;
    at(k:number):Action;
    push(a:Action):void;
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

