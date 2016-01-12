var _ = require('underscore');
var async = require('async');
var deepmerge = require("deepmerge");
var Db = require('mongodb').Db;
var Schema = require('./schema.js');
var SchemaPath = require('./schemapath.js');
var ValidationRule = require('./validationrule.js');



/**
 * Model constructor
 *
 * @api public
 */
var Model = function(datas) {

	// Check method arguments
	if(typeof datas === "undefined")
		datas = {};

	// Check data
	if(typeof datas !== "object")
		throw new Error("datas have to be an object");

	// Set instance data
	this.datas = datas;
	this.staticSelf = Model;

};



/**
 * Model init
 *
 * @params {Db}     dbConnection
 * @params {String} collectionName
 * @params {Schema} [schema]
 * @api public
 */
Model.init = function(dbConnection, collectionName, schema) {

	// Check method arguments
	if(typeof schema === "undefined")
		schema = new Schema;

	// Check data
	if(!(dbConnection instanceof Db))
		throw new Error("dbConnection have to be a Db object");
	if(typeof collectionName !== "string")
		throw new Error("collectionName have to be a string");
	if(!(schema instanceof Schema))
		throw new Error("schema have to be a Schema object");

	// Set static datas
	this.dbConnection = dbConnection;
	this.collectionName = collectionName;
	this.schema = schema;
	this.type = false;
	this.references = {};
	this.relationships = {};
	this.virtuals = {};

}


/**
 * Model static datas
 */
Model.dbConnection;
Model.collectionName;
Model.schema;
Model.type;
Model.references;
Model.relationships;
Model.virtuals;


/**
 * Model instance datas
 */
Model.prototype.staticSelf;
Model.prototype.datas;
Model.prototype.beforeMiddlewares;
Model.prototype.afterMiddlewares;
Model.prototype.params;



/**
 * Set dbConnection
 *
 * @params {Db} dbConnection
 * @api public
 */
Model.setDbConnection = function(dbConnection) {

	// Check data
	if(!(dbConnection instanceof Db))
		throw new Error("dbConnection have to be a Db object");

	// Set db connection
	this.dbConnection = dbConnection;

};

/**
 * Get dbConnection
 *
 * @return {Db} dbConnection
 * @api public
 */
Model.getDbConnection = function() {
	return this.dbConnection;
};



/**
 * Set collection name
 *
 * @params {String} collectionName
 * @api public
 */
Model.setCollectionName = function(collectionName) {

	// Check data
	if(typeof collectionName === "string")
		throw new Error("collectionName have to be a string");

	// Set collection name
	this.collectionName = collectionName;

};

/**
 * Get collection name
 *
 * @return {String} collectionName
 * @api public
 */
Model.getCollectionName = function() {
	return this.collectionName;
};



/**
 * Set schema
 *
 * @params {Schema} schema
 * @api public
 */
Model.setSchema = function(schema) {

	// Check data
	if(!(schema instanceof Schema))
		throw new Error("schema have to be a Schema object");

	// Set schema
	this.schema = schema;

};

/**
 * Get schema
 *
 * @return {Schema} schema
 * @api public
 */
Model.getSchema = function() {
	return this.schema;
};



/**
 * Set type
 *
 * @params {String} value
 * @api public
 */
Model.setType = function(type) {

	// Check data
	if(typeof type !== "string")
		throw new Error("type have to be a string");

	// Add field to schema
	this.schema.addField('_type', { type : String, default : type, required : true, validation : new ValidationRule([ "strictEqualTo", type ]) });

	// Set type
	this.type = type;

};

/**
 * Get type
 *
 * @return {String} type
 * @api public
 */
Model.getType = function() {
	return this.type;
};



/**
 * Add reference
 *
 * @params {String} 	 fieldPath
 * @params {Model|Array} reference
 * @api public
 */
Model.addReference = function(fieldPath, reference) {

	// Check data
	if(typeof fieldPath !== "string")
		throw new Error("fieldPath have to be a string");
	if(!(reference instanceof Model) && typeof reference !== "function" && !(reference instanceof Array))
		throw new Error("reference have to be a model, a function, a array of models or an array of functions");

	// Check all array item
	if(reference instanceof Array) {
		reference.forEach(function(referenceItem) {

		// Check reference item
		if(!(referenceItem instanceof Model) && typeof referenceItem !== "function")
			throw new Error("reference have to be a function or a model");

		});
	}

	// Set reference
	this.references[fieldPath] = reference;

};

/**
 * Get references
 *
 * @return {Object} references
 * @api public
 */
Model.getReferences = function() {
	return this.references;
};

/**
 * Get a reference
 *
 * @params {String} fieldPath
 * @return {Object} reference
 * @api public
 */
Model.getReference = function(fieldPath) {

	// Check data
	if(typeof fieldPath !== "string")
		throw new Error("fieldPath have to be a string");

	// Return reference
	return this.references[fieldPath];

};

/**
 * Remove a reference
 *
 * @params {String} fieldPath
 * @api public
 */
Model.removeReference = function(fieldPath) {

	// Check data
	if(typeof fieldPath !== "string")
		throw new Error("fieldPath have to be a string");

	// Check data
	if(typeof this.references[fieldPath] === "undefined")
		throw fieldPath + " is not a reference of the model";

	// Delete reference
	delete this.references[fieldPath];

};



/**
 * Add a relationship
 *
 * @params {String} fieldPath
 * @params {Object} relationship
 * @api public
 */
Model.addRelationship = function(fieldPath, relationship) {

	// Check data
	if(typeof fieldPath !== "string")
		throw new Error("fieldPath have to be a string");
	if(typeof relationship !== "object")
		throw new Error("relationship have to be an object");

	// Check object values
	if(_.without(Object.keys(relationship), "ref", "refPath").length > 0 && _.without(Object.keys(relationship), "ref", "conditions").length > 0)
		throw new Error("relationship object keys can only be ref and refPath or ref and conditions");
	if(typeof relationship.ref !== "function" && !(relationship.ref instanceof Model))
		throw new Error("relationship object ref have to be a function or a model");
	if(_.without(Object.keys(relationship), "ref", "refPath").length === 0 && typeof relationship.refPath !== "string")
		throw new Error("relationship object refPath have to be a string");
	if(_.without(Object.keys(relationship), "ref", "conditions").length === 0 && typeof relationship.conditions !== "object")
		throw new Error("relationship object conditions have to be an object");

	// Set relationship
	this.relationships[fieldPath] = relationship;

};

/**
 * Get relationships
 *
 * @return {Object} relationships
 * @api public
 */
Model.getRelationships = function() {
	return this.relationships;
};

/**
 * Get a relationship
 *
 * @params {String} fieldPath
 * @return {Object} relationship
 * @api public
 */
Model.getRelationship = function(fieldPath) {

	// Check data
	if(typeof fieldPath !== "string")
		throw new Error("fieldPath have to be a string");

	// Return relationship
	return this.relationships[fieldPath];

};

/**
 * Remove a relationship
 *
 * @params {String} fieldPath
 * @api public
 */
Model.removeRelationship = function(fieldPath) {

	// Check data
	if(typeof fieldPath !== "string")
		throw new Error("fieldPath have to be a string");

	// Check data
	if(typeof this.relationships[fieldPath] === "undefined")
		throw fieldPath + " is not a relationship of the model";

	// Delete relationship
	delete this.relationships[fieldPath];

};



/**
 * Add virtual field
 *
 * @params {String}  fieldPath
 * @params {Virtual} virtual
 * @api public
 */
Model.addVirtual = function(fieldPath, virtual) {

	// Check data
	if(typeof fieldPath !== "string")
		throw new Error("fieldPath have to be a string");
	if(typeof virtual !== "object")
		throw new Error("virtual have to be an object");

	// Check object values
	if(_.without(Object.keys(virtual), "requiredFields", "transform").length > 0)
		throw new Error("virtual object keys can only be requiredFields and transform");
	if(typeof virtual.requiredFields !== "object")
		throw new Error("virtual object requiredFields have to be an object");
	if(typeof virtual.transform !== "function")
		throw new Error("virtual object transform have to be a function");

	// Set virtual
	this.virtuals[fieldPath] = virtual;

};

/**
 * Get virtual fields
 *
 * @return {Object} virtuals
 * @api public
 */
Model.getVirtuals = function() {
	return this.virtuals;
};

/**
 * Get a virtual field
 *
 * @params {String} fieldPath
 * @return {Object} virtuals
 * @api public
 */
Model.getVirtual = function(fieldPath) {

	// Check data
	if(typeof fieldPath !== "string")
		throw new Error("fieldPath have to be a string");

	// Return virtual
	return this.virtuals[fieldPath];

};

/**
 * Remove a virtual field
 *
 * @params {String} fieldPath
 * @api public
 */
Model.removeVirtual = function(fieldPath) {

	// Check data
	if(typeof fieldPath !== "string")
		throw new Error("fieldPath have to be a string");

	// Check data
	if(typeof this.virtuals[fieldPath] === "undefined")
		throw fieldPath + " is not a virtual field of the model";

	// Delete virtual
	delete this.virtuals[fieldPath];

};



/**
 * Set datas
 *
 * @params {String|Object} dataKey|datas
 * @params {Mixed}         [dataValue]
 * @api public
 */
Model.prototype.setDatas = function(dataKey, dataValue) {

	// If setDatas(dataKey, dataValue);
	if(typeof dataValue !== "undefined") {

		// Check data
		if(typeof dataKey !== "string")
			throw new Error("dataKey have to be a string");

		// Set data
		this.datas[dataKey] = dataValue;


	}

	// If setDatas(datas);
	else {

		// Data
		var datas = dataKey;

		// Check data
		if(typeof datas !== "object")
			throw new Error("datas have to be an object");

		// Set data
		this.datas = datas;

	}

};

/**
 * Get datas
 *
 * @params {String} [dataKey]
 * @api public
 */
Model.prototype.getDatas = function(dataKey) {

	// If getDatas(dataKey);
	if(typeof dataKey !== "undefined") {

		// Check data
		if(typeof dataKey !== "string")
			throw new Error("dataKey have to be a string");

		// Return data
		return this.datas[dataKey];

	}

	// If getDatas();
	else {

		// Return datas
		return this.datas;

	}

};



/**
 * Before middleware
 *
 * @params {String}   functionName
 * @params {Function} callback
 * @api public
 */
Model.prototype.before = function(functionName, callback) {

	// Check data
	if(typeof functionName !== "string" || ["count", "list", "show", "create", "update", "remove", "save"].indexOf(functionName) === -1)
		throw new Error("functionName have to be a string defined as count, list, show, create, update, remove or save");
	if(typeof this[functionName] !== "function")
		throw new Error("functionName have to be an existing function");
	if(typeof callback !== "function")
		throw new Error("callback have to be a function");

	// Set middleware
	this.beforeMiddlewares[functionName] = callback;

};



/**
 * After middleware
 *
 * @params {String}   functionName
 * @params {Function} callback
 * @api public
 */
Model.prototype.after = function(functionName, callback) {

	// Check data
	if(typeof functionName !== "string" || ["count", "list", "show", "create", "update", "remove", "save"].indexOf(functionName) === -1)
		throw new Error("functionName have to be a string defined as count, list, show, create, update, remove or save");
	if(typeof this[functionName] !== "function")
		throw new Error("functionName have to be an existing function");
	if(typeof callback !== "function")
		throw new Error("callback have to be a function");

	// Set middleware
	this.afterMiddlewares[functionName] = callback;

};



/**
 * Set params
 *
 * @params {Object} params
 * @api public
 */
Model.prototype.setParams = function(params) {

	// Check data
	if(typeof params !== "object")
		throw new Error("params have to be an object");

	// Set params
	this.params = params;

};

/**
 * Get params
 *
 * @api public
 */
Model.prototype.getParams = function() {

	// Return data
	return this.params;

};



/**
 * Count
 *
 * @params {Object} [filter]
 * @params {Object} [options]
 * @api public
 */
Model.prototype.count = function(filter, options) {

	// Check method arguments
	if(typeof options === "undefined")
		options = {};
	if(typeof filter === "undefined")
		filter = {};

	// Data
	var self = this;

	// Before middleware
	var beforeMiddlewareLoad = function() {

		// Resolve if before count do not exists
		if(!self.beforeMiddlewares.count) {
			return Promise.resolve();
		}

		// Run before middleware
		return self.beforeMiddlewares.count(filter, options);

	};

	// Count
	var countLoad = function(args) {

		// Check method arguments
		if(typeof args === "undefined")
			args = {};

		// Data
		var filter = args.filter || {};
		var options = args.options || {};

		// Check data
		if(typeof filter !== "object")
			throw new Error("filter have to be an object");
		if(typeof options !== "object")
			throw new Error("options have to be an object");

		// Run list
		return self.list(filter, { _id : 1 })
			.then(function(result) {

				// Resolve
				return Promise.resolve(result.data.length);

			});

	};

	// After middleware
	var afterMiddlewareLoad = function(countResult) {

		// Resolve if after count do not exists
		if(!self.afterMiddlewares.count) {
			return Promise.resolve();
		}

		// Run after middleware
		return self.afterMiddlewares.count(countResult);

	};

	// Run promises
	return beforeMiddlewareLoad()
		.then(countLoad)
		.then(afterMiddlewareLoad);

};



/**
 * List
 *
 * @params {Object} [filter]
 * @params {Object} [fields]
 * @params {Object} [options]
 * @api public
 */
Model.prototype.list = function(filter, fields, options) {

	// Check method arguments
	if(typeof options === "undefined")
		options = {};
	if(typeof fields === "undefined")
		fields = {};
	if(typeof filter === "undefined")
		filter = {};

	// Datas
	var self = this;
	var staticSelf = this.staticSelf;

	// Before middleware
	var beforeMiddlewareLoad = function() {

		// Resolve if before list do not exists
		if(!self.beforeMiddlewares.list) {
			return Promise.resolve();
		}

		// Run before middleware
		return self.beforeMiddlewares.list(filter, fields, options);

	};

	// List
	var listLoad = function(args) {

		// Check method arguments
		if(typeof args === "undefined")
			args = {};

		// Data
		var filter = args.filter || {};
		var fields = args.fields || {};
		var options = args.options || {};

		// Check data
		if(typeof filter !== "object")
			throw new Error("filter have to be an object");
		if(typeof fields !== "object")
			throw new Error("fields have to be an object");
		if(typeof options !== "object")
			throw new Error("options have to be an object");

		// Datas
		var dbConnection = staticSelf.dbConnection;
		var collectionName = staticSelf.collectionName;
		var collection = dbConnection.collection(collectionName);
		var type = staticSelf.type;
		var references = staticSelf.references;
		var relationships = staticSelf.relationships;
		var virtuals = staticSelf.virtuals;
		var parseFieldsResult = {};
		var requestedFilter = {};
		var requestedFields = {};
		var requestedReferences = {};
		var requestedRelationships = {};
		var requestedVirtuals = {};
		var requestedRelationshipsOrder	= 0;
		var requestedOptions = {};

		// Parse fields
		parseFieldsResult = parseFields(references, relationships, virtuals, fields);
		requestedFields = parseFieldsResult.fields;
		requestedReferences = { 0 : parseFieldsResult.references };
		requestedRelationships = { 0 : parseFieldsResult.relationships };
		requestedVirtuals = parseFieldsResult.virtuals;

		// Add type to requested fields and filter
		if(type) {
			filter._type = type;
			if(_.values(requestedFields).indexOf(1) !== -1)
				requestedFields._type = 1;
		}

		// Check for relationships and dependencies
		for(var i = 0; i < 100; i++) {

			// Check relationships and get requested fields 
			if(Object.keys(requestedRelationships[requestedRelationshipsOrder]).length > 0) {

				// Walk through requested relationships
				Object.keys(requestedRelationships[requestedRelationshipsOrder]).forEach(function(relationshipKey) {

					// If realtionship is set on condition
					if(typeof relationships[relationshipKey].conditions !== "undefined") {

						// Get required fields
						var queryRequiredFields = requiredFieldsFromQuery(references, relationships, relationships[relationshipKey].conditions);

						// Add requested fields
						if(Object.keys(requestedFields).length > 0 && typeof requestedFields["$all"] === "undefined") {
							requestedFields = deepmerge(requestedFields, queryRequiredFields.related);
						}

						// Add relationship
						if(Object.keys(queryRequiredFields.relationship).length > 0 && Object.keys(requestedRelationships[requestedRelationshipsOrder][relationshipKey]["$fields"]).length > 0 && typeof requestedRelationships[requestedRelationshipsOrder][relationshipKey]["$fields"]["$all"] === "undefined") {
							requestedRelationships[requestedRelationshipsOrder][relationshipKey]["$fields"] = deepmerge(requestedRelationships[requestedRelationshipsOrder][relationshipKey]["$fields"], queryRequiredFields.relationship);
						}

						// Add references dependencies
						if(Object.keys(queryRequiredFields.relatedReferences).length > 0) {

							// Check if references dependencies is already created
							if(typeof requestedReferences[(requestedRelationshipsOrder+1)] === "undefined") {
								requestedReferences[(requestedRelationshipsOrder+1)] = {};
							}

							// Add references dependencies
							requestedReferences[(requestedRelationshipsOrder+1)] = deepmerge(requestedReferences[(requestedRelationshipsOrder+1)], queryRequiredFields.relatedReferences);

						}

						// Add relationships dependencies
						if(Object.keys(queryRequiredFields.relatedRelationships).length > 0) {

							// Check if relationships dependencies is already created
							if(typeof requestedRelationships[(requestedRelationshipsOrder+1)] === "undefined") {
								requestedRelationships[(requestedRelationshipsOrder+1)] = {};
							}

							// Add relationships dependencies
							requestedRelationships[(requestedRelationshipsOrder+1)] = deepmerge(requestedRelationships[(requestedRelationshipsOrder+1)], queryRequiredFields.relatedRelationships);
						
						}

					}

				});

			}

			// If no other dependencies
			if(typeof requestedRelationships[(requestedRelationshipsOrder+1)] === "undefined" && typeof requestedReferences[(requestedRelationshipsOrder+1)] === "undefined") {
				break;
			}

			// If loop
			if(i === 99) {
				throw new Error("Loop detected");
				break;
			}

			// If other dependencies
			else {
				requestedRelationshipsOrder++;
			}

		}

		// Clean requested fields
		if(_.values(requestedFields).indexOf(1) !== -1 && _.values(requestedFields).indexOf(0) !== -1) {
			Object.keys(requestedFields).forEach(function(fieldKey) {
				if(requestedFields[fieldKey] === 0)
					delete requestedFields[fieldKey];
			});
		}

		// Get filter
		if(typeof options.orderby === "object" && Object.keys(options.orderby).length > 0) {
			requestedFilter = { "$query" : filter, "$orderby" : options.orderby };
		} else {
			requestedFilter = filter;
		}

		// Get options skip
		if(typeof options.skip !== "undefined") {
			requestedOptions.skip = options.skip;
		}

		// Get options limit
		if(typeof options.limit !== "undefined") {
			requestedOptions.limit = options.limit;
		}

		// Return promise
		return new Promise(function(resolve, reject) {

			// Find
			collection.find(filter, fields, options).toArray(function(err, result) {

				// Reject if error
				if(err) {
					reject(err); // MongoDBException
					return;
				}

				// Resolve
				resolve(result);
				return;

			});
			return;

		});

	};

	// After list
	var afterListLoad = function(listResult) {

		// Data
		var asyncQueue = Promise.resolve();

		// Loop over references
		_.each(Object.keys(requestedReferences), function(requestedReferencesKey) {

			// Data
			var requestedReferencesValue = requestedReferences[requestedReferencesKey];

			// Return if no requested references
			if(Object.keys(requestedReferencesValue).length === 0) {
				return;
			}

			// Push to async queue	
			asyncQueue = asyncQueue
				.then(ModelReferences.populateReferences.bind(null, references, requestedReferencesValue, listResult))
				.then(function(populationResult) {

					// Set list result
					listResult = populationResult;

					// Resolve
					return Promise.resolve();

				});

		});

		// Loop over relationships
		_.each(Object.keys(requestedRelationships), function(requestedRelationshipsKey) {

			// Data
			var requestedRelationshipsValue = requestedRelationships[requestedRelationshipsKey];

			// Return if no requested relationships
			if(Object.keys(requestedRelationshipsValue).length === 0) {
				return;
			}

			// Push to async queue	
			asyncQueue = asyncQueue
				.then(ModelRelationships.populateRelationships.bind(null, relationships, requestedRelationshipsValue, listResult))
				.then(function(populationResult) {

					// Set list result
					listResult = populationResult;

					// Resolve
					return Promise.resolve();

				});

		});

		// Push to async queue
		asyncQueue = asyncQueue
			.then(function() {

				// Loop over virtuals
				_.each(Object.keys(requestedVirtuals), function(requestedVirtualsKey) {

					// Loop over list result
					_.each(listResult, function(listItem) {

						listItem[requestedVirtualsKey] = virtuals[requestedVirtualsKey].transform(listItem);

					});

				});

				// Resolve
				return Promise.resolve();

			});

		// Return async queue
		return asyncQueue;

	};

	// After middleware
	var afterMiddlewareLoad = function(listResult) {

		// Resolve if after list do not exists
		if(!self.afterMiddlewares.list) {
			return Promise.resolve();
		}

		// Run after middleware
		return self.afterMiddlewares.list(listResult);

	};

	// Run promises
	return beforeMiddlewareLoad()
		.then(listLoad)
		.then(afterListLoad)
		.then(afterMiddlewareLoad);

};



/**
 * Show
 *
 * @params {String|ObjectId|Object} id
 * @params {Object} 		        [fields]
 * @params {Object} 		        [options]
 * @api public
 */
Model.prototype.show = function(id, fields, options) {

	// Check method arguments
	if(typeof options === "undefined")
		options = {};
	if(typeof fields === "undefined")
		fields = {};

	// Datas
	var self = this;

	// Before middleware
	var beforeMiddlewareLoad = function() {

		// Resolve if before show do not exists
		if(!self.beforeMiddlewares.show) {
			return Promise.resolve();
		}

		// Run before middleware
		return self.beforeMiddlewares.show(id, fields, options);

	};

	// Show
	var showLoad = function(args) {

		// Check method arguments
		if(typeof args === "undefined")
			args = {};

		// Data
		var id = args.id;
		var fields = args.fields || {};
		var options = args.options || {};

		// Change id from string to ObjectId
		if(typeof id === "string")
			id = Schema.Types.ObjectId(id);

		// Check data
		if(!(id instanceof Schema.Types.ObjectId) && !(id instanceof Object))
			throw new Error("id have to be an ObjectId or an Object");
		if(typeof fields !== "object")
			throw new Error("fields have to be an object");
		if(typeof options !== "object")
			throw new Error("options have to be an object");

		// Datas
		var filter = {};

		// Get filter
		if(id instanceof Schema.Types.ObjectId) {
			filter._id = id;
		} else {
			filter = id;
		}

		// Run list
		return self.list(filter, fields, options)
			.then(function(listResult) {

				// Data
				var result = listResult.datas.length > 0 ? listResult.datas[0] : null;

				// Resolve
				return Promise.resolve(result);

			});

	};

	// After middleware
	var afterMiddlewareLoad = function(showResult) {

		// Resolve if after show do not exists
		if(!self.afterMiddlewares.show) {
			return Promise.resolve();
		}

		// Run after middleware
		return self.afterMiddlewares.show(showResult);

	};

	// Run promises
	return beforeMiddlewareLoad()
		.then(showLoad)
		.then(afterMiddlewareLoad);

};

/**
 * Create
 *
 * @params {Object} body
 * @params {Object} [options]
 *
 * @api public
 */
Model.prototype.create = function(body, options) {

	// Check method arguments
	if(typeof options === "undefined")
		options = {};

	// Datas
	var self = this;
	var staticSelf = this.staticSelf;

	// Before middleware
	var beforeMiddlewareLoad = function() {

		// Resolve if before create do not exists
		if(!self.beforeMiddlewares.create) {
			return Promise.resolve();
		}

		// Run before middleware
		return self.beforeMiddlewares.create(body, options);

	};

	// Create
	var createLoad = function(args) {

		// Check method arguments
		if(typeof args === "undefined")
			args = {};

		// Data
		var body = args.body || {};
		var options = args.options || {};

		// Check data
		if(typeof body !== "object")
			throw new Error("body have to be an object");
		if(typeof options !== "object")
			throw new Error("options have to be an object");

		// Datas
		var type = staticSelf.type;
		var schema = staticSelf.schema;
		var dbConnection = staticSelf.dbConnection;
		var collectionName = staticSelf.collectionName;
		var collection = dbConnection.collection(collectionName);

		// Formate datas
		body = schema.formate(body, "create");

		// Validate schema
		var validateSchemaLoad = function() {

			// Validate
			return schema.validate(body, "create");

		};

		// Insert to database
		var insertToDatabaseLoad = function() {

			// Return promise
			return new Promise(function(resolve, reject) {

				// Insert datas
				collection.insert(body, function(err, result) {

					// Reject if error
					if(err) {
						reject(err); // MongoDBException
						return;
					}

					// Resolve
					resolve(result.ops[0]);
					return;

				});

			});

		};

		// Run promise
		return validateSchemaLoad()
			.then(insertToDatabaseLoad);

	};

	// After middleware
	var afterMiddlewareLoad = function(createResult) {

		// Resolve if after create do not exists
		if(!self.afterMiddlewares.create) {
			return Promise.resolve();
		}

		// Run after middleware
		return self.afterMiddlewares.create(createResult);

	};

	// Run promises
	return beforeMiddlewareLoad()
		.then(createLoad)
		.then(afterMiddlewareLoad);

};

/**
 * Update
 *
 * @params {String|ObjectId|Object} id
 * @params {Object}                 body
 * @params {Object}   		        [options]
 *
 * @api public
 */
Model.prototype.update = function(id, body, options) {

	// Check method arguments
	if(typeof options === "undefined")
		options = {};

	// Datas
	var self = this;
	var staticSelf = this.staticSelf;

	// Before middleware
	var beforeMiddlewareLoad = function() {

		// Resolve if before update do not exists
		if(!self.beforeMiddlewares.update) {
			return Promise.resolve();
		}

		// Run before middleware
		return self.beforeMiddlewares.update(id, body, options);

	};

	// Update
	var updateLoad = function(args) {

		// Check method arguments
		if(typeof args === "undefined")
			args = {};

		// Data
		var id = args.id;
		var body = args.body || {};
		var options = args.options || {};

		// Change id from string to ObjectId
		if(typeof id === "string")
			id = Schema.Types.ObjectId(id);

		// Check data
		if(!(id instanceof Schema.Types.ObjectId) && !(id instanceof Object))
			throw new Error("id have to be an ObjectId or an Object");
		if(typeof body !== "object")
			throw new Error("body have to be an object");
		if(typeof options !== "object")
			throw new Error("options have to be an object");

		// Datas
		var type = staticSelf.type;
		var schema = staticSelf.schema;
		var dbConnection = staticSelf.dbConnection;
		var collectionName = staticSelf.collectionName;
		var collection = dbConnection.collection(collectionName);
		var upsert = false;
		var validation = true;
		var filter = {};

		// Set option
		if(typeof options.upsert !== "undefined" && options.upsert == true)
			upsert = true;
		if(typeof options.validation !== "undefined" && options.validation == false)
			validation = false;

		// Get filter
		if(id instanceof Schema.Types.ObjectId) {
			filter._id = id;
		} else {
			filter = id;
		}

		// Set body
		if(Object.keys(body)[0].indexOf("$") !== 0) {
			body = { "$set": body };
		}

		// Formate body
		if(typeof body["$set"] !== "undefined") {
			body["$set"] = schema.formate(body["$set"], "update");
		} else {
			body["$set"] = schema.formate({}, "update");
		}

		// Validate schema
		var validateSchemaLoad = function() {

			// Resolve if no validation
			if(!validation) {
				return Promise.resolve();
			}

			// Validate
			return schema.validate(body["$set"], "update");

		};

		// Update database
		var updateDatabaseLoad = function() {

			// Return promise
			return new Promise(function(resolve, reject) {

				// Insert datas
				collection.update(filter, body, { upsert: upsert }, function(err, result) {

					// Reject if error
					if(err) {
						reject(err); // MongoDBException
						return;
					}

					// Resolve
					resolve(result);
					return;

				});

			});

		};

		// Run promise
		return validateSchemaLoad()
			.then(updateDatabaseLoad);

	};

	// After middleware
	var afterMiddlewareLoad = function(updateResult) {

		// Resolve if after update do not exists
		if(!self.afterMiddlewares.update) {
			return Promise.resolve();
		}

		// Run after middleware
		return self.afterMiddlewares.update(updateResult);

	};

	// Run promises
	return beforeMiddlewareLoad()
		.then(updateLoad)
		.then(afterMiddlewareLoad);

};

/**
 * Remove
 *
 * @params {String|ObjectId|Object} id
 * @params {Object}   		        [options]
 *
 * @api public
 */
Model.prototype.remove = function(id, options) {

	// Check method arguments
	if(typeof options === "undefined")
		options = {};

	// Datas
	var self = this;
	var staticSelf = this.staticSelf;

	// Before middleware
	var beforeMiddlewareLoad = function() {

		// Resolve if before remove do not exists
		if(!self.beforeMiddlewares.remove) {
			return Promise.resolve();
		}

		// Run before middleware
		return self.beforeMiddlewares.remove(id, options);

	};

	// Remove
	var removeLoad = function(args) {

		// Check method arguments
		if(typeof args === "undefined")
			args = {};

		// Data
		var id = args.id;
		var options = args.options || {};

		// Change id from string to ObjectId
		if(typeof id === "string")
			id = Schema.Types.ObjectId(id);

		// Check data
		if(!(id instanceof Schema.Types.ObjectId) && !(id instanceof Object))
			throw new Error("id have to be an ObjectId or an Object");
		if(typeof options !== "object")
			throw new Error("options have to be an object");

		// Datas
		var dbConnection = staticSelf.dbConnection;
		var collectionName = staticSelf.collectionName;
		var collection = dbConnection.collection(collectionName);
		var filter = {};

		// Get filter
		if(id instanceof Schema.Types.ObjectId) {
			filter._id = id;
		} else {
			filter = id;
		}

		// Return promise
		return new Promise(function(resolve, reject) {

			// Insert datas
			collection.remove(filter, function(err, result) {

				// Reject if error
				if(err) {
					reject(err); // MongoDBException
					return;
				}

				// Resolve
				resolve(result);
				return;

			});

		});

	};

	// After middleware
	var afterMiddlewareLoad = function(removeResult) {

		// Resolve if after remove do not exists
		if(!self.afterMiddlewares.remove) {
			return Promise.resolve();
		}

		// Run after middleware
		return self.afterMiddlewares.remove(removeResult);

	};

	// Run promises
	return beforeMiddlewareLoad()
		.then(removeLoad)
		.then(afterMiddlewareLoad);

};

/**
 * Save
 *
 * @params {Object} [options]
 *
 * @api public
 */
Model.prototype.save = function(options) {

	// Check method arguments
	if(typeof options === "undefined")
		options = {};

	// Datas
	var self = this;

	// Before middleware
	var beforeMiddlewareLoad = function() {

		// Resolve if before save do not exists
		if(!self.beforeMiddlewares.save) {
			return Promise.resolve();
		}

		// Run before middleware
		return self.beforeMiddlewares.save(options);

	};

	// Save
	var saveLoad = function(args) {

		// Check method arguments
		if(typeof args === "undefined")
			args = {};

		// Data
		var options = args.options || {};
		var datas = self.datas;

		// Check data
		if(typeof options !== "object")
			throw new Error("options have to be an object");
		if(Object.keys(datas).length === 0)
			throw new Error("instance datas have to be defined");

		// Create
		var createLoad = function() {

			// Delete _id field
			if(typeof datas._id !== "undefined") {
				delete datas._id;
			}

			// Create
			return self.create(datas);

		};

		// Update
		var updateLoad = function() {

			// Get _id and delete _id field
			var id = datas._id;
			delete datas._id;

			// Create
			return self.update(id, datas, { upsert: true });

		};

		// Run promises for create
		if(typeof datas._id !== "undefined" && datas._id !== "") {
			return createLoad();
		}

		// Run promises for update
		else {
			return updateLoad();
		}

	};

	// After middleware
	var afterMiddlewareLoad = function(saveResult) {

		// Resolve if after save do not exists
		if(!self.afterMiddlewares.save) {
			return Promise.resolve();
		}

		// Run after middleware
		return self.afterMiddlewares.save(saveResult);

	};

	// Run promises
	return beforeMiddlewareLoad()
		.then(saveLoad)
		.then(afterMiddlewareLoad);

};



/**
 * Model relationships
 *
 * @api private
 */
var ModelRelationships = require('./modelrelationships.js');


/**
 * Model references
 *
 * @api private
 */
var ModelReferences = require('./modelreferences.js');



/**
 * Parse fields
 *
 * @params {Object} references
 * @params {Object} relationships
 * @params {Object} virtuals
 * @params {Object} fields
 * @params {String} [prefix]
 * @api private
 */
var parseFields = function(references, relationships, virtuals, fields, prefix) {

	// Check method arguments
	if(typeof prefix === "undefined")
		prefix = "";

	// Check data
	if(typeof references !== "object")
		throw new Error("references have to be an object");
	if(typeof relationships !== "object")
		throw new Error("relationships have to be an object");
	if(typeof virtuals !== "object")
		throw new Error("virtuals have to be an object");
	if(typeof fields !== "object")
		throw new Error("fields have to be an object");
	if(typeof prefix !== "string")
		throw new Error("prefix have to be an string");

	// Datas
	var forbidenFields = {};
	var parsedFields = {
		fields: {},
		references: {},
		relationships: {},
		virtuals: {}
	};

	// Check virtuals
	Object.keys(fields).forEach(function(fieldKey) {

		// If virtual
		if(Object.keys(virtuals).indexOf(prefix+fieldKey) !== -1) {

			// Extend with required fields
			fields = _.extend(fields, virtuals[prefix+fieldKey].requiredFields);

			// Delete virtual field from requested fields
			delete fields[prefix+fieldKey];

			// Add to virtuals
			parsedFields.virtuals[prefix+fieldKey] = 1;

		}

	});

	// Walk through fields
	Object.keys(fields).forEach(function(fieldKey) {

		// If relationship
		if(Object.keys(relationships).indexOf(prefix+fieldKey) !== -1) {

			// If all fields required
			if(typeof fields[fieldKey]["$fields"] === "undefined") {
				parsedFields.relationships[prefix+fieldKey] = { "$fields" : {} };
			}

			// If not all fields required
			else {
				parsedFields.relationships[prefix+fieldKey] = fields[fieldKey];
			}

		}

		// If not relationship
		else {

			// If field is not sub-document
			if(typeof fields[fieldKey] !== "object" || (typeof fields[fieldKey]["$fields"] === "undefined" && typeof fields[fieldKey]["$options"] === "undefined")) {

				// If forbiden field
				if(fields[fieldKey] === 0) {
					forbidenFields[prefix+fieldKey] = 0;
				}

				// Set fields
				parsedFields.fields[prefix+fieldKey] = fields[fieldKey];

			}

			// If field is sub-document
			else {

				// If array
				if(typeof fields[fieldKey]["$options"] !== "undefined") {

					// Get field value
					if(fields[fieldKey]["$options"].skip === 0 && fields[fieldKey]["$options"].limit === 0) {
						parsedFields.fields[prefix+fieldKey] = fields[fieldKey];
					} else if(fields[fieldKey]["$options"].skip === 0) {
						parsedFields.fields[prefix+fieldKey] = { "$slice": fields[fieldKey]["$options"].limit }
					} else if(fields[fieldKey]["$options"].limit === 0) {
						parsedFields.fields[prefix+fieldKey] = { "$slice": [ fields[fieldKey]["$options"].skip, 999999999 ] }
					} else {
						parsedFields.fields[prefix+fieldKey] = { "$slice": [ fields[fieldKey]["$options"].skip, fields[fieldKey]["$options"].limit ] }
					}

				}

				// If object (reference)
				if(Object.keys(references).indexOf(prefix+fieldKey) !== -1) {

					// If all fields required
					if(typeof fields[fieldKey]["$fields"] === "undefined" || (typeof fields[fieldKey]["$fields"] !== "undefined" && Object.keys(fields[fieldKey]["$fields"]).length === 1 && typeof fields[fieldKey]["$fields"]["$all"] !== "undefined")) {
						parsedFields.references[prefix+fieldKey] = { "$fields" : {} };
					}

					// If not all fields required
					else {
						parsedFields.references[prefix+fieldKey] = fields[fieldKey];
					}

					// Set reference to fields
					parsedFields.fields[prefix+fieldKey] = 1;
					
				}

				// If object (embeded)
				else if(typeof fields[fieldKey]["$fields"] !== "undefined") {

					// Active fields
					if(typeof parsedFields.fields[prefix+fieldKey] === "undefined") {
						parsedFields[prefix+fieldKey] = 1;
					}

					// Get fields
					var resultParsedFields = parseFields(references, relationships, virtuals, fields[fieldKey]["$fields"], prefix+fieldKey+".");
					parsedFields.fields = _.extend(parsedFields.fields, resultParsedFields.fields);
					parsedFields.references = _.extend(parsedFields.references, resultParsedFields.references);
					parsedFields.relationships = _.extend(parsedFields.relationships, resultParsedFields.relationships);

				}
					
			}

		}

	});

	// If all fields required
	if(Object.keys(parsedFields.fields).indexOf("$all") !== -1) {
		parsedFields.fields = forbidenFields;
	}

	// Check relationship
	else if(Object.keys(parsedFields.fields).length === 0 && (Object.keys(parsedFields.relationships).length !== 0 || Object.keys(parsedFields.references).length !== 0)) {
		parsedFields.fields = { _id : 1 };
	}

	return parsedFields;

}


/**
 * Required fields from query
 *
 * @params {Object} references
 * @params {Object} relationships
 * @params {Object} relationshipCondition
 * @api private
 */
var requiredFieldsFromQuery = function(references, relationships, relationshipCondition) {

	// Check data
	if(typeof references !== "object")
		throw new Error("references have to be an object");
	if(typeof relationships !== "object")
		throw new Error("relationships have to be an object");
	if(typeof relationshipCondition !== "object")
		throw new Error("relationshipCondition have to be an object");

	// Datas
	var requiredFields = {
		related: {},
		relatedReferences: {},
		relatedRelationships: {},
		relationship: {}
	};

	// If logical operator
	if(Object.keys(relationshipCondition).length === 1 && ["$or", "$and", "$nor"].indexOf(Object.keys(relationshipCondition)[0]) !== -1) {

		// Walk through logical operator array
		relationshipCondition[Object.keys(relationshipCondition)[0]].forEach(function(queryItem) {
		
			// Get query required fields
			var queryRequiredFields = requiredFieldsFromQuery(references, relationships, queryItem);
			requiredFields = deepmerge(requiredFields, queryRequiredFields);

		});
		
	}

	// If not operator
	else if(Object.keys(relationshipCondition).length === 1 && Object.keys(relationshipCondition)[0] === "$not") {

		// Walk through relationship condition object
		Object.keys(relationshipCondition).forEach(function(fieldItem) {

			// Get query required fields
			var queryRequiredFields = requiredFieldsFromQuery(references, relationships, relationshipCondition[fieldItem]);
			requiredFields = deepmerge(requiredFields, queryRequiredFields);

		});

	}

	// If field
	else {

		// Walk through relationship condition fields
		Object.keys(relationshipCondition).forEach(function(fieldItem) {

			// Set relationship required field
			requiredFields.relationship[fieldItem] = 1;
		
			// Get query required fields
			var queryRequiredFields = requiredRelatedFieldsFromQuery(references, relationships, relationshipCondition[fieldItem]);
			requiredFields = deepmerge(requiredFields, queryRequiredFields);

		});

	}

	// Return
	return requiredFields;

}


/**
 * Required related fields from query
 *
 * @params {Object} references
 * @params {Object} relationships
 * @params {Mixed}  fieldValue
 * @api private
 */
var requiredRelatedFieldsFromQuery = function(references, relationships, fieldValue) {

	// Check data
	if(typeof references !== "object")
		throw new Error("references have to be an object");
	if(typeof relationships !== "object")
		throw new Error("relationships have to be an object");
	if(typeof fieldValue === "undefined")
		throw new Error("fieldValue have to be defined");

	// Datas
	var requiredFields = {
		related: {},
		relatedReferences: {},
		relatedRelationships: {},
		relationship: {}
	};

	// If SchemaPath
	if(fieldValue instanceof SchemaPath) {

		// Datas
		var isReferencesOrRelationships = false;

		// Get field item
		var fieldItem = fieldValue.name;

		// Walk through references
		Object.keys(references).forEach(function(referenceKey) {

			// If field item is a reference and population is required
			if(fieldItem.indexOf(referenceKey + ".") === 0) {

				// Set related reference key object
				if(typeof requiredFields.relatedReferences[referenceKey] === "undefined") {
					requiredFields.relatedReferences[referenceKey] = { "$fields" : {} };
				}

				// Get reference field
				var referenceField = fieldItem.slice((referenceKey.length + 1));

				// Set related reference field
				requiredFields.relatedReferences[referenceKey]["$fields"][referenceField] = 1;

				// Set helper
				isReferencesOrRelationships = true;
				
			}

		});

		// Walk through relationships
		Object.keys(relationships).forEach(function(relationshipKey) {

			// If field item is a relationship
			if(fieldItem.indexOf(relationshipKey + ".") === 0) {

				// Set related relationship key object
				if(typeof requiredFields.relatedRelationships[relationshipKey] === "undefined") {
					requiredFields.relatedRelationships[relationshipKey] = { "$fields" : {} };
				}

				// Get relationship field
				var relationshipField = fieldItem.slice((relationshipKey.length + 1));

				// Set related relationship field
				requiredFields.relatedRelationships[relationshipKey]["$fields"][relationshipField] = 1;

				// Set helper
				isReferencesOrRelationships = true;
				
			}

		});

		// If helper is false
		if(isReferencesOrRelationships === false) {

			// Set related required field
			requiredFields.related[fieldItem] = 1;

		}
		
	}

	// If array
	else if(fieldValue instanceof Array) {

		// Walk through field value array
		fieldValue.forEach(function(fieldValueItem) {

			// Get required fields
			var queryRequiredFields = requiredRelatedFieldsFromQuery(references, relationships, fieldValueItem);
			requiredFields = deepmerge(requiredFields, queryRequiredFields);

		});
		
	}

	// If object
	else if(typeof fieldValue === "object" && Object.keys(fieldValue).length > 0) {

		// Walk through field value object
		Object.keys(fieldValue).forEach(function(fieldValueKey) {

			// Get required fields
			var queryRequiredFields = requiredRelatedFieldsFromQuery(references, relationships, fieldValue[fieldValueKey]);
			requiredFields = deepmerge(requiredFields, queryRequiredFields);
			
		});
		
	}

	// Return
	return requiredFields;

}


/**
 * Module exports
 */
module.exports = Model;