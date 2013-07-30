


M.Action = M.Object.extend({
    name: null,
    resources
    triggers: null,

    newListItem: function(parentView) {
var templateView = parentView.listItemTemplateView;
assert(templateView!=null);
templateView.events = templateView.events ? templateView.events : parentView.events;

var li = templateView.design({});
// li.modelId = ?
var item = {name: this.lineText, prop: ""}; // from list
li = parentView.cloneObject(li, item);
li.value = item; // enables getting the value/contentBinding of a list item in a template view.
li.parentView = parentView;
    return li;
}
});

M.InsertAfter = M.Action.extend({
    type: "InsertAfter",
    args: {"ID", "TEXT"},
    id: null,
    previousID: null,
    lineText: null,
    create: function(options) {
        var obj = this.prototype.create(this);
        obj.define(options);
        return obj;
    },
    define: function(options) {
        this.previousID = options.previousID;
        this.lineText = options.lineText;
    },
    getResources: function() {
      return {id: id, previousID: previousID, lineText: lineText}
    },

    // TODO: we hold a model-ID or a list of view ID's for the previousItem?
    // (figure out how we will handle that)
    execView: function(view) {
      // for a specific outline, looped over views later
      // var c = diathink.app.getConfig('outlineView');

      var parentView = M.ViewManager.getViewById(this.previousID).parentView;

      var li = this.newListItem(parentView);
      $('#'+this.previousID).after(li.render());
      li.registerEvents();
      li.theme();
      // parentView.themeUpdate(); // is this necessary?
    },

    validate: function(model, view) {
        // for a specific outline, looped over views later
    },
    undoView: function(view) {
        // for a specific outline, looped over views later

    },
})());

M.Action.add("InsertInto",function(id, x) {

});

M.Action.add("InsertBefore",function(id, x) {

});

M.Action.add("Remove",function(id, x) {

});

M.Action.add("MoveInto",function(id, x) {

    var parentItem = (this.placeholder.parentDepth(o.buryDepth+2).get(0) &&
            this.placeholder.parentDepth(o.buryDepth+2).closest('.ui-sortable').length)
            ? this.placeholder.parentDepth(o.buryDepth+2)
            : null,
        level = this._getLevel(this.placeholder),

});

M.Action.add("MoveAfter",function(id, x) {


});

M.Action.add("MoveBefore",function(id, x) {

});

