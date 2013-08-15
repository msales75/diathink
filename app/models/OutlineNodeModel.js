
diathink.OutlineNodeModel = Backbone.RelationalModel.extend({
    relations: [
        {
            type: Backbone.HasMany, // Use the type, or the string 'HasOne' or 'HasMany'.
            key: 'children', // must match list-view name in OutlineView
            relatedModel: 'diathink.OutlineNodeModel',
            includeInJSON: true,
            collectionType: 'diathink.OutlineNodeCollection',
            reverseRelation: {
                key: 'parent'
            }
        }
    ],
    initialize: function() {
      // do whatever you want :)
    },
    parentCollection: function() {
        if (this.attributes.parent == null) {
            return diathink.data;
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
    }
});
diathink.OutlineNodeCollection = Backbone.Collection.extend({
    model: diathink.OutlineNodeModel
});

//    __name__:'OutlineNode',

//    reference:M.Model.hasOne('OutlineNode', {}),
//    tags: M.Model.attr('ReferenceList', {}),
//    triggers:M.Model.attr('ReferenceList', {}),
//    keywords
//    property-tag/values(tag-children-search?)

