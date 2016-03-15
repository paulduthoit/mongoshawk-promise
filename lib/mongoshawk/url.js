var _ = require('underscore');


/**
 * Url constructor
 */
var Url = function() {};



/**
 * Private datas
 */
var urlRegex = new RegExp("(\\ *[a-z]+\\()" + "|" + 								// Logical Query Opener
						  "(\\.[a-z]+\\()" + "|" +									// Method Opener
						  "(\\)\\ *)" + "|" +										// Method Closer
						  "(\\ *,\\ *)" + "|" +										// Query/Argument Separator
						  "(\\ *[a-zA-Z0-9_\\.\\-]+)(?=\\.[a-z]+\\()" + "|" +		// Field followed by Method
						  "(\\ *[a-zA-Z0-9_\\.\\-\\$]+)(?=\\ *(,|\\)))" + "|" +		// Field alone
						  "(\\ *[a-zA-Z0-9_\\.\\-\\$]+)$" + "|" +					// Finished Field
						  "([^\\(\\),\\\\]+)(?:\\\\.[^\\(\\),\\\\]*)*", "g");		// Argument



/**
 * Parse query
 *
 * @params {String} stringToParse
 * @return parsedFilter
 * @api public
 */
Url.parseQuery = function(stringToParse) {

	// Check datas
	if(typeof stringToParse !== "string")
		throw new Error("stringToParse have to be a string");

	// Datas
	var query 					= {};
	var currentObj 				= query;
	var currentObjType 			= "MAIN";
	var currentObjKey	 		= false;
	var onLogicalNot			= false;
	var onComparisonByNumber	= false;
	var onComparisonByValue		= false;
	var onComparisonByArray		= false;

	// Check string to parse
	if(!new RegExp(urlRegex.source, "g").test(stringToParse))
		throw new Error("Invalid query request");

	// Split string
	var splitedString = stringToParse.match(urlRegex);

	// Walk through the splited string
	splitedString.forEach(function(value) {

		// Trim value
		value = value.trim();

		// Open logical operator
		if(value === "or(" || value === "and(" || value === "nor(") {

			// Datas
			var logicalOperator = "$"+value.substr(0, value.length-1);

			// If current obj if main
			if(currentObjType === "MAIN") {

				// To current obj
				currentObj[logicalOperator] = {
					__parentObj: currentObj,
					__parentObjType: currentObjType,
					__parentObjKey: logicalOperator,
					__datas: []
				};

				// Push new item
				currentObj[logicalOperator].__datas.push({
					__parentObj: currentObj[logicalOperator],
					__parentObjType: "LOGICAL_ARRAY",
					__parentObjKey: 0,
					__datas: {}
				});

				// Set currrent obj
				currentObj = currentObj[logicalOperator].__datas[0];
				currentObjType = "LOGICAL_ITEM";
				currentObjKey = false;

			} else {

				// To current obj
				currentObj.__datas[logicalOperator] = {
					__parentObj: currentObj,
					__parentObjType: currentObjType,
					__parentObjKey: logicalOperator,
					__datas: []
				};

				// Push new item
				currentObj.__datas[logicalOperator].__datas.push({
					__parentObj: currentObj.__datas[logicalOperator],
					__parentObjType: "LOGICAL_ARRAY",
					__parentObjKey: 0,
					__datas: {}
				});

				// Set currrent obj
				currentObj = currentObj.__datas[logicalOperator].__datas[0];
				currentObjType = "LOGICAL_ITEM";
				currentObjKey = false;

			}

			// Return
			return;

		}

		// Open not operator
		else if(value === ".not(") {

			// Datas
			var notOperator = "$"+value.substr(1, value.length-2);

			// To current obj
			currentObj.__datas[notOperator] = {
				__parentObj: currentObj,
				__parentObjType: currentObjType,
				__parentObjKey: notOperator,
				__datas: {}
			};

			// Set currrent obj
			currentObj = currentObj.__datas[notOperator];
			currentObjType = "FIELD";
			currentObjKey = false;

			// Set state
			onLogicalNot = true;

			// Return
			return;

		}

		// Open number comparison operator
		else if([".gt(", ".gte(", ".lt(", ".lte(", "gt(", "gte(", "lt(", "lte("].indexOf(value) !== -1) {

			// Datas
			var comparisonOperator = value.substr(0, 1) === "." ? "$"+value.substr(1, value.length-2) : "$"+value.substr(0, value.length-1);

			// To current obj
			currentObj.__datas[comparisonOperator] = 0;
			currentObjKey = comparisonOperator;

			// Set state
			onComparisonByNumber = true;

			// Return
			return;

		}

		// Open value comparison operator
		else if([".e(", ".ne(", "e(", "ne("].indexOf(value) !== -1) {

			// Datas
			var comparisonOperator = value.substr(0, 1) === "." ? "$"+value.substr(1, value.length-2) : "$"+value.substr(0, value.length-1);

			// To current obj
			currentObj.__datas[comparisonOperator] = "";
			currentObjKey = comparisonOperator;

			// Set state
			onComparisonByValue = true;

			// Return
			return;

		}

		// Open array comparison operator
		else if([".in(", ".nin(", "in(", "nin("].indexOf(value) !== -1) {

			// Datas
			var comparisonOperator = value.substr(0, 1) === "." ? "$"+value.substr(1, value.length-2) : "$"+value.substr(0, value.length-1);

			// To current obj
			currentObj.__datas[comparisonOperator] = [];
			currentObjKey = comparisonOperator;

			// Set state
			onComparisonByArray = true;

			// Return
			return;

		}

		// Next query / arg
		else if(value === ",") {

			// Next argument
			if(onComparisonByNumber) {

				// Return
				return;

			}

			// Next argument
			else if(onComparisonByValue) {

				// Return
				return;

			}

			// Next argument
			else if(onComparisonByArray) {

				// Return
				return;

			}

			// Next query
			else {

				// Close field
				if(currentObjType === "FIELD") {

					// Datas
					var __parentObj = currentObj.__parentObj;
					var __parentObjType = currentObj.__parentObjType;
					var __parentObjKey = currentObj.__parentObjKey;
					var __datas = currentObj.__datas;

					// Set current obj
					currentObj = __parentObj;
					currentObjType = __parentObjType;
					currentObjKey = __parentObjKey;

					// If current obj is logical item
					if(currentObjType === "LOGICAL_ITEM") {

						// Unset current obj field datas
						delete currentObj.__datas[currentObjKey];

						// Set current obj datas
						currentObj.__datas[currentObjKey] = __datas;

					}

					// If current obj is main
					else if(currentObjType === "MAIN") {

						// Unset current obj field datas
						delete currentObj[currentObjKey];

						// Set current obj datas
						currentObj[currentObjKey] = __datas;

					}

				}

				// Change logical item
				if(currentObjType === "LOGICAL_ITEM") {

					// Datas
					var __parentObj = currentObj.__parentObj;
					var __parentObjType = currentObj.__parentObjType;
					var __parentObjKey = currentObj.__parentObjKey;
					var __datas = currentObj.__datas;

					// Set current obj
					currentObj = __parentObj;
					currentObjType = __parentObjType;
					currentObjKey = __parentObjKey;

					// If current obj is logical array
					if(currentObjType === "LOGICAL_ARRAY") {

						// Unset current obj field datas
						delete currentObj.__datas[currentObjKey];

						// Set current obj datas
						currentObj.__datas[currentObjKey] = __datas;

					}

					// Push new item
					currentObj.__datas.push({
						__parentObj: currentObj,
						__parentObjType: "LOGICAL_ARRAY",
						__parentObjKey: (currentObjKey + 1),
						__datas: {}
					});

					// Set currrent obj
					currentObj = currentObj.__datas[(currentObjKey + 1)];
					currentObjType = "LOGICAL_ITEM";
					currentObjKey = false;

				}

				// Return
				return;

			}

		}

		// If value is )
		else if(value === ")") {

			// Close number comparison operator
			if(onComparisonByNumber) {
				
				onComparisonByNumber = false;

				// Return
				return;

			}

			// Close value comparison operator
			else if(onComparisonByValue) {

				onComparisonByValue = false;

				// Return
				return;

			}

			// Close array comparison operator
			else if(onComparisonByArray) {

				onComparisonByArray = false;

				// Return
				return;

			}

			// Close not operator
			else if(onLogicalNot) {

				// Close field
				if(currentObjType === "FIELD") {

					// Datas
					var __parentObj = currentObj.__parentObj;
					var __parentObjType = currentObj.__parentObjType;
					var __parentObjKey = currentObj.__parentObjKey;
					var __datas = currentObj.__datas;

					// Set current obj
					currentObj = __parentObj;
					currentObjType = __parentObjType;
					currentObjKey = __parentObjKey;

					// If current obj is logical item
					if(currentObjType === "FIELD") {

						// Unset current obj field datas
						delete currentObj.__datas[currentObjKey];

						// Set current obj datas
						currentObj.__datas[currentObjKey] = __datas;

					}

				}

				// Change state
				onLogicalNot = false;

				// Return
				return;

			}

			// Close logical operator
			else {

				// Close field
				if(currentObjType === "FIELD") {

					// Datas
					var __parentObj = currentObj.__parentObj;
					var __parentObjType = currentObj.__parentObjType;
					var __parentObjKey = currentObj.__parentObjKey;
					var __datas = currentObj.__datas;

					// Set current obj
					currentObj = __parentObj;
					currentObjType = __parentObjType;
					currentObjKey = __parentObjKey;

					// If current obj is logical item
					if(currentObjType === "LOGICAL_ITEM") {

						// Unset current obj field datas
						delete currentObj.__datas[currentObjKey];

						// Set current obj datas
						currentObj.__datas[currentObjKey] = __datas;

					}

					// If current obj is main
					if(currentObjType === "MAIN") {

						// Unset current obj field datas
						delete currentObj[currentObjKey];

						// Set current obj datas
						currentObj[currentObjKey] = __datas;

					}

				}

				// Close logical item
				if(currentObjType === "LOGICAL_ITEM") {

					// Datas
					var __parentObj = currentObj.__parentObj;
					var __parentObjType = currentObj.__parentObjType;
					var __parentObjKey = currentObj.__parentObjKey;
					var __datas = currentObj.__datas;

					// Set current obj
					currentObj = __parentObj;
					currentObjType = __parentObjType;
					currentObjKey = __parentObjKey;

					// If current obj is logical array
					if(currentObjType === "LOGICAL_ARRAY") {

						// Unset current obj field datas
						delete currentObj.__datas[currentObjKey];

						// Set current obj datas
						currentObj.__datas[currentObjKey] = __datas;

					}

				}

				// Close logical array
				if(currentObjType === "LOGICAL_ARRAY") {

					// Datas
					var __parentObj = currentObj.__parentObj;
					var __parentObjType = currentObj.__parentObjType;
					var __parentObjKey = currentObj.__parentObjKey;
					var __datas = currentObj.__datas;

					// Set current obj
					currentObj = __parentObj;
					currentObjType = __parentObjType;
					currentObjKey = __parentObjKey;

					// If current obj is main
					if(currentObjType === "MAIN") {

						// Unset current obj field datas
						delete currentObj[currentObjKey];

						// Set current obj datas
						currentObj[currentObjKey] = __datas;

					}

					// If current obj is logical item
					else if(currentObjType === "LOGICAL_ITEM") {

						// Unset current obj field datas
						delete currentObj.__datas[currentObjKey];

						// Set current obj datas
						currentObj.__datas[currentObjKey] = __datas;

					}

				}

				// Return
				return;

			}

		}

		// If value is other
		else if(value !== "") {

			// If onComparisonByArray
			if(onComparisonByArray) {

				currentObj.__datas[currentObjKey].push(value);

				// Return
				return;

			}

			// If onComparisonByNumber
			else if(onComparisonByNumber) {

				currentObj.__datas[currentObjKey] = value;

				// Return
				return;

			}

			// If onComparisonByValue
			else if(onComparisonByValue) {

				if(currentObj.__datas[currentObjKey] === "") {
					currentObj.__datas[currentObjKey] = value;
				} else if(currentObj.__datas[currentObjKey] instanceof Array) {
					currentObj.__datas[currentObjKey].push(value)
				} else {
					currentObj.__datas[currentObjKey] = [ currentObj.__datas[currentObjKey] ];
					currentObj.__datas[currentObjKey].push(value)
				}

				// Return
				return;

			}

			// If field in logical comparison
			else if(typeof currentObj.__datas !== "undefined") {

				// Datas
				var field = value;

				// To current obj
				currentObj.__datas[field] = {
					__parentObj: currentObj,
					__parentObjType: currentObjType,
					__parentObjKey: field,
					__datas: {}
				};

				// Set currrent obj
				currentObj = currentObj.__datas[field];
				currentObjType = "FIELD";
				currentObjKey = false;

				// Return
				return;

			}

			// If field alone
			else {

				// Datas
				var field = value;

				// To current obj
				currentObj[field] = {
					__parentObj: currentObj,
					__parentObjType: currentObjType,
					__parentObjKey: field,
					__datas: {}
				};

				// Set currrent obj
				currentObj = currentObj[field];
				currentObjType = "FIELD";
				currentObjKey = false;

				// Return
				return;

			}

		}

	});

	// Close field
	if(currentObjType === "FIELD") {

		// Datas
		var __parentObj = currentObj.__parentObj;
		var __parentObjType = currentObj.__parentObjType;
		var __parentObjKey = currentObj.__parentObjKey;
		var __datas = currentObj.__datas;

		// Set current obj
		currentObj = __parentObj;
		currentObjType = __parentObjType;
		currentObjKey = __parentObjKey;

		// If current obj is logical item
		if(currentObjType === "MAIN") {

			// Unset current obj field datas
			delete currentObj[currentObjKey];

			// Set current obj datas
			currentObj[currentObjKey] = __datas;

		}

	}

	// Return query
	return query;

}

/**
 * Parse projection
 *
 * @params {String} stringToParse
 * @return parsedFields
 * @api public
 */
Url.parseProjection = function(stringToParse) {

	// Check datas
	if(typeof stringToParse !== "string")
		throw new Error("stringToParse have to be a string");

	// Datas
	var projection 			= {};
	var currentObj 			= projection;
	var currentObjKey	 	= false;
	var currentObjLevel	 	= 0;
	var parentObj 			= false;
	var parentObjKey 		= false;
	var onProjection	 	= false;
	var onProjectionLevel 	= 0;
	var onProjectionString 	= "";
	var onQuery	 			= false;
	var onQueryLevel 		= 0;
	var onQueryString 		= "";
	var onOrderBy	 		= false;
	var onOrderByLevel	 	= 0;
	var onOrderByString	 	= "";
	var onLimit	 			= false;
	var onSkip	 			= false;
	var onAfter	 			= false;
	var onBefore	 		= false;

	// Check string to parse
	if(!new RegExp(urlRegex.source, "g").test(stringToParse))
		throw new Error("Invalid projection request");

	// Split string
	var splitedString = stringToParse.match(urlRegex);

	// Walk through the splited string
	splitedString.forEach(function(value) {

		// Trim value
		value = value.trim();

		// If value is )
		if(value === ")") {

			// On projection
			if(onProjection) {

				// Not finished
				if(onProjectionLevel > 1) {

					// Update projection datas
					onProjectionString += value;
					onProjectionLevel--;

				} 

				// Finished
				else {

					// Extend current obj
					_.extend(currentObj, Url.parseProjection(onProjectionString));

					// Reset projection datas
					onProjectionString = "";
					onProjectionLevel = 0;
					onProjection = false;

					// Close obj
					parentObj = currentObj.__parentObj;
					parentObjKey = currentObj.__parentObjKey;
					delete currentObj.__parentObj;
					delete currentObj.__parentObjKey;
					currentObj = parentObj;
					currentObjKey = parentObjKey;
					currentObjLevel--;

				}

			}

			// On query
			else if(onQuery) {

				// Not finished
				if(onQueryLevel > 1) {

					// Update query datas
					onQueryString += value;
					onQueryLevel--;

				}

				// Finished
				else {

					// Extend current obj
					_.extend(currentObj, Url.parseQuery(onQueryString));

					// Reset query datas
					onQueryString = "";
					onQueryLevel = 0;
					onQuery = false;

					// Close obj
					parentObj = currentObj.__parentObj;
					parentObjKey = currentObj.__parentObjKey;
					delete currentObj.__parentObj;
					delete currentObj.__parentObjKey;
					currentObj = parentObj;
					currentObjKey = parentObjKey;
					currentObjLevel--;

				}

			}

			// On orderby
			else if(onOrderBy) {

				// Not finished
				if(onOrderByLevel > 1) {

					// Update orderby datas
					onOrderByString += value;
					onOrderByLevel--;

				}

				// Finished
				else {

					// Set current obj options
					if(currentObj[currentObjKey] === 1) {
						currentObj[currentObjKey] = { "$options" : { orderby : Url.parseOrderBy(onOrderByString) } };
					} else if(typeof currentObj[currentObjKey]["$options"] === "object") {
						currentObj[currentObjKey]["$options"].orderby = Url.parseOrderBy(onOrderByString);
					} else {
						currentObj[currentObjKey]["$options"] = { orderby : Url.parseOrderBy(onOrderByString) };
					}

					// Reset orderby datas
					onOrderByString = "";
					onOrderByLevel = 0;
					onOrderBy = false;

				}

			}

			// On limit
			else if(onLimit) {

				// Close limit
				onLimit = false;

			} 

			// On skip
			else if(onSkip) {

				// Close skip
				onSkip = false;

			} 

			// On after
			else if(onAfter) {

				// Close after
				onAfter = false;

			} 

			// On before
			else if(onBefore) {

				// Close before
				onBefore = false;

			} 

			// Close current obj
			else {

				// Close obj
				parentObj = currentObj.__parentObj;
				parentObjKey = currentObj.__parentObjKey;
				delete currentObj.__parentObj;
				delete currentObj.__parentObjKey;
				currentObj = parentObj;
				currentObjKey = parentObjKey;
				currentObjLevel--;

			}

		}

		// If value is .limit(
		else if(value === ".limit(") {

			// On projection
			if(onProjection) {

				// Update projection datas
				onProjectionString += value;
				onProjectionLevel++;

			}

			// On query
			else if(onQuery) {

				// Update query datas
				onQueryString += value;
				onQueryLevel++;

			} 

			// On orderby
			else if(onOrderBy) {

				// Update orderby datas
				onOrderByString += value;
				onOrderByLevel++;

			} 

			// Open limit
			else {

				// Set current obj options
				if(currentObj[currentObjKey] === 1) {
					currentObj[currentObjKey] = { "$options" : { limit : 0 } };
				} else if(typeof currentObj[currentObjKey]["$options"] === "object") {
						currentObj[currentObjKey]["$options"].limit = 0;
				} else {
					currentObj[currentObjKey]["$options"] = { limit : 0 };
				}

				// Update state
				onLimit = true;

			}

		}

		// If value is .skip(
		else if(value === ".skip(") {

			// On projection
			if(onProjection) {

				// Update projection datas
				onProjectionString += value;
				onProjectionLevel++;

			}

			// On query
			else if(onQuery) {

				// Update query datas
				onQueryString += value;
				onQueryLevel++;

			} 

			// On orderby
			else if(onOrderBy) {

				// Update orderby datas
				onOrderByString += value;
				onOrderByLevel++;

			} 

			// Open skip
			else {

				// Set current obj options
				if(currentObj[currentObjKey] === 1) {
					currentObj[currentObjKey] = { "$options" : { skip : 0 } };
				} else if(typeof currentObj[currentObjKey]["$options"] === "object") {
						currentObj[currentObjKey]["$options"].skip = 0;
				} else {
					currentObj[currentObjKey]["$options"] = { skip : 0 };
				}

				// Update state
				onSkip = true;

			}

		}

		// If value is .after(
		else if(value === ".after(") {

			// On projection
			if(onProjection) {

				// Update projection datas
				onProjectionString += value;
				onProjectionLevel++;

			}

			// On query
			else if(onQuery) {

				// Update query datas
				onQueryString += value;
				onQueryLevel++;

			} 

			// On orderby
			else if(onOrderBy) {

				// Update orderby datas
				onOrderByString += value;
				onOrderByLevel++;

			} 

			// Open after
			else {

				// Set current obj options
				if(currentObj[currentObjKey] === 1) {
					currentObj[currentObjKey] = { "$options" : { after : "" } };
				} else if(typeof currentObj[currentObjKey]["$options"] === "object") {
						currentObj[currentObjKey]["$options"].after = "";
				} else {
					currentObj[currentObjKey]["$options"] = { after : "" };
				}

				// Update state
				onAfter = true;

			}

		}

		// If value is .before(
		else if(value === ".before(") {

			// On projection
			if(onProjection) {

				// Update projection datas
				onProjectionString += value;
				onProjectionLevel++;

			}

			// On query
			else if(onQuery) {

				// Update query datas
				onQueryString += value;
				onQueryLevel++;

			} 

			// On orderby
			else if(onOrderBy) {

				// Update orderby datas
				onOrderByString += value;
				onOrderByLevel++;

			} 

			// Open before
			else {

				// Set current obj options
				if(currentObj[currentObjKey] === 1) {
					currentObj[currentObjKey] = { "$options" : { before : "" } };
				} else if(typeof currentObj[currentObjKey]["$options"] === "object") {
					currentObj[currentObjKey]["$options"].before = "";
				} else {
					currentObj[currentObjKey]["$options"] = { before : "" };
				}

				// Update state
				onBefore = true;

			}

		}

		// If value is .orderby(
		else if(value === ".orderby(") {

			// On projection
			if(onProjection) {

				// Update projection datas
				onProjectionString += value;
				onProjectionLevel++;

			}

			// On query
			else if(onQuery) {

				// Update query datas
				onQueryString += value;
				onQueryLevel++;

			}

			// On orderby
			else if(onOrderBy) {

				// Update orderby datas
				onOrderByString += value;
				onOrderByLevel++;

			}

			// Open before
			else {

				// Update state
				onOrderByLevel++;
				onOrderBy = true;

			}

		}

		// If value is .fields(
		else if(value === ".fields(") {

			// On projection
			if(onProjection) {

				// Update projection datas
				onProjectionString += value;
				onProjectionLevel++;

			}

			// On query
			else if(onQuery) {

				// Update query datas
				onQueryString += value;
				onQueryLevel++;

			}

			// On orderby
			else if(onOrderBy) {

				// Update orderby datas
				onOrderByString += value;
				onOrderByLevel++;

			} 

			// Open projection
			else {

				// Set current obj fields
				if(currentObj[currentObjKey] === 1) {
					currentObj[currentObjKey] = { "$fields" : { __parentObj : currentObj, __parentObjKey : currentObjKey } };
				} else if(typeof currentObj[currentObjKey]["$fields"] === "object") {
					currentObj[currentObjKey]["$fields"].__parentObj = currentObj;
					currentObj[currentObjKey]["$fields"].__parentObjKey = currentObjKey;
				} else {
					currentObj[currentObjKey]["$fields"] = { __parentObj : currentObj, __parentObjKey : currentObjKey };
				}

				// Update obj datas
				currentObj = currentObj[currentObjKey]["$fields"];
				currentObjKey = false;
				currentObjLevel++;

				// Update projection datas 
				onProjectionLevel++;
				onProjection = true;

			}

		}

		// If value is .filter(
		else if(value === ".filter(") {

			// On projection
			if(onProjection) {

				// Update projection datas
				onProjectionString += value;
				onProjectionLevel++;

			}

			// On query
			else if(onQuery) {

				// Update query datas
				onQueryString += value;
				onQueryLevel++;

			}

			// On orderby
			else if(onOrderBy) {

				// Update orderby datas
				onOrderByString += value;
				onOrderByLevel++;

			} 

			// Open query
			else {

				// Set current obj query
				if(currentObj[currentObjKey] === 1) {
					currentObj[currentObjKey] = { "$filter" : { __parentObj : currentObj, __parentObjKey : currentObjKey } };
				} else if(typeof currentObj[currentObjKey]["$filter"] === "object") {
					currentObj[currentObjKey]["$filter"].__parentObj = currentObj;
					currentObj[currentObjKey]["$filter"].__parentObjKey = currentObjKey;
				} else {
					currentObj[currentObjKey]["$filter"] = { __parentObj : currentObj, __parentObjKey : currentObjKey };
				}

				// Update obj datas
				currentObj = currentObj[currentObjKey]["$filter"];
				currentObjKey = false;
				currentObjLevel++;

				// Update query datas
				onQueryLevel++;
				onQuery = true;

			}

		}

		// If value is .
		else if(value === ".") {

			// On projection
			if(onProjection) {

				// Update projection datas
				onProjectionString += value;

			}

			// On query
			else if(onQuery) {

				// Update query datas
				onQueryString += value;

			}

			// On orderby
			else if(onOrderBy) {

				// Update orderby datas
				onOrderByString += value;

			} 

			// Open field
			else {

				// Set current obj fields
				if(currentObj[currentObjKey] === 1) {
					currentObj[currentObjKey] = { "$fields": { __parentObj : currentObj, __parentObjKey : currentObjKey } };
				} else if(typeof currentObj[currentObjKey]["$fields"] === "object") {
					currentObj[currentObjKey]["$fields"].__parentObj = currentObj;
					currentObj[currentObjKey]["$fields"].__parentObjKey = currentObjKey;
				} else {
					currentObj[currentObjKey]["$fields"] = { __parentObj : currentObj, __parentObjKey : currentObjKey };
				}

				// Update obj datas
				currentObj = currentObj[currentObjKey]["$fields"];
				currentObjKey = false;
				currentObjLevel++;

			}

		}

		// If value is ,
		else if(value === ",") {

			// On projection
			if(onProjection) {

				// Update projection datas
				onProjectionString += value;

			}

			// On query
			else if(onQuery) {

				// Update query datas
				onQueryString += value;

			}

			// On orderby
			else if(onOrderBy) {

				// Update orderby datas
				onOrderByString += value;

			} 

			// Change obj
			else {

				// Close current obj
				while(currentObjLevel > 0) {
					parentObj = currentObj.__parentObj;
					parentObjKey = currentObj.__parentObjKey;
					delete currentObj.__parentObj;
					delete currentObj.__parentObjKey;
					currentObj = parentObj;
					currentObjKey = parentObjKey;
					currentObjLevel--;
				}

				// Update obj datas
				currentObjKey = false;

			}

		}

		// If value is other
		else if(value !== "") {

			// On projection
			if(onProjection) {

				// Update projection datas
				onProjectionString += value;
				if(value.indexOf("(") !== -1) {
					onProjectionLevel++;
				} 

			}

			// On query
			else if(onQuery) {

				// Update query datas
				onQueryString += value;
				if(value.indexOf("(") !== -1) {
					onQueryLevel++;
				} 

			}

			// On orderby
			else if(onOrderBy) {

				// Update orderby datas
				onOrderByString += value;
				if(value.indexOf("(") !== -1) {
					onOrderBy++;
				} 

			}

			// On limit
			else if(onLimit) {

				// Set current obj limit options
				currentObj[currentObjKey]["$options"].limit = parseInt(value);

			} 

			// On skip
			else if(onSkip) {

				// Set current obj skip options
				currentObj[currentObjKey]["$options"].skip = parseInt(value);

			} 

			// On after
			else if(onAfter) {

				// Set current obj after options
				currentObj[currentObjKey]["$options"].after = value;

			} 

			// On before
			else if(onBefore) {

				// Set current obj before options
				currentObj[currentObjKey]["$options"].before = value;

			}

			// Open field
			else {

				// Split value
				value.split(".").forEach(function(item, key) {

					if(key > 0) {

						// Set current obj fields
						if(currentObj[currentObjKey] === 1) {
							currentObj[currentObjKey] = { "$fields" : { __parentObj : currentObj, __parentObjKey : currentObjKey } };
						} else if(typeof currentObj[currentObjKey]["$fields"] === "object") {
							currentObj[currentObjKey]["$fields"].__parentObj = currentObj;
							currentObj[currentObjKey]["$fields"].__parentObjKey = currentObjKey;
						} else {
							currentObj[currentObjKey]["$fields"] = { __parentObj : currentObj, __parentObjKey : currentObjKey };
						}

						currentObj = currentObj[currentObjKey]["$fields"];
						currentObjKey = false;
						currentObjLevel++;
						
					}

					// Update obj datas
					currentObjKey = item;
					if(typeof currentObj[item] !== "object") {
						currentObj[item] = 1;
					}

				});

			}

		}

	});

	// Delete helpers
	while(currentObjLevel > 0) {
		parentObj = currentObj.__parentObj;
		parentObjKey = currentObj.__parentObjKey;
		delete currentObj.__parentObj;
		delete currentObj.__parentObjKey;
		currentObj = parentObj;
		currentObjKey = parentObjKey;
		currentObjLevel--;
	}

	// Return projection
	return projection;

}

/**
 * Parse orderby
 *
 * @params {String} stringToParse
 * @return orderBy
 * @api public
 */
Url.parseOrderBy = function(stringToParse) {

	// Check datas
	if(typeof stringToParse !== "string")
		throw new Error("stringToParse have to be a string");

	// Datas
	var orderBy = {};

	// Split string
	var splitedString = stringToParse.split(/\ *,\ */);

	// Walk through splited string
	splitedString.forEach(function(value) {

		// Value is desc field
		if(value.slice(0, 1) === "-") {
			orderBy[value.slice(1)] = -1;
		}

		// Value is asc field
		else {
			orderBy[value] = 1;
		}

	});

	// Return orderby
	return orderBy;

}



/**
 * Module exports
 */
module.exports = Url;