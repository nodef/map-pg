var $ = function(db, tab, key, val) {
  this._db = db;
  this._tab = tab||'map';
  this._key = key||'key';
  this._val = val||'value';
  this._db.query(
    `CREATE TABLE IF NOT EXISTS "${this._tab}" `+
    `("${this._key}" TEXT PRIMARY KEY, "${this._val}" TEXT);`
  );
};
module.exports = $;

var _ = $.prototype;

Object.defineProperty(_, 'size', {'get': function() {
  return this._db.query(
    `SELECT COUNT(*) AS n FROM ${this._tab};`
  ).then((ans) => parseInt(ans.rows[0].n));
}});

_.has = function(k) {
  return this._db.query(
    `SELECT "${this._key}" FROM "${this._tab}" `+
    `WHERE "${this._key}"=$1;`, [k]
  ).then((ans) => ans.rowCount===1);
};

_.get = function(k) {
  return this._db.query(
    `SELECT "${this._val}" AS v FROM "${this._tab}" `+
    `WHERE "${this._key}"=$1;`, [k]
  ).then((ans) => ans.rowCount? ans.rows[0].v : undefined);
};

_.set = function(k, v) {
  return this._db.query(
    `INSERT INTO "${this._tab}" ("${this._key}", "${this._val}") `+
    `VALUES ($1, $2) ON CONFLICT ("${this._key}") `+
    `DO UPDATE SET "${this._val}"=$2;`, [k, v]
  ).then((ans) => ans.rowCount);
};

_.delete = function(k) {
  return this._db.query(
    `DELETE FROM "${this._tab}" `+
    `WHERE "${this._key}"=$1;`, [k]
  ).then((ans) => ans.rowCount);
};

_.clear = function() {
  return this._db.query(
    `DELETE FROM "${this._tab}";`
  ).then((ans) => ans.rowCount);
};

_.valueOf = function() {
  return this._db.query(
    `SELECT "${this._key}" AS k, "${this._val}" AS v FROM "${this._tab}";`
  ).then((ans) => {
    var a = new Map();
    for(var i=0, I=res.rowCount; i<I; i++)
      a.set(ans.rows[i].k, ans.rows[i].v);
    return a;
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

_.forEach = function(fn, thisArg) {
  return this._db.query(
    `SELECT "${this._key}" AS k, "${this._val}" AS v FROM "${this._tab}"`
  ).then((ans) => {
    for(var i=0, I=ans.rowCount; i<I; i++)
      fn.call(thisArg, ans.rows[i].v, ans.rows[i].k);
    return ans.rowCount;
  });
};

_.find = function(sch) {
  var i = 0, par = [], exp = '';
  for(var k in sch) {
    exp += `${k} LIKE `+'$'+(i++);
    par.push(sch[k]);
  }
  return this._db.query(
    `SELECT * FROM "${this._tab}"`+
    (exp? ' WHERE '+exp : '')+';', par
  );
};
