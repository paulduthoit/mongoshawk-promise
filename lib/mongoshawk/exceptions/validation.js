var ValidationDefaultExceptions = require('./defaults').ValidationException;


/**
 * Validation exception constructor
 *
 * @params {string} name
 *
 * @api public
 */
function ValidationException(name) {

	// Check datas
	if(typeof(name) !== "string" || typeof(ValidationDefaultExceptions[name]) !== "object")
		throw new Error("name have to be a string pointing to a defined exception");

    // Set default instance datas
    this.name = "ValidationException";
    this.type = name;
    this.code = ValidationDefaultExceptions[name].code;

    // Set custom instance message
    if(name === "NotMatchRegex") {
    	if(!(arguments[1] instanceof RegExp)) throw new Error("2nd argument have to be a regex");
    	this.message = ValidationDefaultExceptions[name].messageBeforeRegex + arguments[1].toString() + ValidationDefaultExceptions[name].messageAfterRegex;
    } else if(name === "NotBetweenMinMax") {
    	if(!(arguments[1] instanceof Number && arguments[2] instanceof Number)) throw new Error("2nd and 3rd arguments have to be numbers");
    	this.message = ValidationDefaultExceptions[name].messageBeforeMin + arguments[1] + ValidationDefaultExceptions[name].messageBetween + arguments[2] + ValidationDefaultExceptions[name].messageAfterMax;
    } else if(name === "NotAboveMin") {
    	if(!(arguments[1] instanceof Number)) throw new Error("2nd argument have to be a number");
    	this.message = ValidationDefaultExceptions[name].messageBeforeMin + arguments[1] + ValidationDefaultExceptions[name].messageAfterMin;
    } else if(name === "NotBelowMax") {
    	if(!(arguments[1] instanceof Number)) throw new Error("2nd argument have to be a number");
    	this.message = ValidationDefaultExceptions[name].messageBeforeMax + arguments[1] + ValidationDefaultExceptions[name].messageAfterMax;
    } else if(name === "NotInList") {
    	if(!(arguments[1] instanceof Array)) throw new Error("2nd argument have to be an array");
    	this.message = ValidationDefaultExceptions[name].messageBeforeList + arguments[1].slice(0, -1).join(ValidationDefaultExceptions[name].listSeparator) + ValidationDefaultExceptions[name].lastListSeparator + arguments[1].slice(-1);
    } else if(name === "NotEqual") {
    	if(!(arguments[1] instanceof Number)) throw new Error("2nd argument have to be a number");
    	this.message = ValidationDefaultExceptions[name].messageBeforeNumber + arguments[1] + ValidationDefaultExceptions[name].messageAfterNumber;
    } else if(name === "NotDifferent") {
    	if(!(arguments[1] instanceof Number)) throw new Error("2nd argument have to be a number");
    	this.message = ValidationDefaultExceptions[name].messageBeforeNumber + arguments[1] + ValidationDefaultExceptions[name].messageAfterNumber;
    } else if(name === "NotLowerEqual") {
    	if(!(arguments[1] instanceof Number)) throw new Error("2nd argument have to be a number");
    	this.message = ValidationDefaultExceptions[name].messageBeforeNumber + arguments[1] + ValidationDefaultExceptions[name].messageAfterNumber;
    } else if(name === "NotLower") {
    	if(!(arguments[1] instanceof Number)) throw new Error("2nd argument have to be a number");
    	this.message = ValidationDefaultExceptions[name].messageBeforeNumber + arguments[1] + ValidationDefaultExceptions[name].messageAfterNumber;
    } else if(name === "NotUpperEqual") {
    	if(!(arguments[1] instanceof Number)) throw new Error("2nd argument have to be a number");
    	this.message = ValidationDefaultExceptions[name].messageBeforeNumber + arguments[1] + ValidationDefaultExceptions[name].messageAfterNumber;
    } else if(name === "NotUpper") {
    	if(!(arguments[1] instanceof Number)) throw new Error("2nd argument have to be a number");
    	this.message = ValidationDefaultExceptions[name].messageBeforeNumber + arguments[1] + ValidationDefaultExceptions[name].messageAfterNumber;
    } else if(name === "NotInRange") {
    	if(!(arguments[1] instanceof Number && arguments[2] instanceof Number)) throw new Error("2nd and 3rd arguments have to be numbers");
    	this.message = ValidationDefaultExceptions[name].messageBeforeMin + arguments[1] + ValidationDefaultExceptions[name].messageBetween + arguments[2] + ValidationDefaultExceptions[name].messageAfterMax;
    } else if(name === "NotSame") {
    	this.message = ValidationDefaultExceptions[name].messageBeforeTest + arguments[1] + ValidationDefaultExceptions[name].messageAfterTest;
    } else if(name === "NotStrictSame") {
    	this.message = ValidationDefaultExceptions[name].messageBeforeTest + arguments[1] + ValidationDefaultExceptions[name].messageAfterTest;
    }

    // Set standard instance message
    else {
    	this.message = ValidationDefaultExceptions[name].message;
    }

    // Set custom instance datas
    if(name === "ValidationFailed" && arguments[1] instanceof Array) {
    	this.exceptions = arguments[1];
    }

}


/**
 * Inherit from error
 */
ValidationException.prototype = Object.create(Error.prototype);


/**
 * To object function
 */
ValidationException.prototype.toObject = function() {

	// Datas
	var error = {};
	error.message = this.message;
	error.type = this.name;
	error.name = this.type;
	error.code = this.code;

	// Add exceptions
	if(this.exceptions) {
		error.exceptions = this.exceptions;
	}

	// Return error object
	return {
		error: error
	};
	
};


/**
 * Module exports
 */
module.exports = ValidationException;