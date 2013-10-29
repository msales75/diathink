/*
(function( $, undefined ) {

//Keeps track of the number of lists per page UID
//This allows support for multiple nested list in the same page
//https://github.com/jquery/jquery-mobile/issues/1617
    var listCountPerPage = {};

    $.widget( "mobile.list2view", $.mobile.widget, {

        options: {
            theme: null,
            countTheme: "c",
            headerTheme: "b",
            dividerTheme: "b",
            icon: "arrow-r",
            splitIcon: "arrow-r",
            splitTheme: "b",
            corners: true,
            shadow: true,
            inset: false,
            initSelector: ":jqmData(role='list2view')"
        },

        _create: function() {
            var t = this,
                list2viewClasses = "";

            list2viewClasses += t.options.inset ? " ui-listview-inset" : "";

            if ( !!t.options.inset ) {
                list2viewClasses += t.options.corners ? " ui-corner-all" : "";
                list2viewClasses += t.options.shadow ? " ui-shadow" : "";
            }

            // create list2view markup
            t.element.addClass(function( i, orig ) {
                return orig + " ui-listview" + list2viewClasses;
            });

            t.refresh( true );
        },

        // This is a generic utility method for finding the first
        // node with a given nodeName. It uses basic DOM traversal
        // to be fast and is meant to be a substitute for simple
        // $.fn.closest() and $.fn.children() calls on a single
        // element. Note that callers must pass both the lowerCase
        // and upperCase version of the nodeName they are looking for.
        // The main reason for this is that this function will be
        // called many times and we want to avoid having to lowercase
        // the nodeName from the element every time to ensure we have
        // a match. Note that this function lives here for now, but may
        // be moved into $.mobile if other components need a similar method.
        _findFirstElementByTagName: function( ele, nextProp, lcName, ucName ) {
            var dict = {};
            dict[ lcName ] = dict[ ucName ] = true;
            while ( ele ) {
                if ( dict[ ele.nodeName ] ) {
                    return ele;
                }
                ele = ele[ nextProp ];
            }
            return null;
        },
        _getChildrenByTagName: function( ele, lcName, ucName ) {
            var results = [],
                dict = {};
            dict[ lcName ] = dict[ ucName ] = true;
            ele = ele.firstChild;
            while ( ele ) {
                if ( dict[ ele.nodeName ] ) {
                    results.push( ele );
                }
                ele = ele.nextSibling;
            }
            return $( results );
        },

        _addThumbClasses: function( containers ) {
            var i, img, len = containers.length;
            for ( i = 0; i < len; i++ ) {
                img = $( this._findFirstElementByTagName( containers[ i ].firstChild, "nextSibling", "img", "IMG" ) );
                if ( img.length ) {
                    img.addClass( "ui-li-thumb" );
                    $( this._findFirstElementByTagName( img[ 0 ].parentNode, "parentNode", "li", "LI" ) ).addClass( img.is( ".ui-li-icon" ) ? "ui-li-has-icon" : "ui-li-has-thumb" );
                }
            }
        },

        refresh: function( create ) {
            this.parentPage = this.element.closest( ".ui-page" );
           // this._createSubPages();

            var o = this.options,
                $list = this.element,
                self = this,
                dividertheme = $list.jqmData( "dividertheme" ) || o.dividerTheme,
                listsplittheme = $list.jqmData( "splittheme" ),
                listspliticon = $list.jqmData( "spliticon" ),
                listicon = $list.jqmData( "icon" ),
                li = this._getChildrenByTagName( $list[ 0 ], "li", "LI" ),
                ol = !!$.nodeName( $list[ 0 ], "ol" ),
                jsCount = !$.support.cssPseudoElement,
                start = $list.attr( "start" ),
                itemClassDict = {},
                item, itemClass, itemTheme,
                a, last, splittheme, counter, startCount, newStartCount, countParent, icon, imgParents, img, linkIcon;

            if ( ol && jsCount ) {
                $list.find( ".ui-li-dec" ).remove();
            }

            if ( ol ) {
                // Check if a start attribute has been set while taking a value of 0 into account
                if ( start || start === 0 ) {
                    if ( !jsCount ) {
                        startCount = parseInt( start , 10 ) - 1;
                        $list.css( "counter-reset", "listnumbering " + startCount );
                    } else {
                        counter = parseInt( start , 10 );
                    }
                } else if ( jsCount ) {
                    counter = 1;
                }
            }

            if ( !o.theme ) {
                o.theme = $.mobile.getInheritedTheme( this.element, "c" );
            }

            for ( var pos = 0, numli = li.length; pos < numli; pos++ ) {
                item = li.eq( pos );
                itemClass = "ui-li";

                // If we're creating the element, we update it regardless
                if ( create || !item.hasClass( "ui-li" ) ) {
                    itemTheme = item.jqmData( "theme" ) || o.theme;
                    a = this._getChildrenByTagName( item[ 0 ], "a", "A" );
                    var isDivider = ( item.jqmData( "role" ) === "list-divider" );

                    if ( a.length && !isDivider ) {
                        icon = item.jqmData( "icon" );

                        item.buttonMarkup({
                            wrapperEls: "div",
                            shadow: false,
                            corners: false,
                            iconpos: "right",
                            icon: a.length > 1 || icon === false ? false : icon || listicon || o.icon,
                            theme: itemTheme
                        });

                        if ( ( typeof icon !== "undefined" ) && ( icon !== false) && ( a.length === 1 ) ) {
                            item.addClass( "ui-li-has-arrow" );
                        }

                        a.first().removeClass( "ui-link" ).addClass( "ui-link-inherit" );

                        if ( a.length > 1 ) {
                            itemClass += " ui-li-has-alt";

                            last = a.last();
                            splittheme = listsplittheme || last.jqmData( "theme" ) || o.splitTheme;
                            linkIcon = last.jqmData( "icon" );

                            last.appendTo( item )
                                .attr( "title", $.trim(last.getEncodedText()) )
                                .addClass( "ui-li-link-alt" )
                                .empty()
                                .buttonMarkup({
                                    shadow: false,
                                    corners: false,
                                    theme: itemTheme,
                                    icon: false,
                                    iconpos: "notext"
                                })
                                .find( ".ui-btn-inner" )
                                .append(
                                $( document.createElement( "span" ) ).buttonMarkup({
                                    shadow: true,
                                    corners: true,
                                    theme: splittheme,
                                    iconpos: "notext",
                                    // link icon overrides list item icon overrides ul element overrides options
                                    icon: linkIcon || icon || listspliticon || o.splitIcon
                                })
                            );
                        }
                    } else if ( isDivider ) {

                        itemClass += " ui-li-divider ui-bar-" + ( item.jqmData( "theme" ) || dividertheme );
                        item.attr( "role", "heading" );

                        if ( ol ) {
                            //reset counter when a divider heading is encountered
                            if ( start || start === 0 ) {
                                if ( !jsCount ) {
                                    newStartCount = parseInt( start , 10 ) - 1;
                                    item.css( "counter-reset", "listnumbering " + newStartCount );
                                } else {
                                    counter = parseInt( start , 10 );
                                }
                            } else if ( jsCount ) {
                                counter = 1;
                            }
                        }

                    } else {
                        itemClass += " ui-li-static ui-btn-up-" + itemTheme;
                    }
                }

                if ( ol && jsCount && itemClass.indexOf( "ui-li-divider" ) < 0 ) {
                    countParent = itemClass.indexOf( "ui-li-static" ) > 0 ? item : item.find( ".ui-link-inherit" );

                    countParent.addClass( "ui-li-jsnumbering" )
                        .prepend( "<span class='ui-li-dec'>" + ( counter++ ) + ". </span>" );
                }

                // Instead of setting item class directly on the list item and its
                // btn-inner at this point in time, push the item into a dictionary
                // that tells us what class to set on it so we can do this after this
                // processing loop is finished.

                if ( !itemClassDict[ itemClass ] ) {
                    itemClassDict[ itemClass ] = [];
                }

                itemClassDict[ itemClass ].push( item[ 0 ] );
            }

            // Set the appropriate list2view item classes on each list item
            // and their btn-inner elements. The main reason we didn't do this
            // in the for-loop above is because we can eliminate per-item function overhead
            // by calling addClass() and children() once or twice afterwards. This
            // can give us a significant boost on platforms like WP7.5.

            for ( itemClass in itemClassDict ) {
                $( itemClassDict[ itemClass ] ).addClass( itemClass ).children( ".ui-btn-inner" ).addClass( itemClass );
            }

            $list.find( "h1, h2, h3, h4, h5, h6" ).addClass( "ui-li-heading" )
                .end()

                .find( "p, dl" ).addClass( "ui-li-desc" )
                .end()

                .find( ".ui-li-aside" ).each(function() {
                    var $this = $( this );
                    $this.prependTo( $this.parent() ); //shift aside to front for css float
                })
                .end()

                .find( ".ui-li-count" ).each(function() {
                    $( this ).closest( "li" ).addClass( "ui-li-has-count" );
                }).addClass( "ui-btn-up-" + ( $list.jqmData( "counttheme" ) || this.options.countTheme) + " ui-btn-corner-all" );

            // The idea here is to look at the first image in the list item
            // itself, and any .ui-link-inherit element it may contain, so we
            // can place the appropriate classes on the image and list item.
            // Note that we used to use something like:
            //
            //    li.find(">img:eq(0), .ui-link-inherit>img:eq(0)").each( ... );
            //
            // But executing a find() like that on Windows Phone 7.5 took a
            // really long time. Walking things manually with the code below
            // allows the 400 list2view item page to load in about 3 seconds as
            // opposed to 30 seconds.

            this._addThumbClasses( li );
            this._addThumbClasses( $list.find( ".ui-link-inherit" ) );

            this._addFirstLastClasses( li, this._getVisibles( li, create ), create );
            // autodividers binds to this to redraw dividers after the list2view refresh
            this._trigger( "afterrefresh" );
        },

        //create a string for ID/subpage url creation
        _idStringEscape: function( str ) {
            return str.replace(/[^a-zA-Z0-9]/g, '-');
        },

        _createSubPages: function() {
            var parentList = this.element,
                parentPage = parentList.closest( ".ui-page" ),
                parentUrl = parentPage.jqmData( "url" ),
                parentId = parentUrl || parentPage[ 0 ][ $.expando ],
                parentListId = parentList.attr( "id" ),
                o = this.options,
                dns = "data-" + $.mobile.ns,
                self = this,
                persistentFooterID = parentPage.find( ":jqmData(role='footer')" ).jqmData( "id" ),
                hasSubPages;

            if ( typeof listCountPerPage[ parentId ] === "undefined" ) {
                listCountPerPage[ parentId ] = -1;
            }

            parentListId = parentListId || ++listCountPerPage[ parentId ];

            $( parentList.find( "li>ul, li>ol" ).toArray().reverse() ).each(function( i ) {
                var self = this,
                    list = $( this ),
                    listId = list.attr( "id" ) || parentListId + "-" + i,
                    parent = list.parent(),
                    nodeElsFull = $( list.prevAll().toArray().reverse() ),
                    nodeEls = nodeElsFull.length ? nodeElsFull : $( "<span>" + $.trim(parent.contents()[ 0 ].nodeValue) + "</span>" ),
                    title = nodeEls.first().getEncodedText(),//url limits to first 30 chars of text
                    id = ( parentUrl || "" ) + "&" + $.mobile.subPageUrlKey + "=" + listId,
                    theme = list.jqmData( "theme" ) || o.theme,
                    countTheme = list.jqmData( "counttheme" ) || parentList.jqmData( "counttheme" ) || o.countTheme,
                    newPage, anchor;

                //define hasSubPages for use in later removal
                hasSubPages = true;

                newPage = list.detach()
                    .wrap( "<div " + dns + "role='page' " + dns + "url='" + id + "' " + dns + "theme='" + theme + "' " + dns + "count-theme='" + countTheme + "'><div " + dns + "role='content'></div></div>" )
                    .parent()
                    .before( "<div " + dns + "role='header' " + dns + "theme='" + o.headerTheme + "'><div class='ui-title'>" + title + "</div></div>" )
                    .after( persistentFooterID ? $( "<div " + dns + "role='footer' " + dns + "id='"+ persistentFooterID +"'>" ) : "" )
                    .parent()
                    .appendTo( $.mobile.pageContainer );

                newPage.page();

                anchor = parent.find( 'a:first' );

                if ( !anchor.length ) {
                    anchor = $( "<a/>" ).html( nodeEls || title ).prependTo( parent.empty() );
                }

                anchor.attr( "href", "#" + id );

            }).list2view();

            // on pagehide, remove any nested pages along with the parent page, as long as they aren't active
            // and aren't embedded
            if ( hasSubPages &&
                parentPage.is( ":jqmData(external-page='true')" ) &&
                parentPage.data( "mobile-page" ).options.domCache === false ) {

                var newRemove = function( e, ui ) {
                    var nextPage = ui.nextPage, npURL,
                        prEvent = new $.Event( "pageremove" );

                    if ( ui.nextPage ) {
                        npURL = nextPage.jqmData( "url" );
                        if ( npURL.indexOf( parentUrl + "&" + $.mobile.subPageUrlKey ) !== 0 ) {
                            self.childPages().remove();
                            parentPage.trigger( prEvent );
                            if ( !prEvent.isDefaultPrevented() ) {
                                parentPage.removeWithDependents();
                            }
                        }
                    }
                };

                // unbind the original page remove and replace with our specialized version
                parentPage
                    .unbind( "pagehide.remove" )
                    .bind( "pagehide.remove", newRemove);
            }
        },

        // TODO sort out a better way to track sub pages of the list2view this is brittle
        childPages: function() {
            var parentUrl = this.parentPage.jqmData( "url" );

            return $( ":jqmData(url^='"+  parentUrl + "&" + $.mobile.subPageUrlKey + "')" );
        }
    });

    $.widget( "mobile.list2view", $.mobile.list2view, $.mobile.behaviors.addFirstLastClasses );

//auto self-init widgets
    $.mobile.document.bind( "pagecreate create", function( e ) {
        $.mobile.list2view.prototype.enhanceWithin( e.target );
    });

})( jQuery );


// MS Add support for divided lists

(function( $, undefined ) {

    $.mobile.list2view.prototype.options.autodividers = false;
    $.mobile.list2view.prototype.options.autodividersSelector = function( elt ) {
        // look for the text in the given element
        var text = $.trim( elt.text() ) || null;

        if ( !text ) {
            return null;
        }

        // create the text for the divider (first uppercased letter)
        text = text.slice( 0, 1 ).toUpperCase();

        return text;
    };

    $.mobile.document.delegate( "ul,ol", "list2viewcreate", function() {

        var list = $( this ),
            list2view = list.data( "mobile-list2view" );

        if ( !list2view || !list2view.options.autodividers ) {
            return;
        }

        var replaceDividers = function () {
            list.find( "li:jqmData(role='list-divider')" ).remove();

            var lis = list.find( 'li' ),
                lastDividerText = null, li, dividerText;

            for ( var i = 0; i < lis.length ; i++ ) {
                li = lis[i];
                dividerText = list2view.options.autodividersSelector( $( li ) );

                if ( dividerText && lastDividerText !== dividerText ) {
                    var divider = document.createElement( 'li' );
                    divider.appendChild( document.createTextNode( dividerText ) );
                    divider.setAttribute( 'data-' + $.mobile.ns + 'role', 'list-divider' );
                    li.parentNode.insertBefore( divider, li );
                }

                lastDividerText = dividerText;
            }
        };

        var afterList2viewRefresh = function () {
            list.unbind( 'list2viewafterrefresh', afterList2viewRefresh );
            replaceDividers();
            list2view.refresh();
            list.bind( 'list2viewafterrefresh', afterList2viewRefresh );
        };

        afterList2viewRefresh();
    });

})( jQuery );


// MS Add support for filtered lists

(function( $, undefined ) {

    $.mobile.list2view.prototype.options.filter = false;
    $.mobile.list2view.prototype.options.filterPlaceholder = "Filter items...";
    $.mobile.list2view.prototype.options.filterTheme = "c";
    $.mobile.list2view.prototype.options.filterReveal = false;
// TODO rename callback/deprecate and default to the item itself as the first argument
    var defaultFilterCallback = function( text, searchValue, item ) {
        return text.toString().toLowerCase().indexOf( searchValue ) === -1;
    };

    $.mobile.list2view.prototype.options.filterCallback = defaultFilterCallback;

    $.mobile.document.delegate( "ul, ol", "list2viewcreate", function() {

        var list = $( this ),
            list2view = list.data( "mobile-list2view" );

        if ( !list2view || !list2view.options.filter ) {
            return;
        }

        if ( list2view.options.filterReveal ) {
            list.children().addClass( "ui-screen-hidden" );
        }

        var wrapper = $( "<form>", {
                "class": "ui-listview-filter ui-bar-" + list2view.options.filterTheme,
                "role": "search"
            }).submit( function( e ) {
                    e.preventDefault();
                    search.blur();
                }),
            onKeyUp = function( e ) {
                var $this = $( this ),
                    val = this.value.toLowerCase(),
                    listItems = null,
                    li = list.children(),
                    lastval = $this.jqmData( "lastval" ) + "",
                    childItems = false,
                    itemtext = "",
                    item,
                // Check if a custom filter callback applies
                    isCustomFilterCallback = list2view.options.filterCallback !== defaultFilterCallback;

                if ( lastval && lastval === val ) {
                    // Execute the handler only once per value change
                    return;
                }

                list2view._trigger( "beforefilter", "beforefilter", { input: this } );

                // Change val as lastval for next execution
                $this.jqmData( "lastval" , val );
                if ( isCustomFilterCallback || val.length < lastval.length || val.indexOf( lastval ) !== 0 ) {

                    // Custom filter callback applies or removed chars or pasted something totally different, check all items
                    listItems = list.children();
                } else {

                    // Only chars added, not removed, only use visible subset
                    listItems = list.children( ":not(.ui-screen-hidden)" );

                    if ( !listItems.length && list2view.options.filterReveal ) {
                        listItems = list.children( ".ui-screen-hidden" );
                    }
                }

                if ( val ) {

                    // This handles hiding regular rows without the text we search for
                    // and any list dividers without regular rows shown under it

                    for ( var i = listItems.length - 1; i >= 0; i-- ) {
                        item = $( listItems[ i ] );
                        itemtext = item.jqmData( "filtertext" ) || item.text();

                        if ( item.is( "li:jqmData(role=list-divider)" ) ) {

                            item.toggleClass( "ui-filter-hidequeue" , !childItems );

                            // New bucket!
                            childItems = false;

                        } else if ( list2view.options.filterCallback( itemtext, val, item ) ) {

                            //mark to be hidden
                            item.toggleClass( "ui-filter-hidequeue" , true );
                        } else {

                            // There's a shown item in the bucket
                            childItems = true;
                        }
                    }

                    // Show items, not marked to be hidden
                    listItems
                        .filter( ":not(.ui-filter-hidequeue)" )
                        .toggleClass( "ui-screen-hidden", false );

                    // Hide items, marked to be hidden
                    listItems
                        .filter( ".ui-filter-hidequeue" )
                        .toggleClass( "ui-screen-hidden", true )
                        .toggleClass( "ui-filter-hidequeue", false );

                } else {

                    //filtervalue is empty => show all
                    listItems.toggleClass( "ui-screen-hidden", !!list2view.options.filterReveal );
                }
                list2view._addFirstLastClasses( li, list2view._getVisibles( li, false ), false );
            },
            search = $( "<input>", {
                placeholder: list2view.options.filterPlaceholder
            })
                .attr( "data-" + $.mobile.ns + "type", "search" )
                .jqmData( "lastval", "" )
                .bind( "keyup change input", onKeyUp )
                .appendTo( wrapper )
                .textinput();

        if ( list2view.options.inset ) {
            wrapper.addClass( "ui-listview-filter-inset" );
        }

        wrapper.bind( "submit", function() {
            return false;
        })
            .insertBefore( list );
    });

})( jQuery );
*/