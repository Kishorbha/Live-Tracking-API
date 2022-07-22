const MongoDbObjectId = require('mongoose').Types.ObjectId;


// Warn if overriding existing method
if(Array.prototype.included)
    console.warn("Overriding existing Array.prototype.included. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
if(Array.prototype.getObjectId)
    console.warn("Overriding existing Array.prototype.getObjectId. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
if(Array.prototype.getStringId)
    console.warn("Overriding existing Array.prototype.getStringId. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
if(Array.prototype.intersect)
    console.warn("Overriding existing Array.prototype.intersect. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
if(Array.prototype.difference)
    console.warn("Overriding existing Array.prototype.difference. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");


Array.prototype.included = function (target) {
    return this.some(function (source) {
        return source.toString() === target.toString();
    });
};
Array.prototype.getObjectId = function () {
    let filtered = this.filter( stringId => MongoDbObjectId.isValid(stringId) );
    return filtered.map( stringId => MongoDbObjectId(stringId) );
};
Array.prototype.getStringId = function () {
    let filtered = this.filter( stringId => MongoDbObjectId.isValid(stringId) );
    return filtered.map( stringId => stringId.toString() );
};
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time
    if (this.length !== array.length)
        return false;

    for (let i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;
        }
        else if( !compare(this[i] , array[i]) ) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
};

/**
 * return sub set of intersected array
 * @param array
 * */
Array.prototype.intersect = function (array) {
    return this.filter(value => array.includes(value))
};
//element in self but not in array
Array.prototype.difference = function (array) {
    return this.filter(value => ! array.includes(value))
};

function compare(s,d){
    if( typeof s === 'object' )return s.equals(d);
    if( typeof d === 'object' )return d.equals(s);
    return s === d;
}


// Hide method from for-in loops
Object.defineProperty(Array.prototype, "included", {enumerable: false});
Object.defineProperty(Array.prototype, "getObjectId", {enumerable: false});
Object.defineProperty(Array.prototype, "getStringId", {enumerable: false});
Object.defineProperty(Array.prototype, "equals", {enumerable: false});
Object.defineProperty(Array.prototype, "intersect", {enumerable: false});
Object.defineProperty(Array.prototype, "difference", {enumerable: false});
