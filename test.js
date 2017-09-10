var pgconfig = require('pg-connection-string').parse;
var assert = require('assert');
var MapPg = require('./');
var https = require('https');
var pg = require('pg');

var req = https.get('https://ci-postgresql.herokuapp.com', (res) => {
  var data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    var url = data;
    var pool = new pg.Pool(pgconfig(url+'?ssl=true'));
    pool.connect(ready);
  })
});

var type = {
  "key": "TEXT",
  "value": "TEXT"
};
var ready = function(err, db, done) {
  var mapa = new MapPg(db);
  var mapb = new MapPg(db, 'map', type, 'key', ['value']);
  var mapc = new MapPg(db, 'map', type, 'key', ['key', 'value']);
  var mapd = new MapPg(db, 'map', type, ['key'], ['key', 'value']);
  mapa.setup().then((err, ans) => console.log('Table created'));

  mapa.set('n', 'Noble');
  mapb.set('p', {'value': 'Programming'});
  mapc.set('m', {'value': 'Mantra'});
  mapd.set('.', {'value': '2012'}).then(() => console.log('"." set'));

  mapa.size.then((ans) => assert.equal(ans, 4));
  mapb.size.then((ans) => assert.equal(ans, 4));
  mapc.size.then((ans) => assert.equal(ans, 4));
  mapd.size.then((ans) => assert.equal(ans, 4));

  mapa.get('.').then((ans) => assert.equal(ans, '2012'));
  mapb.get('m').then((ans) => assert.deepEqual(ans, {'value': 'Mantra'}));
  mapc.get('p').then((ans) => assert.deepEqual(ans, {'key': 'p', 'value': 'Programming'}));
  mapd.get({'key': 'n'}).then((ans) => assert.deepEqual(ans, {'key': 'n', 'value': 'Noble'}));
  mapa.get('l').then((ans) => assert.equal(ans, undefined));

  mapa.delete('m');
  mapd.delete('x').then((ans) => assert.equal(ans, 0));

  mapb.size.then((ans) => assert.equal(ans, 3));
  done();
};
