var _format = require('object-format');
var _pull = require('object-pull');
var _pullv = require('object-pullvalues');
var _array = require('array-to');
var _object = require('object-to');

var $ = function(db, tab, col, key, val) {
  this._db = db;
  this._tab = tab||'map';
  this._key = key||'key';
  this._val = val||'value';
  this._where = _format(this._key, '"%v"=$%i', ' AND ', 1);
  this._col = col||{'key': 'TEXT', 'value': 'TEXT'};
  return this._db.query(
    `CREATE TABLE IF NOT EXISTS "${this._tab}" (`+
    `${_format(this._col, '"%k" %v')}, `+
    `PRIMARY KEY (${_format(_array(this._key), '"%v"')})`+
    `);`
  ).then(() => this);
};
module.exports = $;

var _ = $.prototype;

Object.defineProperty(_, 'size', {'get': function() {
  return this._db.query(
    `SELECT COUNT(*) AS n FROM ${this._tab};`
  ).then((ans) => parseInt(ans.rows[0].n));
}});

_.set = function(k, v) {
  if(v===undefined) return this.delete(k);
  var par = [], kv = Object.assign({}, _object(k, this._key), _object(v, this._val));
  return this._db.query(
    `INSERT INTO "${this._tab}" (${_format(kv, '"%k"', ',', 1, par)}) `+
    `VALUES (${_format(kv, '$%i', ',', 1)}) ON CONFLICT (${this._keys}) `+
    `DO UPDATE SET ${_format(v, '"%k"=$%i', ',', par.length+1, par)};`, par
  ).then((ans) => ans.rowCount);
};

_.get = function(k) {
  return this._db.query(
    `SELECT * FROM "${this._tab}" `+
    `WHERE ${this._where};`, _array(_pullv(k, this._key))
  ).then((ans) => ans.rowCount? _pull(ans.rows[0], this._val) : undefined);
};

_.delete = function(k) {
  return this._db.query(
    `DELETE FROM "${this._tab}" `+
    `WHERE ${this._where};`, _array(_pullv(k, this._key))
  ).then((ans) => ans.rowCount);
};

_.has = function(k) {
  return this._db.query(
    `SELECT * FROM "${this._tab}" `+
    `WHERE ${this._where};`, _array(_pullv(k, this._key))
  ).then((ans) => ans.rowCount===1);
};

_.clear = function() {
  return this._db.query(
    `DELETE FROM "${this._tab}";`
  ).then((ans) => ans.rowCount);
};

_.valueOf = function() {
  return this._db.query(
    `SELECT * FROM "${this._tab}";`
  ).then((ans) => {
    var a = new Map();
    for(var i=0, I=ans.rowCount; i<I; i++) {
      var r = ans.rows[i];
      a.set(_pull(r, this._key), _pull(r, this._val));
    }
    return a;
  });
};

_.forEach = function(fn, thisArg) {
  return this.valueOf().then((ans) => {
    ans.forEach(fn, thisArg);
    return ans.size;
  });
};

_.entries = function() {
  return this.valueOf().then((ans) => ans.entries());
};

_.keys = function() {
  return this.valueOf().then((ans) => ans.keys());
};

_.values = function() {
  return this.valueOf().then((ans) => ans.values());
};
