/* MAP-PG: Map interface for PostgreSQL. */
/* @wolfram77 */
'use strict';
(function() {
var $ = function(fn, ths, tab, key, val) {
	this.fn = fn;
	this.ths = ths;
	this.tab = tab || 'MAP';
	this.key = key || 'okey';
	this.val = val || 'oval';
	console.log(`CREATE TABLE IF NOT EXISTS "${this.tab}"("${this.key}" TEXT PRIMARY KEY, "${this.val}" TEXT)`);
	this.fn.call(this.ths, `CREATE TABLE IF NOT EXISTS "${this.tab}"("${this.key}" TEXT PRIMARY KEY, "${this.val}" TEXT)`, (err, res) => {
		if(err) throw err;
	});
};


var _ = $.prototype;


Object.defineProperty(_, 'size', {'get': function() {
	var o = this;
	console.log('size;a');
	return new Promise((fres, frej) => {
		console.log('size;b');
		console.log(`SELECT COUNT(*) AS cnt FROM "${this.tab}"`);
		this.fn.call(this.ths, `SELECT COUNT(*) AS cnt FROM "${this.tab}"`, (err, res) => {
			console.log('size;c');
			if(err) frej(err);
			else fres(res.rows[0].cnt);
		});
	});
}});


_.has = function(k) {
	return new Promise((fres, frej) => {
		console.log(`SELECT "${this.key}" FROM "${this.tab}" WHERE "${this.key}"=$1`);
		this.fn.call(this.ths, `SELECT "${this.key}" FROM "${this.tab}" WHERE "${this.key}"=$1`, [k], (err, res) => {
			if(err) frej(err);
			else fres(res.rowCount===1);
		});
	});
};


_.get = function(k) {
	return new Promise((fres, frej) => {
		console.log(`SELECT "${this.val}" AS Val FROM "${this.tab}" WHERE "${this.key}"=$1`);
		this.fn.call(this.ths, `SELECT "${this.val}" AS Val FROM "${this.tab}" WHERE "${this.key}"=$1`, [k], (err, res) => {
			if(err) frej(err);
			else fres(res.rows[0].Val);
		});
	});
};


_.set = function(k, v) {
	console.log('set;a');
	return new Promise((fres, frej) => {
		console.log('set;b');
		console.log(`INSERT INTO "${this.tab}" VALUES($1, $2) ON CONFLICT ("${this.key}") DO UPDATE SET "${this.val}"=$2 WHERE "${this.key}"=$1`);
		this.fn.call(this.ths, `INSERT INTO "${this.tab}" VALUES($1, $2) ON CONFLICT ("${this.key}") DO UPDATE SET "${this.val}"=$2 WHERE "${this.key}"=$1`, [k, v], (err, res) => {
			console.log('set;c');
			if(err) frej(err);
			else fres(res.rowCount);
		});
	});
};


_.delete = function(k) {
	return new Promise((fres, frej) => {
		console.log(`DELETE FROM "${this.tab}" WHERE "${this.key}"=$1`);
		this.fn.call(this.ths, `DELETE FROM "${this.tab}" WHERE "${this.key}"=$1`, [k], (err, res) => {
			if(err) frej(err);
			else fres(res.rowCount);
		});
	});
};


_.clear = function() {
	return new Promise((fres, frej) => {
		console.log(`DELETE FROM "${this.tab}"`);
		this.fn.call(this.ths, `DELETE FROM "${this.tab}"`, (err, res) => {
			if(err) frej(err);
			else fres(res.rowCount);
		});
	});
};


_.forEach = function(fn) {
	console.log(`SELECT "${this.key}" AS Key, "${this.val}" AS Val FROM "${this.tab}"`);
	this.fn.call(this.ths, `SELECT "${this.key}" AS Key, "${this.val}" AS Val FROM "${this.tab}"`, (err, res) => {
		if(err) throw err;
		for(var i=0, I=res.rowCount; i<I; i++) {
			fn(res.rows[i].Val, res.rows[i].Key);
		}
	});
};


_.valueOf = function() {
	return new Promise((fres, frej) => {
		console.log(`SELECT "${this.key}" AS Key, "${this.val}" AS Val FROM "${this.tab}"`);
		this.fn.call(this.ths, `SELECT "${this.key}" AS Key, "${this.val}" AS Val FROM "${this.tab}"`, (err, res) => {
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
