var pgconfig = require('pg-connection-string').parse;
var mappg = require('./index');
var _ = require('lodash');
var pg = require('pg');


// settings
var url = process.env.DATABASE_URL;
pg.defaults.ssl = true;


// test fns
var tsize = function(m, M) {
	var mv = m.size;
	M.size.then((MV) => {
		console.log(`m.size=${mv}, M.size=${MV}`);
		if(mv!==MV) throw new Error('size mismatch');
	});
};

var thas = function(m, M, k) {
	var mv = m.has(k);
	M.has(k).then((MV) => {
		console.log(`m.has(${k})=${mv}, M.has(${k})=${MV}`);
		if(mv!==MV) throw new Error('has mismatch');
	});
};

var tget = function(m, M, k) {
	var mv = m.get(k);
	M.get(k).then((MV) => {
		console.log(`m.get(${k})=${mv}, M.get(${k})=${MV}`);
		if(mv!==MV) throw new Error('get mismatch');
	});
}

var tdoset = function(m, M) {
	var P;
	for(var i=0, I=26*Math.random(); i<I; i++) {
		var k = 'a'+i;
		var v = ''+i;
		m.set(k, v);
		P = M.set(k, v);
		console.log(`m.set(${k}, ${v}), M.set(${k}, ${v})`);
	}
	return P;
};

var tdodelete = function(m, M) {
	var P;
	for(var i=0, I=26*Math.random(); i<I; i++) {
		var k = 'a'+i;
		m.delete(k);
		P = M.delete(k);
		console.log(`m.delete(${k}), M.delete(${k})`);
	}
	return P;
};

var tcheck = function(m, M, P) {
	P.then(() => {
		tsize(m, M);
		for(var i=0; i<26; i++) {
			var k = 'a'+i;
			thas(m, M, k);
			tget(m, M, k);
		}
	});
};

var tforEach = function(m, M) {
	M.forEach((MV, k) => {
		var mv = m.get(k);
		console.log(`forEach: m[${k}]=${mv}, M[${k}]=${MV}`);
		if(mv!==MV) throw new Error('forEach mismatch');
	}).then((MV) => {
		var mv = m.size;
		console.log(`forEach: m.size=${mv}, M.size=${MV}`);
	});
};

var tvalueOf = function(m, M) {
	M.valueOf((MV) => {
		var mv = m;
		console.log('valueOf: mv=%s, MV=%s', JSON.stringify(mv), JSON.stringify(MV));
		if(!_.isEqual(mv, MV)) throw new Error('valueOf mismatch');
	});
};

var tentries = function(m, M) {
	M.entries((MV) => {
		var mv = m.entries();
		console.log('entries: mv=%s, MV=%s', JSON.stringify(mv), JSON.stringify(MV));
		if(!_.isEqual(mv, MV)) throw new Error('entries mismatch');
	});
};

var tkeys = function(m, M) {
	M.keys((MV) => {
		var mv = m.keys();
		console.log('keys: mv=%s, MV=%s', JSON.stringify(mv), JSON.stringify(MV));
		if(!_.isEqual(mv, MV)) throw new Error('keys mismatch');
	});
};

var tvalues = function(m, M) {
	M.values((MV) => {
		var mv = m.values();
		console.log('values: mv=%s, MV=%s', JSON.strinfigy(mv), JSON.stringify(MV));
		if(!_.isEqual(mv, MV)) throw new Error('values mismatch');
	});
};


// test map
console.log('pg.connect: '+url);
var pool = new pg.Pool(pgconfig(url));
pool.connect(function(err, db, done) {
	var P, I;
	if(err) throw err;
	console.log('pg.connect: done');
	var m = new Map();
	var M = new mappg(db);
	P = M.clear();
	tsize(m, M);
	P = tdoset(m, M);
	tcheck(m, M, P);
	P = tdodelete(m, M);
	tcheck(m, M, P);
	tforEach(m, M);
	tvalueOf(m, M);
	tentries(m, M);
	tkeys(m, M);
	tvalues(m, M);
	done();
});
