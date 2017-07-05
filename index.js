/* MAP-PG: Map interface for PostgreSQL. */
/* @wolfram77 */
'use strict';
(function() {
var $ = function(db, tab, key, val) {
	this.db = db;
	this.tab = tab || 'MAP';
	this.key = key || 'key';
	this.val = val || 'val';
	this.db.query(`CREATE TABLE IF NOT EXISTS "${this.tab}"("${this.key}" TEXT PRIMARY KEY, "${this.val}" TEXT)`, (err, res) => {
		if(err) throw err;
	});
};


var _ = $.prototype;


Object.defineProperty(_, 'size', {'get': function() {
	return new Promise((fres, frej) => {
		this.db.query(`SELECT COUNT(*) AS cnt FROM "${this.tab}"`, (err, res) => {
			if(err) frej(err);
			else fres(res.rows[0].cnt);
		});
	});
}});


_.has = function(k) {
	return new Promise((fres, frej) => {
		this.db.query(`SELECT "${this.key}" FROM "${this.tab}" WHERE "${this.key}"=$1`, [k], (err, res) => {
			if(err) frej(err);
			else fres(res.rowCount===1);
		});
	});
};


_.get = function(k) {
	return new Promise((fres, frej) => {
		this.db.query(`SELECT "${this.val}" AS val FROM "${this.tab}" WHERE "${this.key}"=$1`, [k], (err, res) => {
			if(err) frej(err);
			else fres(res.rowCount>0? res.rows[0].val : undefined);
		});
	});
};


_.set = function(k, v) {
	return new Promise((fres, frej) => {
		this.db.query(`INSERT INTO "${this.tab}" ("${this.key}", "${this.val}") VALUES ($1, $2) ON CONFLICT ("${this.key}") DO UPDATE SET "${this.val}" = $2`, [k, v], (err, res) => {
			if(err) frej(err);
			else fres(res.rowCount);
		});
	});
};


_.delete = function(k) {
	return new Promise((fres, frej) => {
		this.db.query(`DELETE FROM "${this.tab}" WHERE "${this.key}"=$1`, [k], (err, res) => {
			if(err) frej(err);
			else fres(res.rowCount);
		});
	});
};


_.clear = function() {
	return new Promise((fres, frej) => {
		this.db.query(`DELETE FROM "${this.tab}"`, (err, res) => {
			if(err) frej(err);
			else fres(res.rowCount);
		});
	});
};


_.forEach = function(fn, thisArg) {
	this.db.query(`SELECT "${this.key}" AS key, "${this.val}" AS val FROM "${this.tab}"`, (err, res) => {
		if(err) throw err;
		for(var i=0, I=res.rowCount; i<I; i++) {
			fn.call(thisArg, res.rows[i].val, res.rows[i].key);
		}
	});
};


_.valueOf = function() {
	return new Promise((fres, frej) => {
		this.db.query(`SELECT "${this.key}" AS key, "${this.val}" AS val FROM "${this.tab}"`, (err, res) => {
			if(err) frej(err);
			var a = new Map();
			for(var i=0, I=res.rowCount; i<I; i++) {
				a.set(res.rows[i].key, res.rows[i].val);
			}
			fres(a);
		});
	});
};


_.entries = function() {
	return new Promise((fres, frej) => {
		var v = this.valueOf();
		v.then((a) => { fres(a.entries()); });
		v.catch((err) => { frej(err); });
	});
};


_.keys = function() {
	return new Promise((fres, frej) => {
		var v = this.valueOf();
		v.then((a) => { fres(a.keys()); });
		v.catch((err) => { frej(err); });
	});
};


_.values = function() {
	return new Promise((fres, frej) => {
		var v = this.valueOf();
		v.then((a) => { fres(a.values()); });
		v.catch((err) => { frej(err); });
	});
};


module.exports = $;
})();
