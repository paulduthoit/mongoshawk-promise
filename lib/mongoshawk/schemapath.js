var async = require("async");

/**
 * SchemaPath constructor
 *
 * @params {string} path
 *
 * @api public
 */
function SchemaPath(path) {

	// Check datas
	if(typeof path !== "string")
		throw new Error("path have to be a string");

	// Set instance datas
	this.path = path;

}


/**
 * SchemaPath datas
 */
SchemaPath.prototype.path;


/**
 * Get function
 *
 * @params {string|array} path
 * @params {mixed} 	  	  data
 *
 * @api public
 */
SchemaPath.get = function(path, data) {

	// Check args
	if(typeof path !== "string" && !(path instanceof Array))
		throw new Error("path have to be a string or an array");
	if(typeof data === "undefined")
		throw new Error("data have to be defined");

	// Data
	var result;
	var pathParent;

	// Check if path is empty
	if(path instanceof Array && path.length === 0 || typeof path === "string" && path === "") {
		return data;
	}

	// Split path
	if(!(path instanceof Array)) {
		path = path.split(".");
	} else {
		path = path.slice(0);
	}

	// Get path parent
	pathParent = path.shift();

	// If data is array
	if(data instanceof Array) {

		// Data
		result = [];

		// Walk through data
		data.forEach(function(dataItem) {

			// Check if path exists
			if(typeof dataItem[pathParent] !== "undefined") {

				// Get data item child
				var dataItemChild = SchemaPath.get(path, dataItem[pathParent]);

				// If data item child is an array
				if(dataItemChild instanceof Array) {
					result = result.concat(dataItemChild);
				}

				// Get data child
				else if(typeof dataItemChild !== "undefined") {
					result.push(dataItemChild);
				}

			}

		});

		// Return result
		return result;

	}

	// If data is object
	else if(typeof data === "object") {

		// Check if path exists
		if(typeof data[pathParent] !== "undefined") {

			// Get data item child
			result = SchemaPath.get(path, data[pathParent]);

		}

		// Return result
		return result;

	}

	// If data is not object
	else {

		// Return undefined
		return result;

	}

}


/**
 * ToObject function
 *
 * @params {string|array} path
 * @params {mixed} 		  value
 * @params {int} 		  [limit]
 *
 * @api public
 */
SchemaPath.toObject = function(path, value, limit) {

    // Check method arguments
    if(typeof limit === "undefined")
        limit = 0;

	// Check datas
	if(typeof path !== "string" && !(path instanceof Array))
		throw new Error("datas have to be a string or an array");
	if(typeof limit !== "number")
		throw new Error("limit have to be a number");

	// Datas
	var result;
	var pathParent;

	// Check if path is empty
	if(path instanceof Array && path.length === 0 || typeof path === "string" && path === "") {
		return value;
	}

	// Split path
	if(!(path instanceof Array)) {
		path = path.split(".");
	} else {
		path = path.slice(0);
	}

	// Get path parent
	pathParent = path.shift();

	// Set result object
	if(limit === 1 && path.length > 0) {
		result = {};
		result[pathParent] = {};
		result[pathParent][path.join(".")] = value;
	}

	// Set result object
	else if(limit === 1) {
		result = {};
		result[pathParent] = {};
		result[pathParent] = value;
	}

	else if(limit > 1) {
		result = {};
		result[pathParent] = SchemaPath.toObject(path, value, (limit-1));
	}

	else {
		result = {};
		result[pathParent] = SchemaPath.toObject(path, value);
	}

	// Return result
	return result;

}


/**
 * Resolve function
 *
 * @params {string} path
 *
 * @api public
 */
SchemaPath.prototype.get = function(data) {

	// Datas
	var path = this.path;

	// Return result
	return SchemaPath.get(path, data);

}


/**
 * Resolve function
 *
 * @params {mixed} value
 * @params {int}   limit
 *
 * @api public
 */
SchemaPath.prototype.toObject = function(value, limit) {

    // Check method arguments
    if(typeof limit === "undefined")
        limit = 0;

	// Check datas
	if(typeof limit !== "number")
		throw new Error("limit have to be a number");

	// Datas
	var path = this.path;

	// Return result
	return SchemaPath.toObject(path, value, limit);

}


/**
 * Module exports
 */
module.exports = SchemaPath;