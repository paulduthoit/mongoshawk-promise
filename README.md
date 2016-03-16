# Mongoshawk

Mongoshawk is a [MongoDB](http://www.mongodb.org/) object modeling for [NodeJS](http://nodejs.org/).

## Documentation

[mongoshawk.com](http://mongoshawk.com/)

## Support

  - [duthoit.paul@gmail.com](mailto:duthoit.paul@gmail.com)

## Contributors

  - [Paul Duthoit](http://paulduthoit.com) (Creator)

## Installation

First install [NodeJS](http://nodejs.org/) and [MongoDB](http://www.mongodb.org/downloads). Then:

```sh
$ npm install mongoshawk
```

## Stability

The current stable branch is [master](https://github.com/paulduthoit/mongoshawk/tree/master). More updates will be added for the 0.3.x release series.

## Overview

### Connecting to MongoDB

First, we need to define a connection. Your app can use one or more databases. Use `Mongoshawk.createConnection`. `createConnection` take the parameters `connectionName, databaseName, databaseServerConfig, databaseOption`.

```js
var Mongoshawk = require('mongoshawk');
var connectionName = "main";
var databaseName = "my_database";
var databaseServerConfig = {
    host: "127.0.0.1",
    port: "27017"
};
var databaseOption = {};


// Create connection
Mongoshawk.createConnection(connectionName, databaseName, databaseServerConfig, databaseOption)
    .then(function(connection) {

  console.log('Connection to database is established' + '\r');

});
```

Once connected, the promise is resolved with the parameters `connection`. The `connection` is a `mongodb` object. If the resolve function is not defined, you can retrieve the `connection` object by using `Mongoshawk.getConnection('connectionName')`.

### Defining a Model

Models are defined through the `Mongoshawk` interface with the `Schema` interface. 

```js
var Mongoshawk = require('mongoshawk');
var Schema = Mongoshawk.Schema;
var modelName = "User";
var databaseConnection = Mongoshawk.getConnection("main");
var collectionName = "user";
var schema = new Schema({
    name  : String,
    email : String,
    date  : Date
});

// Add model
Mongoshawk.addModel(modelName, databaseConnection, collectionName, schema);
```

You can catch more informations about how to structure your model schema on the [Mongoshawk Documentation](http://mongoshawk.com/docs/schema) (available soon).

The following example shows some of these features:

```js
var Mongoshawk = require('mongoshawk');
var Schema = Mongoshawk.Schema;
var ValidationRule = Mongoshawk.ValidationRule;

// Set schema
var schema = new Schema({
    name     : { type: String, required: "create" },
    email    : { type: String, validation: new ValidationRule("email") },
    contacts : [ { type: Schema.Types.ObjectId } ],
    date     : { type: Date, default: Date.now, required: true }
}, { allowUndefinedFields: false });
```

### Accessing a Model

Once we define a model through `Mongoshawk.addModel`, we can access it through functions `Mongoshawk.getModels` and `Mongoshawk.getModel`.

```js
var Mongoshawk = require('mongoshawk');
var allMyModel = Mongoshawk.getModels();
var oneOfMyModel = Mongoshawk.getModel('MyModelName');
```

Or just do it all at once

```js
var MyModel = Mongoshawk.addModel('ModelName', myDatabaseConnection, 'myCollectionName', mySchema);
```

We can then instantiate it, and list documents from the collection:

```js
var Mongoshawk = require('mongoshawk');
var MyModel = Mongoshawk.getModel('MyModelName');
var myModelInstance = new MyModel();

// List documents
myModelInstance.list({}, { field_i_want: 1 })
    .then(function(datas) {
  // ...
});
```

You can also `show`, `create`, `update`, `remove`, etc. For more details, check out the [Mongoshawk Documentation](http://mongoshawk.com/docs/queries) (available soon).

### Linking Models together

One of the most powerful features of `Mongoshawk` is the ability to link relational mapping provided by the `Model`. The two relational mapping types are `references` and `relationships`.

#### References

The `references` allow you to retrieve edge objects defined in a `Schema.Types.ObjectId` field of a `Model`.

First, we need to define the `reference`. Use `Model.addReference`. `Model.addReference` take the parameters `fieldPath, reference`.

```js
var Mongoshawk = require('mongoshawk');
var MyModel = Mongoshawk.getModel('MyModelName');
var AnotherModel = Mongoshawk.getModel('AnotherModelName');

// Add reference
myModel.addReference('field_path', AnotherModel);
```

The `reference` parameter of the `Model.addReference` can also be a function.

```js
var Mongoshawk = require('mongoshawk');
var MyModel = Mongoshawk.getModel('MyModelName');
var AnotherModel = Mongoshawk.getModel('AnotherModelName');

// Set reference function
var refFunction = function(filter, fields, options) {
    var anotherModelInstance = new AnotherModel();
    filter = { '$and': [ { a_field: 'a value' }, filter ] };
    return anOtherModelInstance.list(filter, fields, options);
};

// Add reference
myModel.addReference('field_path', refFunction);
```

You can also define reference of multiple `Models` or functions. For more details, check out the [Mongoshawk Documentation](http://mongoshawk.com/docs/relations) (available soon).

Once the reference defined, we can retrieve documents with its edge documents:

```js
var Mongoshawk = require('mongoshawk');
var MyModel = Mongoshawk.getModel('MyModelName');
var myModelInstance = new MyModel();

// Show a document without populate edges
myModelInstance.show(anId, { field_i_want: 1, edge_i_want: 1 })
    .then(function(datas) {
  
 /* datas = {
        _id: '1a',
        field_i_want: 'a value',
        edge_i_want: '2b'
    } */

});

// Show a document with populated edges
myModelInstance.show(anId, { field_i_want: 1, edge_i_want: { '$fields': { field_i_want: 1 } } })
    .then(function(datas) {
  
 /* datas = {
        _id: '1a',
        field_i_want: 'a value',
        edge_i_want: {
            _id: '2b',
            field_i_want: 'another value'
        }
    } */

});
```

#### Relationships

The `relationships` allow you to retrieve edge objects referenced in another `Model`.

First, we need to define the `relationship`. Use `Model.addRelationship`. `Model.addRelationship` take the parameters `fieldPath, relationship`.

```js
var Mongoshawk = require('mongoshawk');
var MyModel = Mongoshawk.getModel('MyModelName');
var AnotherModel = Mongoshawk.getModel('AnotherModelName');

// Add relationship
myModel.addRelationship('field_path', { ref: AnotherModel, refPath: 'relationship_field_path' });
```

The `relationship.ref` parameter of the `Model.addRelationship` can also be a function.

```js
var Mongoshawk = require('mongoshawk');
var MyModel = Mongoshawk.getModel('MyModelName');
var AnotherModel = Mongoshawk.getModel('AnotherModelName');

// Set relationship function
var relFunction = function(filter, fields, options) {
    var anotherModelInstance = new AnotherModel();
    filter = { '$and': [ { a_field: 'a value' }, filter ] }
    return anOtherModelInstance.list(filter, fields, options);
};

// Add relationship
myModel.addRelationship('field_path', { ref: relFunction, refPath: 'relationship_field_path' });
```

You can also define relationship by providing a `condition` in place of a `refPath`. For more details, check out the [Mongoshawk Documentation](http://mongoshawk.com/docs/relations) (available soon).

Once the relationship defined, we can retrieve documents with its edge documents:

```js
var Mongoshawk = require('mongoshawk');
var MyModel = Mongoshawk.getModel('MyModelName');
var myModelInstance = new MyModel();

// Show a document with populated edges
myModelInstance.show(anId, { field_i_want: 1, edges_i_want: { '$fields': { field_i_want: 1 } } })
    .then(function(datas) {
  
 /* datas = {
        _id: '1a',
        field_i_want: 'a value',
        edges_i_want: [ {
            _id: '2b',
            field_i_want: 'another value'
        } ]
    } */

});
```

### Driver access

The driver being used defaults to [node-mongodb-native](https://github.com/mongodb/node-mongodb-native).

## API Docs

Find the API docs [here](http://mongoshawk.com/docs/api) (available soon).

## License

Copyright (c) 2015 Paul Duthoit &lt;duthoit.paul@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
