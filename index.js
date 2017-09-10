'use strict';
const _pull = require('object-pull');
const _pullv = require('object-pullvalues');
const _format = require('object-format');
const _array = require('array-to');
const _object = require('object-to');
const _pullmap = require('objectarray-pullmap');

const $ = function MapPg(db, tab, typ, key, val) {
  this._db = db;
  this._tab = tab||'map';
  this._key = key||'key';
  this._val = val||'value';
  this._typ = typ||{'key': 'TEXT', 'value': 'TEXT'};
  this._keys = _format(_array(this._key), '"%v"');
  this._where = _format(_array(this._key), '"%v"=$%i', ' AND ', 1);
};
module.exports = $;

const _ = $.prototype;

_.setup = function() {
  return this._db.query(
    `CREATE TABLE IF NOT EXISTS "${this._tab}" (`+
    `${_format(this._typ, '"%k" %v')},`+
    `PRIMARY KEY (${this._keys})`+
    `);`
  );
};

Object.defineProperty(_, 'size', {'get': function() {
  return this._db.query(
    `SELECT COUNT(*) AS n FROM ${this._tab};`
  ).then((ans) => parseInt(ans.rows[0].n));
}});

_.set = function(k, v) {
  if(v===undefined) return this.delete(k);
  var k = _object(k, this._key), v = _object(v, this._val);
  var par = [], kv = Object.assign({}, k, v);
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
  ).then((ans) => _pullmap(ans.rows||[], this._key, this._val));
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
