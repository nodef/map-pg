var pgconfig = require('pg-connection-string').parse;
var mappg = require('./index');
var pg = require('pg');


// settings
var url = process.env.DATABASE_URL;
pg.defaults.ssl = true;


// connect to db
console.log('pg.connect: '+url);
var pool = new pg.Pool(pgconfig(url));
pool.connect(function(err, db, done) {
	if(err) throw err;
	console.log('pg.connect: done');
	var m = new mappg(db.query, db);
	console.log('map created');
	m.size.then((n) => console.log('size: %d', n));
	m.set('a', '0').then(() => console.log('set: a=0'));
	m.set('b', '1').then(() => console.log('set: b=1'));
	m.size.then((n) => console.log('size: %d', n));
	m.get('a').then((v) => console.log('get: a=%s', v));
	m.get('b').then((v) => console.log('get: b=%s', v));
	done();
});
