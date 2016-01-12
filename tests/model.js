var assert = require('assert');
var logInfo = require('debug')('info');
var logError = require('debug')('error');
var mongoshawk = require('../lib/mongoshawk');
var _ = require('underscore');
var fs = require('fs');

// Export test function
module.exports.test = function() {

	// createConnection
	describe('#addModel', function() {

		it('should return that modelName is not a string', function() {

			// Action
			return Promise.resolve()
				.then(mongoshawk.addModel.bind(null))
				.then(function(connection) {

					// Tests
					assert(false);

				})
				.catch(function(err) {

					// Info
					logInfo(err);

					// Tests
					assert.equal('Error', err.name);
					assert.equal('modelName have to be a string', err.message);

					// Resolve
					return Promise.resolve();

				})
				.catch(function(err) {

					// Error
					logError(err);

					// Throw error
					throw err;

				});

		});

		it('should return that model is not a Model object', function() {

			// Data
			var modelName = 'Test';

			// Action
			return Promise.resolve()
				.then(mongoshawk.addModel.bind(null, modelName))
				.then(function(connection) {

					// Tests
					assert(false);

				})
				.catch(function(err) {

					// Info
					logInfo(err);

					// Tests
					assert.equal('Error', err.name);
					assert.equal('model have to be a Mongoshawk.Model object', err.message);

					// Resolve
					return Promise.resolve();

				})
				.catch(function(err) {

					// Error
					logError(err);

					// Throw error
					throw err;

				});

		});

		it('should return that dbConnection is not a Db object', function() {

			// Data
			var modelName = 'Test';
			var dbConnection = false;
			var collectionName = false;

			// Action
			return Promise.resolve()
				.then(function() {

					// Action
					var model = mongoshawk.addModel(modelName, dbConnection, collectionName);

					// Tests
					assert(false);

				})
				.catch(function(err) {

					// Info
					logInfo(err);

					// Tests
					assert.equal('Error', err.name);
					assert.equal('dbConnection have to be a Db object', err.message);

					// Resolve
					return Promise.resolve();

				})
				.catch(function(err) {

					// Error
					logError(err);

					// Throw error
					throw err;

				});

		});

		it('should return that collectionName is not a string', function() {

			// Data
			var modelName = 'Test';
			var dbConnection = mongoshawk.getConnection('main').connection;
			var collectionName = false;

			// Action
			return Promise.resolve()
				.then(function() {

					// Action
					var model = mongoshawk.addModel(modelName, dbConnection, collectionName);

					// Tests
					assert(false);

				})
				.catch(function(err) {

					// Info
					logInfo(err);

					// Tests
					assert.equal('Error', err.name);
					assert.equal('collectionName have to be a string', err.message);

					// Resolve
					return Promise.resolve();

				})
				.catch(function(err) {

					// Error
					logError(err);

					// Throw error
					throw err;

				});

		});

		it('should return that schema is not a Schema object', function() {

			// Data
			var modelName = 'Test';
			var dbConnection = mongoshawk.getConnection('main').connection;
			var collectionName = 'test';

			// Action
			return Promise.resolve()
				.then(function() {

					// Action
					var model = mongoshawk.addModel(modelName, dbConnection, collectionName);

					// Tests
					assert(false);

				})
				.catch(function(err) {

					// Info
					logInfo(err);

					// Tests
					assert.equal('Error', err.name);
					assert.equal('schema have to be a Schema object', err.message);

					// Resolve
					return Promise.resolve();

				})
				.catch(function(err) {

					// Error
					logError(err);

					// Throw error
					throw err;

				});

		});

		it('should add model', function() {

			// Data
			var modelName = 'Test';
			var dbConnection = mongoshawk.getConnection('main').connection;
			var collectionName = 'test';
			var schema = new mongoshawk.Schema({
				name: { type: String }
			});

			// Action
			return Promise.resolve()
				.then(function() {

					// Action
					var model = mongoshawk.addModel(modelName, dbConnection, collectionName, schema);

					// Info
					logInfo(model);

					// Tests
					assert.equal('function', typeof model);
					assert.equal('object', typeof model.schema);
					assert.equal('object', typeof model.schema.fields);
					assert.equal('object', typeof model.schema.fields.name);
					assert.equal('object', typeof model.dbConnection);
					assert.equal('test', model.collectionName);

					// Resolve
					return Promise.resolve();

				})
				.catch(function(err) {

					// Error
					logError(err);

					// Throw error
					throw err;

				});

		});

		it('should add an other model', function() {

			// Data
			var modelName = 'Test2';
			var dbConnection = mongoshawk.getConnection('main').connection;
			var collectionName = 'test';
			var schema = new mongoshawk.Schema({
				job: { type: String }
			});

			// Action
			return Promise.resolve()
				.then(function() {

					// Action
					var model = mongoshawk.addModel(modelName, dbConnection, collectionName, schema);

					// Info
					logInfo(model);

					// Tests
					assert.equal('function', typeof model);
					assert.equal('object', typeof model.schema);
					assert.equal('object', typeof model.schema.fields);
					assert.equal('object', typeof model.schema.fields.job);
					assert.equal('object', typeof model.dbConnection);
					assert.equal('test', model.collectionName);

					// Resolve
					return Promise.resolve();

				})
				.catch(function(err) {

					// Error
					logError(err);

					// Throw error
					throw err;

				});

		});

	});

	// createConnection
	describe('#getModels', function() {

		it('should return models', function() {

			// Data
			var modelName = 'Test2';
			var dbConnection = mongoshawk.getConnection('main').connection;
			var collectionName = 'test';
			var schema = new mongoshawk.Schema({
				job: { type: String }
			});

			// Action
			return Promise.resolve()
				.then(function() {

					// Action
					var models = mongoshawk.getModels();

					// Info
					logInfo(models);

					// Tests
					assert.equal('object', typeof models);
					assert.equal('function', typeof models.Test);
					assert.equal('object', typeof models.Test.schema);
					assert.equal('object', typeof models.Test.schema.fields);
					assert.equal('object', typeof models.Test.schema.fields.name);
					assert.equal('object', typeof models.Test.dbConnection);
					assert.equal('test', models.Test.collectionName);
					assert.equal('function', typeof models.Test2);
					assert.equal('object', typeof models.Test2.schema);
					assert.equal('object', typeof models.Test2.schema.fields);
					assert.equal('object', typeof models.Test2.schema.fields.job);
					assert.equal('object', typeof models.Test2.dbConnection);
					assert.equal('test', models.Test2.collectionName);

					// Resolve
					return Promise.resolve();

				})
				.catch(function(err) {

					// Error
					logError(err);

					// Throw error
					throw err;

				});

		});

	});

};