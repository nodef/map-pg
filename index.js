/* MAP-PG: Map interface for PostgreSQL. */
/* @wolfram77 */
'use strict';
(function() {
var $ = function(fn, ths, tab, key, val) {
	this.fn = fn;
	this.ths = ths;
	this.tab = tab || 'MAP';
	this.key = key || 'Key';
	this.val = val || 'Val';
	this.fn.call(this.ths, `CREATE TABLE IF NOT EXISTS ${this.tab}(${this.key} TEXT PRIMARY KEY, ${this.val} TEXT)`, (err, res) => {
		if(err) throw err;
	});
};


var _ = $.prototype;


Object.defineProperty(_, 'size', {'get': function() {
	return new Promise((fres, frej) => {
		this.fn.call(this.ths, `SELECT COUNT(*) AS Cnt FROM ${this.tab}`, (err, res) => {
			if(err) frej(err);
			else fres(res.rows[0].Cnt);
		});
	});
}});


_.has = function(k) {
	return new Promise((fres, frej) => {
		this.fn.call(this.ths, `SELECT ${this.key} FROM ${this.tab} WHERE ${this.key}=$1`, k, (err, res) => {
			if(err) frej(err);
			else fres(res.rowCount===1);
		});
	});
};


_.get = function(k) {
	return new Promise((fres, frej) => {
		this.fn.call(this.ths, `SELECT ${this.val} AS Val FROM ${this.tab} WHERE ${this.key}=$1`, k, (err, res) => {
			if(err) frej(err);
			else fres(res.rows[0].Val);
		});
	});
};


_.set = function(k, v) {
	return new Promise((fres, frej) => {
		this.fn.call(this.ths, `INSERT INTO ${this.tab} VALUES($1, $2) ON CONFLICT DO UPDATE SET ${this.val}=$2 WHERE ${this.key}=$1`, k, v, (err, res) => {
			if(err) frej(err);
			else fres(res.rowCount);
		});
	});
};


_.delete = function(k) {
	return new Promise((fres, frej) => {
		this.fn.call(this.ths, `DELETE FROM ${this.tab} WHERE ${this.key}=$1`, k, (err, res) => {
			if(err) frej(err);
			else fres(res.rowCount);
		});
	});
};


_.clear = function() {
	return new Promise((fres, frej) => {
		this.fn.call(this.ths, `DELETE FROM ${this.tab}`, (err, res) => {
			if(err) frej(err);
			else fres(res.rowCount);
		});
	});
};


_.forEach = function(fn) {
	this.fn.call(this.ths, `SELECT ${this.key} AS Key, ${this.val} AS Val FROM ${this.tab}`, (err, res) => {
		if(err) throw err;
		for(var i=0, I=res.rowCount; i<I; i++) {
			fn(res.rows[i].Val, res.rows[i].Key);
		}
	});
};


_.valueOf = function() {
	return new Promise((fres, frej) => {
		this.fn.call(this.ths, `SELECT ${this.key} AS Key, ${this.val} AS Val FROM ${this.tab}`, (err, res) => {
			if(err) frej(err);
			var a = new Map();
			for(var i=0, I=res.rowCount; i<I; i++) {
				a.set(res.rows[i].Key, res.rows[i].Val);
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
