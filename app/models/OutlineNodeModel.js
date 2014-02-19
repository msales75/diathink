
$D.OutlineNodeModel = Backbone.RelationalModel.extend({
    relations: [
        {
            type: Backbone.HasMany, // Use the type, or the string 'HasOne' or 'HasMany'.
            key: 'children', // must match list-view name in OutlineView
            relatedModel: '$D.OutlineNodeModel',
            includeInJSON: true,
            collectionType: '$D.OutlineNodeCollection',
            reverseRelation: {
                key: 'parent'
            }
        }
    ],
    initialize: function() {
      // do whatever you want :)
        this.deleted = false;
    },

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

    parentCollection: function() {
        if (this.attributes.parent == null) {
            if ($D.data.get(this.cid) === this) {return $D.data;}
            else {return null;}
        } else {
            return this.attributes.parent.attributes.children;
        }
    },
    rank: function() {
        var c = this.parentCollection();
        for (var i=0; i< c.models.length; ++i) {
            if (c.models[i] === this) {
                return i;
            }
        }
        return null;
    },

    setView: function(key, value) {
        if ((this.views == null) || (typeof this.views !== 'object')) {
            this.views = {};
        }
        this.views[key] = value;
    },

    clearView: function(key) {
        if ((this.views == null) || (typeof this.views !== 'object')) {
            this.views = {};
        }
        delete this.views[key];
        if (_.size(this.views)===0) {
            this.views = null;
        }
    }
},{ // static methods
    // MS: cannot call this get() or will override Backbone
    getById: function(id) {
        return Backbone.Relational.store._collections[0]._byId[id];
    }
});
$D.OutlineNodeCollection = Backbone.Collection.extend({
    model: $D.OutlineNodeModel
});

//    __name__:'OutlineNode',

//    reference:M.Model.hasOne('OutlineNode', {}),
//    tags: M.Model.attr('ReferenceList', {}),
//    triggers:M.Model.attr('ReferenceList', {}),
//    keywords
//    property-tag/values(tag-children-search?)

