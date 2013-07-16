// ==========================================================================
// The M-Project - Mobile HTML5 Application Framework
// Generated with: Espresso 
//
// Project: diathink
// ==========================================================================

var diathink  = diathink || {};

var myList = [
    {
        name: "List Item Super Mark",
        prop: "another property",
        sublist: [
        {
                name: "List subitem 1a",
                prop: "another property"
        }, {
                name: "List subitem 1b",
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
  childViews: 'header sublist',
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
  header: M.ContainerView.design({
      cssClass: '',
      childViews: 'handle name',
      handle: M.ImageView.design({
          value: 'theme/images/drag_icon.png',
          cssClass: 'drag-handle disclose'
      }),
      name: M.LabelView.design({
          valuePattern: '<%= name %>'
      })
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
              diathink.MyController.set('listObject', myList);
              $('#'+M.ViewManager.getView('page1', 'alist').id).nestedSortable({
                listType: 'ul',
                items: 'li',
                doNotClear: true,
                isTree: true,
                branchClass: 'branch',
                leafClass: 'leaf',
                collapsedClass: 'collapsed',
                expandedClass: 'expanded',
                handle: '> div > div > a > div > .drag-handle',
                buryDepth: 3,
                helper: 'clone',
                  /* function(event, currentItem) {
                    var c = currentItem.clone();
                    c
                    return c;
                } */
                scroll: false,
                stop: function(e, hash) { // (could also try 'change' or 'sort' event)
                  if (hash.item.parents('ul').length>0) {
                    M.ViewManager.getViewById($(hash.item.parents('ul').get(0)).attr('id')).themeUpdate();
                    M.ViewManager.getViewById($(hash.originalDOM.parent).attr('id')).themeUpdate();
                  }
                  console.log("Processed change to structure");
                },
                // handle: '> div > div > a > div > .handle',
                toleranceElement: '> div > div > a > div'
              });
              $('.disclose').on('click', function() {
                    $(this).closest('li').toggleClass('expanded').toggleClass('collapsed');
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


