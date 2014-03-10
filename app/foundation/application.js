
m_require('app/foundation/object.js');
m_require('app/views/View.js');

M.Application = M.Object.extend({
    type: 'M.Application',
    name: null,
    currentLanguage: null,
    defaultLanguage: null,
    entryPage: null,
    config: {},
    design: function(obj) {
        var pages = {};
        for(var pageName in obj) {
            if(obj[pageName] && obj[pageName] instanceof PageView) {
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
        var entryPage = View.getPage(M.Application.entryPage.replace(/\s+/g, ''));
        delete View.viewList[entryPage.id];

        /* set the default id 'm_entryPage' for entry page */
        entryPage.id = 'm_entryPage';

        /* now lets render entry page to get it into the DOM first and set it as the current page */
        View.setCurrentPage(entryPage); // MS try setting page before rendering?
        entryPage.render();

        /* finally add entry page back to pagelist and view list, but with new key 'm_entryPage' */
        View.viewList['m_entryPage'] = entryPage;
    },
    getConfig: function(key) {
        if(this.config.hasOwnProperty(key)) {
            return this.config[key];
        }
        return null;
    }

});

