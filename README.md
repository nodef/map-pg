# map-pg

[![Greenkeeper badge](https://badges.greenkeeper.io/nodef/map-pg.svg)](https://greenkeeper.io/)

[![NPM](https://nodei.co/npm/map-pg.png)](https://nodei.co/npm/map-pg/)

[Promised] [Map] interface for Table in [PostgreSQL].

```javascript
var MapPg = require('map-pg');
// new MapPg(<db>, [<table>], [<type>], [<key>], [<value>]);
// db:    database connection (dont use pool to avoid inconsistency)
// table: name of database table (default = "map")
// type:  datatype of columns (default = {"key": "TEXT", "value": "TEXT"})
// key:   key columns (default = "key")
// value: value columns (default = "value")
// (NOTE: call .setup() if table does not exist)
```
```javascript
var pg = require('pg');
var MapPg = require('map-pg');

var pool = new pg.Pool(DB_CONFIG);
var type = {
  "key": "TEXT",
  "value": "TEXT"
};
pool.connect((err, db, done) => {
  var mapa = new MapPg(db);
  var mapb = new MapPg(db, 'map', type, 'key', ['value']);
  var mapc = new MapPg(db, 'map', type, 'key', ['key', 'value']);
  var mapd = new MapPg(db, 'map', tyoe, ['key'], ['key', 'value']);

  // create the table "map" (all use same table, so 1 setup is enough)
  // note: if you are using pool, do anything after setup().then()
  mapa.setup().then(() => console.log('Table created'));
  // Table created

  mapa.set('n', 'Noble');
  mapb.set('p', {'value': 'Programming'});
  mapc.set('m', {'value': 'Mantra'});
  mapd.set('.', {'value': '2012'}).then(() => console.log('"." set'));
  // "." set

  mapa.size.then((ans) => ans); // 4
  mapb.size.then((ans) => ans); // 4
  mapc.size.then((ans) => ans); // 4
  mapd.size.then((ans) => ans); // 4

  mapa.get('.').then((ans) => console.log(ans));
  // "2012"
  mapb.get('m').then((ans) => console.log(ans));
  // {"value": "Mantra"}
  mapc.get('p').then((ans) => console.log(ans));
  // {"key": "p", "value": "Programming"}
  mapd.get({'key': 'n'}).then((ans) => console.log(ans));
  // {"key": "n", "value": "Noble"}
  mapa.get('l').then((ans) => console.log(ans));
  // undefined

  mapa.delete('m');
  mapd.delete('x').then((ans) => ans); // 0

  mapb.size.then((ans) => console.log('new size: '+ans));
  // new size: 3
  done();
});
```

[PostgreSQL]: https://www.postgresql.org
[Map]: https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Map
[Promised]: https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise
