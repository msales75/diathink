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
        prop: "another property"
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
  listObject: []
});

diathink.MyListTemplate = M.ListItemView.design({
  childViews: 'name',
  events: {
    tap: {
      target: diathink.MyController,
      action: 'listObjectClicked'
    }
  },
  name: M.LabelView.design({
    valuePattern: '<%= name %>'
  })
});


diathink.app = M.Application.design({

    entryPage : 'page1', // required for start-page

    page1: M.PageView.design({

        childViews: 'header content footer',
        events: {
          pageshow: {
            action: function() {
              diathink.MyController.set('listObject', myList)
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
		listItemTemplateView: diathink.MyListTemplate,
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


