
m_require('app/foundation/view.js');

M.ViewManager = M.Object.extend({
    type: 'M.ViewManager',
    nextId: 0,
    idPrefix: 'm_',
    viewList: {},
    pageList: {},
    currentPage: null,
    currentlyRenderedPage: null,
    foundView: null,
    getNextId: function() {
        this.nextId = this.nextId + 1;
        return this.idPrefix + this.nextId;
    },
    register: function(view) {
        this.viewList[view.id] = view;

        if(view.type === 'M.PageView') {
            this.pageList[view.id] = view;
        }
    },
    unregister: function(view) {
        delete this.viewList[view.id];
    },
    getViewById: function(id) {
        return this.viewList[id];
    },
    findViewById: function(id) {
        return this.getViewById(id);
    },
    getIdByView: function(view) {
        return view.id;
    },
    getPage: function(pageName) {
        var page = M.Application.pages[pageName];

        if(!page) {
            M.Logger.log('page \'' + pageName + '\' not found.', M.WARN);
        }
        return page;
    },
    getCurrentPage: function() {
        return this.currentPage;
    },
    setCurrentPage: function(page) {
        this.currentPage = page;
    },
    dumpViewList: function() {
      _.each(this.viewList, function(view){
        console.log(view.id + ': '+ view.type);
      });  
    }

});