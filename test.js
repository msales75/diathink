var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Car = (function () {
    function Car() {
        this._isRunning = false;
        this._distanceFromStart = 0;
    }
    /**
    *   Starts the car's ignition so that it can drive.
    */
    Car.prototype.start = function () {
        this._isRunning = true;
    };

    /**
    *   Attempt to drive a distance. Returns true or false based on whether or not the drive was successful.
    *
    *   @param {number} distance The distance attempting to cover
    *
    *   @returns {boolean} Whether or not the drive was successful
    */
    Car.prototype.drive = function (distance) {
        if (this._isRunning) {
            this._distanceFromStart += distance;
            return true;
        }
        return false;
    };

    /**
    *   Gives the distance from starting position
    *
    *   @returns {number} Distance from starting position;
    */
    Car.prototype.getPosition = function () {
        return this._distanceFromStart;
    };
    return Car;
})();

var MarkCar = (function (_super) {
    __extends(MarkCar, _super);
    function MarkCar() {
        _super.apply(this, arguments);
    }
    MarkCar.isMarkCar = function () {
        return true;
    };
    return MarkCar;
})(Car);

var marksCar = new MarkCar();

marksCar.drive(5);
MarkCar.isMarkCar();
//# sourceMappingURL=test.js.map
