
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

