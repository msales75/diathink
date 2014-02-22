
m_require('app/foundation/view_manager.js');

M.Application = M.Object.extend({
    type: 'M.Application',
    name: null,
    currentLanguage: null,
    defaultLanguage: null,
    isFirstLoad: YES,
    entryPage: null,
    config: {},
    design: function(obj) {
        var pages = {};
        for(var pageName in obj) {
            if(obj[pageName] && obj[pageName].type === 'M.PageView') {
                pages[pageName] = obj[pageName];
            }
        }      
        this.include({
            pages: pages
        });

        this.entryPage = ((obj.entryPage && typeof(obj.entryPage) === 'string') ? obj.entryPage : null);

        return this;
    },
    main: function() {
        var that = this;

        /* first lets get the entry page and remove it from pagelist and viewlist */
        var entryPage = M.ViewManager.getPage(M.Application.entryPage.replace(/\s+/g, ''));
        delete M.ViewManager.viewList[entryPage.id];
        delete M.ViewManager.pageList[entryPage.id];

        /* set the default id 'm_entryPage' for entry page */
        entryPage.id = 'm_entryPage';

        /* now lets render entry page to get it into the DOM first and set it as the current page */
        M.ViewManager.setCurrentPage(entryPage); // MS try setting page before rendering?
        entryPage.render();

        /* finally add entry page back to pagelist and view list, but with new key 'm_entryPage' */
        M.ViewManager.viewList['m_entryPage'] = entryPage;
        M.ViewManager.pageList['m_entryPage'] = entryPage;
    },
    getConfig: function(key) {
        if(this.config.hasOwnProperty(key)) {
            return this.config[key];
        }
        return null;
    }

});

