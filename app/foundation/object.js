

$D.Object = function() {};
$D.Object.subclass = function(protoProps, classProperties) {
        var child, parent = this;
        if (protoProps && _.has(protoProps, 'constructor')) {
            child = protoProps.constructor;
        } else {
            child = function(){ return parent.apply(this, arguments); };
        }
        _.extend(child, parent, classProperties);
        var Surrogate = function(){ this.constructor = child; };
        Surrogate.prototype = parent.prototype;
        child.prototype = new Surrogate;
        if (protoProps) _.extend(child.prototype, protoProps);
        child.__super__ = parent.prototype;
        return child;
};

$D.bindToCaller = function(caller, method, arg) {
    return function() {
        if(_.isArray(arg)) {
            return method.apply(caller, arg);
        }
        return method.call(caller, arg);
    }
};

/**
 * @class
 *
 * Base class of all objects.
 */

/**
 * @constructor
 */
M.Object =
/** @scope M.Object.prototype */ {

    /**
     * The type of this object.
     *
     * @type String
     */
    type: 'M.Object',

    /**
     * Creates an object based on a passed prototype.
     *
     * @param {Object} proto The prototype of the new object.
     */
    create: function(proto) {
        var f = function(){};
        f.prototype = proto;
        return new f();
    },

    /**
     * Includes passed properties into a given object.
     *
     * @param {Object} properties The properties to be included into the given object.
     */
    include: function(properties) {
        for(var prop in properties) {
            this[prop] = properties[prop];
        }
    },

    /**
     * Creates a new class and extends it with all functions of the defined super class
     * The function takes multiple input arguments. Each argument serves as additional
     * super classes - see mixins.
     *
     * @param {Object} properties The properties to be included into the given object.
     */
    extend: function(properties){
        /* create the new object */
        var obj = M.Object.create(this);

        /* assign the properties passed with the arguments array */
        obj.include(properties);

        /* return the new object */
        return obj;
    },

    /**
     * Binds a method to its caller, so it is always executed within the right scope.
     *
     * @param {Object} caller The scope of the method that should be bound.
     * @param {Object} method The method to be bound.
     * @param {Object} arg One or more arguments. If more, then apply is used instead of call.
     */
    bindToCaller: function(caller, method, arg) {
        return function() {
            if(_.isArray(arg)) {
                return method.apply(caller, arg);
            }
            return method.call(caller, arg);
        }
    },

    /**
     * Returns the class property behind the given key.
     *
     * @param {String} key The key of the property to be returned.
     */
    get: function(key) {
        return this[key];
    },

    /**
     * Returns the class property behind the given key.
     *
     * @param {String} key The key of the property to be changed.
     * @param {Object|String} value The value to be set.
     */
    set: function(key, value) {
        this[key] = value;
    },

    /**
     * This method will remove an object from the DOM and then delete it. 
     */

};