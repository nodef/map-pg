var pgconfig = require('pg-connection-string').parse;
var mappg = require('./index');
var _ = require('lodash');
var pg = require('pg');


// settings
var url = process.env.DATABASE_URL;
pg.defaults.ssl = true;


// test map
console.log('pg.connect: '+url);
var pool = new pg.Pool(pgconfig(url));
pool.connect(function(err, db, done) {
	var P, I;
	if(err) throw err;
	console.log('pg.connect: done');
	var m = new Map();
	var M = new mappg(db);
	M.clear();
	M.size.then((n) => { if(m.size!==n) throw new Error('size mismatch'); });
	for(var i=0, I=26*Math.random(); i<I; i++) {
		m.set('a'+i, ''+i);
		P = M.set('a'+i, ''+i);
	}
	P.then(() => {
		M.size.then((n) => { if(m.size!==n) throw new Error('size mismatch'); });
		for(var i=0; i<26; i++) {
			M.has('a'+i).then((v) => { if(m.has('a'+i)!==v) throw new Error('has mismatch'); });
			M.get('a'+i).then((v) => { if(m.get('a'+i)!==v) throw new Error('get mismatch'); });
		}
	});
	for(var i=0, I=26*Math.random(); i<I; i++) {
		m.delete('a'+i);
		P = M.delete('a'+i);
	}
	P.then(() => {
		M.size.then((n) => { if(m.size!==n) throw new Error('size mismatch'); });
		for(var i=0; i<26; i++) {
			M.has('a'+i).then((v) => { if(m.has('a'+i)!==v) throw new Error('has mismatch'); });
			M.get('a'+i).then((v) => { if(m.get('a'+i)!==v) throw new Error('get mismatch'); });
		}
	});
	M.forEach((v, k) => {
		if(m.get(k)!==v) throw new Error('forEach mismatch');
	});
	M.valueOf((v) => { if(!_.isEqual(m, v)) throw new Error('valueOf mismatch'); });
	M.entries((v) => { if(!_.isEqual(m.entries(), v)) throw new Error('entries mismatch'); });
	M.keys((v) => { if(!_.isEqual(m.keys(), v)) throw new Error('keys mismatch'); });
	M.values((v) => { if(!_.isEqual(m.values(), v)) throw new Error('values mismatch'); });
	done();
});
