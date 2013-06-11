// ==========================================================================
// The M-Project - Mobile HTML5 Application Framework
// Generated with: Espresso 
//
// Project: diathink
// ==========================================================================

var diathink  = diathink || {};

var myList = [
    {
        name: "List Item 1",
        prop: "another property",
        sublist: [
        {
                name: "List subitem 1a",
                prop: "another property"
        }, {
                name: "List subitem 1a",
                prop: "another property"
        }]
    },
    {
        name: "List Item 2",
        prop: "another property"
    },
    {
        name: "List Item 3",
        prop: "another property"
    }
];


// Note that controllers must be defined before view.
diathink.MyController = M.Controller.extend({
  listObjectClicked : function(id, nameId) {
    console.log('You clicked on the list item with the DOM id: ', id, 'and has the name', nameId);
  }, 
  parentObjectClicked : function(id, nameId) {
    console.log('You clicked on the overall list with the DOM id: ', id, 'and has the name', nameId);
  }, 
  listObject: []
});

diathink.dummyController = M.Controller.extend({
  dummyListClicked : function(id, nameId) {
    console.log('You clicked on the list item with the DOM id: ', id, 'and has the name', nameId);
  }, 
  listObject: []
});

diathink.RecurseListTemplate =  M.ListView.design({
                isInset: 'YES',
		listItemTemplateView: null,
/*
                events: {
                  tap: {
                    target: diathink.dummyController,
                    action: 'dummyListClicked'
                  }
                },
*/
                contentBinding: {
                  target: diathink.dummyController,
                  property: 'listObject'
                },
                idName: 'name'
});

diathink.MyListItem = M.ListItemView.design({
  childViews: 'name sublist',
  hasSingleAction: 'NO',
  isSelectable: 'NO',
/*
  events: {
    tap: {
      target: diathink.MyController,
      action: 'listObjectClicked'
    }
  },
*/
  name: M.LabelView.design({
    valuePattern: '<%= name %>'
  }),

  sublist: diathink.RecurseListTemplate
  
});

diathink.RecurseListTemplate.listItemTemplateView = diathink.MyListItem;


diathink.app = M.Application.design({

    entryPage : 'page1', // required for start-page

    page1: M.PageView.design({

        childViews: 'header content footer',
        events: {
          pageshow: {
            action: function() {
              diathink.MyController.set('listObject', myList)
              $('#'+M.ViewManager.getView('page1', 'alist').id).nestedSortable({
                listType: 'ul',
                items: 'li',
                toleranceElement: '> div > div > a'
              });
            }
          }
        },

        header: M.ToolbarView.design({
            value: 'HEADER',
            anchorLocation: M.TOP
        }),

        content: M.ScrollView.design({
            childViews: 'label alist',

            label: M.LabelView.design({
                value: 'Welcome to The M-Project'
            }),

            alist: M.ListView.design({
                events: {
                    tap: {
                      target: diathink.MyController,
                      action: 'parentObjectClicked'
                    }
                },
                isInset: 'YES',
		listItemTemplateView: diathink.MyListItem,
                contentBinding: {
                  target: diathink.MyController,
                  property: 'listObject'
                },
                idName: 'name'
            })
        }),

        footer: M.ToolbarView.design({
            value: 'FOOTER',
            anchorLocation: M.BOTTOM
        })

    })
});


