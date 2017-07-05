# map-pg

[![NPM](https://nodei.co/npm/map-pg.png)](https://nodei.co/npm/map-pg/)

Map interface for PostgreSQL in Node.js.


## intro

You can think of *this* as a **persistent** [PostgreSQL] backed [Map]. Tell to *this* a database object,
a table name, column name to be used as key, and a column name to be used as value; all set to start
using it. Don\'t worry, if the table does not exist, it will be created for you. All set to start using
a *new* object from *this* as a backed up map on a DB. Not exactly. Luckily, databases are not as fast
as maps, and thus you cannot expect *this* to have performed any action by the time *exec* reaches the
next statement. So, all functions instead return a [Promise], which you can use to do something after
a command is complete (and you have some result). If you have not heard of *Promises* (like me), they
are an improved version of a [Callback] (anything more?). One thing more, *this* does not support iterators,
but it does support `forEach`.


## usage

```javascript
var mappg = require('mappg');
var pg = require('pg');
var pgconfig = require('pg-connection-string');

// settings
var url = process.env.DATABASE_URL;
pg.defaults.ssl = true;

// use database
console.log('pg.connect: '+url);
var pool = new pg.Pool(pgconfig(url));
pool.connect(function(err, db, done) {
  // ...
  // code here
  // ...
});
```


## reference

### new

You can use this to create a new object of *this* :wink:. All the other functions are
available on this object. Unlike creating a new `Map` object, if the table mentioned
already exists, then the values in the table are considered part of the map. After all,
that is what makes this a *persistent* map.

```javascript
var m = new mappg(<db client>, [<table>], [<key column>], [<value column>]);
// []: optional arguments
// <db client>: client object from postgresql pool
// <table>: name of table to use as map (default: 'MAP')
// <key column>: name of column to use as key (default: 'key')
// <value column>: name of column to use as value (default: 'val')
```
```javascript
// create map with table 'ALT', key column 'altname', and value column 'actname'
var alt = new mappg(db, 'ALT', 'altname', 'actname');

// create map with table 'ALT', key column 'key', and value column 'val'
var alt = new mappg(db, 'ALT');

// create map with table 'MAP', key column 'key', and value column 'val'
var map = new mappg(db);
```


### size

This function can give you the size (number of items / key-value pairs) of the map (obviously?),
as a `Promise`. That is the key; it promises to give you the size of the map at some point in the
future by calling your *resolve* function. If it does encounter any difficulty, it will then call
your *reject* function and let you know the reason why it will not be able to satisfy its promise.

```javascript
m.size.then(<resolve fn>)[.catch(<reject fn>)];
// []: optional continuation call
// <resolve fn>: (size) called when size of map is obtained; size is passed as 1st argument
// <reject fn>: (err) called when some error occurs; err is passed as 1st argument
```
```javascript
// log size of map into console, or throw if error occurs
m.size.then((size) => console.log(size)).catch((err) => { throw err; });

// log size of map into console, or show warning on console if error occurs
m.size.then((size) => {
  console.log('size is '+size);
});
```


### has

You want to check whether your map as a particular key? Worry no more, only you will get to know
your answer a little late (again as a `Promise`). Also note that all queries will be running
sequentially, in order. So, if you set a particular key with a value, you can then immediately
query whether the map *has* the key or not (but you will get the result of `has` a little late).

```javascript
m.has(<key>).then(<resolve fn>)[.catch(<reject fn>)];
// []: optional continuation call
// <key>: name of key, whose existence to check
// <resolve fn>: (exists) called when existence of key in map is obtained; exists is passed as 1st argument
// <reject fn>: (err) called when some error occurs; err is passed as 1st argument
```
```javascript
// log existence of 'key1' key into console, or throw if error occurs
m.has('key1').then((exists) => console.log(exists)).catch((err) => { throw err; });

// log existence of 'key2' key into console, or show warning on console if error occurs
m.has('key2').then((exists) => {
  console.log('key2 %s in map', exists? 'exists' : 'does not exist');
});
```


### get

You can the get the value of a particular key (obviously). As usual, the value of the key will be
returned in a `Promise`. You also also fetch the value of any key that existed in the table beforehand
(as mentioned already).

```javascript
m.get(<key>).then(<resolve fn>)[.catch(<reject fn>)];
// []: optional continuation call
// <key>: name of key, whose value to get
// <resolve fn>: (value) called when value of key in map is obtained; value is passed as 1st argument
// <reject fn>: (err) called when some error occurs; err is passed as 1st argument 
```
```javascript
// log value of 'key1' key into console, or throw if error occurs
m.get('key1').then((value) => console.log(value)).catch((err) => { throw err; });

// log value of 'key2' key into console, or show warning on console if error occurs
m.get('key2').then((value) => {
  console.log(`key2 = ${value}`);
});
```


### set

Need to set the value of a particular key, no problem. This is actually one of the easiest, as you do\'t
need to deal with any `Promise`s. This function does return a `Promise` though indicating when the action
is complete. It must be noted that, as of now, this function only accepts both key and value as *string*.
Which is why, the value returned from the `Promise` of `get` is also *string*.

```javascript
m.set(<key>, <value>)[.then(<resolve fn>)][.catch(<reject fn>)];
// []: optional continuation call
// <key>: name of key
// <value>: value of key
// <resolve fn>: () called when value of key in map is set
// <reject fn>: (err) called when some error occurs; err is passed as 1st argument
```
```javascript
// set value of 'key1' key, log to console when done, or throw if error occurs
m.set('key1', 'to your house').then(() => console.log('key1 set')).catch((err) => { throw err; });

// set value of 'key2' key, log to console when done, or show warning on console if error occurs
m.set('key2', 'to my house').then(() => {
  console.log('value of key2 is set');
});

// set value of 'key3' key, or show warning on console if error occurs
m.set('key3', "to joker's house");
```


### delete

Remove unnecessary key-value pairs from your map. You also do not need to deal with any `Promise` here.
It does return a `Promise` though to notify when the deletion is complete.

```javascript
m.delete(<key>)[.then(<resolve fn>)][.catch(<reject fn>)];
// []: optional continuation call
// <key>: key to delete, along with its value
// <resolve fn>: () called when key-value pair is deleted from map
// <reject fn>: (err) called when some error occurs; err is passed as 1st argument
```
```javascript
// delete key-value pair of 'key1' key, log to console when done, or throw if error occurs
m.delete('key1').then(() => console.log('key1 deleted')).catch((err) => { throw err; });

// delete key-value pair of 'key2' key, log to console when done, or show warning on console if error occurs
m.delete('key2').then(() => {
  console.log('key2 is deleted');
});

// delete key-value pair of 'key3' key, or show warning on console if error occurs
m.delete('key3');
```


### clear

Call this only when you are very sure. It will clear the **entire** map. No questions asked. Again, you do
not need to worry about `Promise` here, and yet it still returns a `Promise` to notify when it has cleared
out the *entire* table.

```javascript
m.clear()[.then(<resolve fn>)][.catch(<reject fn>)];
// []: optional continuation call
// <resolve fn>: () called when the entire map is cleared
// <reject fn>: (err) called when some error occurs; err is passed as 1st argument
```
```javascript
// clear entire map, log to console when done, or throw if error occurs
m.clear().then(() => console.log('map cleared')).catch((err) => { throw err; });

// clear entire map, log to console when done, or show warning on console if error occurs
m.clear().then(() => {
  console.log('map cleared');
});

// clear entire map, or show warning on console if error occurs
m.clear();
```


### forEach

Run a function for each key-value pair in the map. The `Promise` returned from this indicates when all the
key-value pairs are exhauseted, and also helpfully passes the size of the map (number of pairs).

```javascript
m.forEach(<pair fn>, [<this arg>])[.this(<resolve fn>)][.catch(<reject fn>)];
// []: optional argument / continuation call
// <pair fn>: (value, key) called for each key-value pair; value is passed as 1st argument, and key as 2nd argument
// <this arg>: value of "this" to use for the <pair fn>
// <resolve fn>: (size) called when all key-value pairs are done; size is passed as 1st argument
// <reject fn>: (err) called when some error occurs; err is passed as 1st argument
```
```javascript
// log to console all key-value pairs and size of map, or throw if error occurs
m.forEach((value, key) => console.log(`${key} = ${value}`)).then((size) => console.log('size = %d', size)).catch((err) => { throw err; });

// log to console all key-value pairs and size of map, or show warning on console if error occurs
m.forEach((value, key) => {
  console.log(`${key} = ${value}`);
}).then((size) => {
  console.log('size = %d', size);
});

// log to console all key-value pairs, or show warning on console if error occurs
m.forEach((value, key) => {
  console.log(`${key} = ${value}`);
});
```


### valueOf

Want to get the entire map as a `Map`. Then this is the solution. The `Map` is passed to the `Promise`.
You can then log the entire map with `JSON.stringify()` or iterate over it using `for ... of`.

```javascript
m.valueOf().then(<resolve fn>)[.catch(<result fn>)];
// []: optional continuation call
// <resolve fn>: (map) called when the entire map is obtained as a `Map`; map is passed as 1st argument
// <reject fn>: (err) called when some error occurs; err is passed as 1st argument
```
```javascript
// log to console entire map, or throw if error occurs
m.valueOf().then((map) => console.log(JSON.stringify(map))).catch((err) => { throw err; });

// log to console entire map, or show warning on console if error occurs
m.valueOf().then((map) => {
  console.log(JSON.stringify(map));
});
```


### entries

Want to get the entire map as an iterator of key-value pairs. Then this is the solution. The `Iterator` of key-value
pairs is passed to the `Promise`. You can then log all the pairs with `JSON.stringify()` or iterate over them
using `for ... of`.

```javascript
m.entries().then(<resolve fn>)[.catch(<result fn>)];
// []: optional continuation call
// <resolve fn>: (iterator) called when the entire map is obtained as an iterator of key-value pairs; iterator is passed as 1st argument
// <reject fn>: (err) called when some error occurs; err is passed as 1st argument
```
```javascript
// log to console all key-value pairs, or throw if error occurs
m.entries().then((iterator) => console.log(JSON.stringify(iterator))).catch((err) => { throw err; });

// log to console all key-value pairs, or show warning on console if error occurs
m.entries().then((iterator) => {
  console.log(JSON.stringify(iterator));
});
```


### keys

Want to get the entire map as an iterator of keys. Then this is the solution. The `Iterator` of keys is passed to the
`Promise`. You can then log all the keys with `JSON.stringify()` or iterate over them using `for ... of`.

```javascript
m.keys().then(<resolve fn>)[.catch(<result fn>)];
// []: optional continuation call
// <resolve fn>: (iterator) called when the entire map is obtained as an iterator of keys; iterator is passed as 1st argument
// <reject fn>: (err) called when some error occurs; err is passed as 1st argument
```
```javascript
// log to console all keys, or throw if error occurs
m.keys().then((iterator) => console.log(JSON.stringify(iterator))).catch((err) => { throw err; });

// log to console all keys, or show warning on console if error occurs
m.keys().then((iterator) => {
  console.log(JSON.stringify(iterator));
});
```


### values

Want to get the entire map as an iterator of values. Then this is the solution. The `Iterator` of values is passed to the
`Promise`. You can then log all the values with `JSON.stringify()` or iterate over them using `for ... of`.

```javascript
m.values().then(<resolve fn>)[.catch(<result fn>)];
// []: optional continuation call
// <resolve fn>: (iterator) called when the entire map is obtained as an iterator of values; iterator is passed as 1st argument
// <reject fn>: (err) called when some error occurs; err is passed as 1st argument
```
```javascript
// log to console all values, or throw if error occurs
m.values().then((iterator) => console.log(JSON.stringify(iterator))).catch((err) => { throw err; });

// log to console all values, or show warning on console if error occurs
m.values().then((iterator) => {
  console.log(JSON.stringify(iterator));
});
```


[PostgreSQL]: https://www.postgresql.org
[Map]: https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Map
[Promise]: https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise
[Callback]: https://developer.mozilla.org/en-US/docs/Mozilla/js-ctypes/Using_js-ctypes/Declaring_and_Using_Callbacks
