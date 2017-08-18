var assert = require('assert');
var MapPg = require('./');
var pg = require('pg');
var pgconfig = require('pg-connection-string').parse;

var pool = new pg.Pool(pgconfig(process.env.DATABASE_URL));
pool.connect((err, db, done) => {
  var whypa = new MapPg(db, 'why', {'q': 'text', 'a': 'text'}, 'q', 'a');
  var whypb = new MapPg(db, 'why', {'q': 'text', 'a': 'text'}, 'q', ['a']);
  var whypc = new MapPg(db, 'why', {'q': 'text', 'a': 'text'}, 'q', ['q', 'a']);
  var whypd = new MapPg(db, 'why', {'q': 'text', 'a': 'text'}, ['q'], ['q', 'a']);
  Promise.all([whypa, whypb, whypc, whypd]).then((why) => {
    var whya = why[0], whyb = why[1], whyc = why[2], whyd = why[3];

    whya.set('Why is the sky blue, yellow, red, black and white?', 'Because your eyes are painted on the inside.').then((ans) => {
      assert.equal(ans, 1);
    });
    whyb.set('What is that big pipe?', {'a': 'Its called postbox and it is where you came from.'}).then((ans) => {
      assert.equal(ans, 1);
    });
    whyc.set('Why are you so happy at the end of every month?', {'a': 'Because there are 2 moons on that night.'}).then((ans) => {
      assert.equal(ans, 1);
    });
    whyd.set({'q': 'Why so serious?'}, {'a': 'You are joker?'}).then((ans) => {
      assert.equal(ans, 1);
    });
    
    whya.size.then((ans) => {
      assert.equal(ans, 4);
    });
    whyb.size.then((ans) => {
      assert.equal(ans, 4);
    });
    whyc.size.then((ans) => {
      assert.equal(ans, 4);
    });
    whyd.size.then((ans) => {
      assert.equal(ans, 4);
    });
    
    whya.get('Why so serious?').then((ans) => {
      assert.equal(ans, 'You are joker?');
    });
    whyb.get('Why are you so happy at the end of every month?').then((ans) => {
      assert.deepEqual(ans, {'a': 'Because there are 2 moons on that night.'});
    });
    whyc.get('What is that big pipe?').then((ans) => {
      assert.deepEqual(ans, {'q': 'What is that big pipe?', 'a': 'Its called postbox and it is where you came from.'});
    });
    whyd.get({'q': 'Why is the sky blue, yellow, red, black and white?'}).then((ans) => {
      assert.deepEqual(ans, {'q': 'Why is the sky blue, yellow, red, black and white?', 'a': 'Because your eyes are painted on the inside.'});
    });
    whya.get('Hello Nanana').then((ans) => {
      assert.equal(undefined);
    });
    
    whya.delete('Why so serious?').then((ans) => {
      assert.equal(ans, 1);
    });
    whyd.set({'q': 'Why are you so happy at the end of every month?'}, undefined).then((ans) => {
      assert.deepEqual(ans, 1);
    });

    // ...
  });
  done();
});
