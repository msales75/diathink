
// manage resources
$D.QueueManager= M.Object.extend({
    resources: {'path/123': {}},
    queue: {queueID: ""},
    waitingFor: {'resource': ['queueid']},
    canProvide: {}
    // organize events into action-trees?

});


// give warnings for queue-items with no path?
//   require guaranteed path for high-priority items?

// possible bugs: ambiguous dependencies/fulfillments
// ambiguity between data-source-path and data-instantiation-path
// forgetting to use frees


// DISALLOW any function from ever offering a redundant resource
// Resources can be destroyed via 'frees'
// 'temporarily unavailable' resources can be done with frees,
//    but should be used very rarely

// determine next event
$D.QueueEvent = M.Object.extend({
    type: 'QueueEvent',
    eventType: null,
    foregroundLevel: 0, // 0=always hidden from user to 5=urgent
    timestampTarget: null, // warn if past this timestamp
    timestampAbort: null, // abort if past this timestamp
    // replaceable: false, // can be made obsolete by a new resource
    requires: function(params) {},
    prefers: function(params) {},
    provides: function(params) {},
    frees: function(params) {},
    exec: function(params) {},
    failed: function(params) {}, // if cancelled because a necessary op failed

    call: function() {

    },
    // shortcuts to call
    setContext: function() {

    },
    then: function() { // do after last queued item in current context

    },

    // internal loop for emptying queue
    _next: function() {
       // determine what event to execute next off the queue
       // optionally log event-processing with performance-data

    }
});

