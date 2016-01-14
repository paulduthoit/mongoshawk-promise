var ValidationException = require('./exceptions/validation');


/**
 * Validation constructor
 */
function Validation() {}



/**
 * Regex validation
 *
 * @params {String} value
 * @params {Regex} regex
 *
 * @api private
 */
Validation.regex = function(value, regex) {

    // Check datas
    if(!(regex instanceof RegExp))
        throw new Error("regex have to be a regex");

    // Check if is string
    if(typeof value !== "string") {
        return new ValidationException("NotAString");
    }

    // Check if match
    if(!value.match(regex)) {
        return new ValidationException("NotMatchRegex", regex.toString());
    }

    return null;

}

/**
 * Email validation
 *
 * @params {String} value
 *
 * @api private
 */
Validation.email = function(value) {

    // Check if is string
    if(typeof value !== "string") {
        return new ValidationException("NotAString");
    }

    // Check if match
    if(!value.match(/^[-0-9a-zA-Z.+_]+@[-0-9a-zA-Z.+_]+\.[a-zA-Z]{2,8}$/)) {
        return new ValidationException("NotAnEmail");
    }

    return null;

}

/**
 * Alpha validation
 *
 * @params {String} value
 *
 * @api private
 */
Validation.alpha = function(value) {

    // Check if is string
    if(typeof value !== "string") {
        return new ValidationException("NotAString");
    }

    // Check if match
    if(!value.match(/^[a-zA-Z]*$/)) {
        return new ValidationException("NotAlpha");
    }

    return null;

}

/**
 * Alpha or numeric validation
 *
 * @params {String} value
 *
 * @api private
 */
Validation.alphaNumeric = function(value) {

    // Check if is string
    if(typeof value !== "string") {
        return new ValidationException("NotAString");
    }

    // Check if match
    if(!value.match(/^[0-9a-zA-Z]*$/)) {
        return new ValidationException("NotAlphaNumeric");
    }

    return null;

}

/**
 * Alpha, numeric, dash or underscore validation
 *
 * @params {String} value
 *
 * @api private
 */
Validation.alphaNumericDashUnderscore = function(value) {

    // Check if is string
    if(typeof value !== "string") {
        return new ValidationException("NotAString");
    }

    // Check if match
    if(!value.match(/^[0-9a-zA-Z_-]*$/)) {
        return new ValidationException("NotAlphaNumericDashUnderscore");
    }

    return null;

}

/**
 * Length validation
 *
 * @params {String} value
 * @params {Number} min
 * @params {Number} [max]
 *
 * @api private
 */
Validation.length = function(value, min, max) {

    // Default datas
    if(!min) min = 0;

    // Check datas
    if(typeof min !== "number")
        throw new Error("min have to be a number");
    if(typeof max !== "undefined" && typeof max !== "number")
        throw new Error("max have to be a number");

    // Check if is string
    if(typeof value !== "string") {
        return new ValidationException("NotAString");
    }

    // Check if match
    if(typeof max !== "undefined" && min > 0 && (value.length < min || value.length > max)) {
        return new ValidationException("NotBetweenMinMax", min, max);
    } else if(value.length < min) {
        return new ValidationException("NotAboveMin", min);
    } else if(typeof max !== "undefined" && value.length > max) {
        return new ValidationException("NotBelowMax", max);
    }

    return null;

}

/**
 * InList validation
 *
 * @params {String} value
 * @params {Array} list
 *
 * @api private
 */
Validation.inList = function(value, list) {

    // Check datas
    if(!(list instanceof Array))
        throw new Error("list have to be an array");

    // Check if match
    if(list.indexOf(value) === -1) {
        var popped = list.pop();
        return new ValidationException("NotInList", list);
    }

    return null;

}

/**
 * Ip validation
 *
 * @params {String} value
 * @params {String} [type] (ipv4|ipv6|both)
 *
 * @api private
 */
Validation.ip = function(value, type) {

    // Check arguments
    if(arguments.length === 1) {
        type = "both";
    }

    // Check datas
    if(typeof type !== "string" || [ "ipv4", "ipv6", "both" ].indexOf(type) === -1)
        throw new Error("type have to be a string defined as ipv4, ipv6 or both");

    // Check if is string
    if(typeof value !== "string") {
        return new ValidationException("NotAString");
    }

    // Check if match
    if(type === "ipv4" && !value.match(/^([0-9]{1,3}\.){3}([0-9]{1,3})$/)) {
        return new ValidationException("NotAnIPv4");
    } else if(type === "ipv6" && !value.match(/^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/)) {
        return new ValidationException("NotAnIPv6");
    } else if(type === "both" && !value.match(/^([0-9]{1,3}\.){3}([0-9]{1,3})$|^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/)) {
        return new ValidationException("NotAnIP");
    }

    return null;

}

/**
 * Url validation
 *
 * @params {String} value
 *
 * @api private
 */
Validation.url = function(value) {

    // Check if is string
    if(typeof value !== "string") {
        return new ValidationException("NotAString");
    }

    // Check if match
    if(!value.match(/^((http:\/\/|https:\/\/)(www.)?(([a-zA-Z0-9-]){1,}\.){1,4}([a-zA-Z]){2,6}(\/([a-zA-Z-_\/\.0-9#:?=&;,\(\)%]*)?)?)$/)) {
        return new ValidationException("NotAnUrl");
    }

    return null;

}



/**
 * Comparison validation
 *
 * @params {Number} value
 * @params {String} operator
 * @params {Number} check
 *
 * @api private
 */
Validation.comparison = function(value, operator, check) {

    // Check datas
    if(typeof operator !== "string" || !operator.match(/(=|!=|<=|<|>=|>)$/))
        throw new Error("operator have to be defined as a valid operator");
    if(typeof check !== "number")
        throw new Error("check have to be a number");

    // Check if is number
    if(typeof value !== "number") {
        return new ValidationException("NotANumber");
    }

    // Check if match
    if(operator === "=" && value != check) {
        return new ValidationException("NotEqual", check);
    } else if(operator === "!=" && value == check) {
        return new ValidationException("NotDifferent", check);
    } else if(operator === "<=" && value > check) {
        return new ValidationException("NotLowerEqual", check);
    } else if(operator === "<" && value >= check) {
        return new ValidationException("NotLower", check);
    } else if(operator === ">=" && value < check) {
        return new ValidationException("NotUpperEqual", check);
    } else if(operator === ">" && value <= check) {
        return new ValidationException("NotUpper", check);
    }

    return null;

}

/**
 * Range validation
 *
 * @params {Number} value
 * @params {Number} min
 * @params {Number} max
 *
 * @api private
 */
Validation.range = function(value, min, max) {

    // Check datas
    if(typeof min !== "number")
        throw new Error("min have to be a number");
    if(typeof max !== "number")
        throw new Error("max have to be a number");

    // Check if is number
    if(typeof value !== "number") {
        return new ValidationException("NotANumber");
    }

    // Check if match
    if(value < min || value > max) {
        return new ValidationException("NotInRange", min, max);
    }

    return null;

}



/**
 * Equal validation
 *
 * @params {Mixed} value
 * @params {Mixed} check
 *
 * @api private
 */
Validation.equalTo = function(value, check) {

    // Check if equal to check
    if(value != check) {
        return new ValidationException("NotSame", check);;
    }

    return null;

}

/**
 * Strict equal validation
 *
 * @params {Mixed} value
 * @params {Mixed} check
 *
 * @api private
 */
Validation.strictEqualTo = function(value, check) {

    // Check if equal to check
    if(value !== check) {
        return new ValidationException("NotStrictSame", check);
    }

    return null;

}



/**
 * NotEmpty validation
 *
 * @params {Mixed} value
 *
 * @api private
 */
Validation.notEmpty = function(value) {

    // Check if not empty
    if(value === null) {
        return new ValidationException("Empty");
    } else if(typeof value === "string" && value === "") {
        return new ValidationException("Empty");
    } else if(typeof value === "number" && isNaN(value)) {
        return new ValidationException("Empty");
    } else if(value instanceof Date && isNaN(Number(value))) {
        return new ValidationException("Empty");
    } else if(value instanceof Array && value.length === 0) {
        return new ValidationException("Empty");
    } else if(value instanceof Object && Object.keys(value).length === 0) {
        return new ValidationException("Empty");
    }

    return null;

}


/**
 * Module exports
 */
module.exports = Validation;