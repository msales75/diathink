

diathink.PanelManager = M.Object.extend({
  type: 'PanelManager',
  nextpanel: {'': ''},
  prevpanel: {'': ''},
  deleted: {},
  insertAfter: function(newid, previousid) {
      if ((this.nextpanel[newid]!==undefined) ||
          (this.prevpanel[newid]!==undefined) || (newid === '')) {
          console.log('Error inserting invalid id'); // error
          debugger;
          return;
      }
      if ((this.nextpanel[previousid]===undefined)||
          (this.prevpanel[previousid]===undefined)) {
          console.log('Error inserting panel previous-id'); // error
          debugger;
          return;
      }
      var oldnext = this.nextpanel[previousid];
      this.nextpanel[previousid] = newid;
      this.prevpanel[newid] = previousid;
      this.nextpanel[newid] = oldnext;
      this.prevpanel[oldnext] = newid;
      if (this.deleted[newid]) {
          delete this.deleted[newid];
      }
  },
  remove: function(id) {
      if ((this.nextpanel[id]===undefined) || (this.prevpanel[id]===undefined) || (id==='')) {
          console.log('Error removing panel');
          debugger;
          return;
      }
      var next = this.nextpanel[id];
      var prev = this.prevpanel[id];
      this.nextpanel[prev] = next;
      this.prevpanel[next] = prev;
      delete this.nextpanel[id];
      delete this.prevpanel[id];
      this.deleted[id] = id;
  },
  moveAfter: function(id, previousid) {
      if ((this.nextpanel[id]===undefined) || (this.prevpanel[id]===undefined) || (id==='')) {
          console.log('Error moving panel');
          debugger;
          return;
      }
      if ((this.nextpanel[previousid]===undefined)||
          (this.prevpanel[previousid]===undefined)) {
          console.log('Error moving panel after previous-id'); // error
          debugger;
          return;
      }
      // remove id
      var next = this.nextpanel[id];
      var prev = this.prevpanel[id];
      this.nextpanel[prev] = next;
      this.prevpanel[next] = prev;

      // add-in after previousid
      var oldnext = this.nextpanel[previousid];
      this.nextpanel[previousid] = id;
      this.prevpanel[id] = previousid;
      this.nextpanel[id] = oldnext;
      this.prevpanel[oldnext] = id;
  }
});

// Note that controllers must be defined before view.
// TODO later support partial-list loading?

diathink.OutlineManager = M.Object.extend({
    type: 'OutlineManager',
    outlines: {},
    deleted: {},
    add: function(id, controller) {
        if (this.deleted[id]) {
            if (controller !== this.deleted[id]) {
                console.log('ERROR: incompatible deleted outline');
                debugger;
            }
            this.outlines[id] = this.deleted[id];
            delete this.deleted[id];
        } else {
            this.outlines[id] = controller;
        }
    },
    remove: function(id) {
        this.deleted[id] = this.outlines[id];
        delete this.outlines[id];
    }

});


diathink.OutlineController = M.Controller.extend({
    type: 'diathink.OutlineController',
    rootID: null,
    bindView: function(view) { // bind this constructor-instance to this view
        this.rootID = view.id;
        view.setRootID();
        this.rootModel = view.rootModel;
        this.deleted = false;
        diathink.OutlineManager.add(this.rootID, this);
    },
    destroy: function() {
        var i, v, view, models;
        diathink.OutlineManager.remove(this.rootID);
        this.deleted = true;
        view = M.ViewManager.getViewById(this.rootID);
        models = view.value.models;
        for (i=0; i<models.length; ++i) {
            models[i].views[this.rootID].destroy();
        }
        // don't destroy outline-ul-shell-view?
    },
    setData: function(key, val) {
        if (!this.data) {this.data = {};}
        if (val!=null) {
            this.data[key] = val;
        } else {
            delete this.data[key];
        }
    },
    getData: function(key) {
        if (!this.data) {return null;}
        else if (this.data[key] == null) {return null;}
        else {return this.data[key];}
    },
    listObject: [] // list-data for top-level of outline
});

diathink.dummyController = M.Controller.extend({
    dummyListClicked:function (id, nameId) {
        //console.log('You clicked on the list item with the DOM id: ', id, 'and has the name', nameId);
    },
    listObject:[]
});

// nest horizontal pages, expand/contract? drag/drop?
// save perspectives? hmm.
// TODO: Where do we store and check for triggers?


