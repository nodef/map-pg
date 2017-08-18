# map-pg

[![NPM](https://nodei.co/npm/map-pg.png)](https://nodei.co/npm/map-pg/)

[Promised] [Map] interface for Table in [PostgreSQL].

```javascript
var pg = require('pg');
var pgconfig = require('pg-connection-string').parse;
var MapPg = require('MapPg');
// new MapPg(<connection>, <table>, <column types>, <key columns>, <value columns>);
// MapPg.prototype.size
// MapPg.prototype.set(<key>, <value>)
// MapPg.prototype.get(<key>)
// MapPg.prototype.delete(<key>)
// MapPg.prototype.has(<key>)
// MapPg.prototype.clear()
// MapPg.prototype.forEach(<function>, <this arg>)
// MapPg.prototype.valueOf()
// MapPg.prototype.entries()
// MapPg.prototype.keys()
// MapPg.prototype.values()

var pool = new pg.Pool(pgconfig(url)); // put your db url here
pool.connect((err, db, done) => {
  var whypa = new MapPg(db, 'why', {'q': 'text', 'a': 'text'}, 'q', 'a');
  var whypb = new MapPg(db, 'why', {'q': 'text', 'a': 'text'}, 'q', ['a']);
  var whypc = new MapPg(db, 'why', {'q': 'text', 'a': 'text'}, 'q', ['q', 'a']);
  var whypd = new MapPg(db, 'why', {'q': 'text', 'a': 'text'}, ['q'], ['q', 'a']);
  Promise.all([whypa, whypb, whypc, whypd]).then((why) => {
    var whya = why[0], whyb = why[1], whyc = why[2], whyd = why[3];

    whya.set('Why is the sky blue, yellow, red, black and white?', 'Because your eyes are painted on the inside.').then((ans) => ans);
    // -> 1
    whyb.set('What is that big pipe?', {'a': 'Its called postbox and it is where you came from.'}).then((ans) => ans);
    // -> 1
    whyc.set('Why are you so happy at the end of every month?', {'a': 'Because there are 2 moons on that night.'}).then((ans) => ans);
    // -> 1
    whyd.set({'q': 'Why so serious?'}, {'a': 'You are joker?'}).then((ans) => ans);
    // -> 1
    
    whya.size.then((ans) => ans);
    // -> 4
    whyb.size.then((ans) => ans);
    // -> 4
    whyc.size.then((ans) => ans);
    // -> 4
    whyd.size.then((ans) => ans);
    // -> 4
    
    whya.get('Why so serious?').then((ans) => ans);
    // -> 'You are joker?'
    whyb.get('Why are you so happy at the end of every month?').then((ans) => ans);
    // -> {'a': 'Because there are 2 moons on that night.'}
    whyc.get('What is that big pipe?').then((ans) => ans);
    // -> {'q': 'What is that big pipe?', 'a': 'Its called postbox and it is where you came from.'}
    whyd.get({'q': 'Why is the sky blue, yellow, red, black and white?'}).then((ans) => ans);
    // -> {'q': 'Why is the sky blue, yellow, red, black and white?', 'a': 'Because your eyes are painted on the inside.'}
    whya.get('Hello Nanana').then((ans) => ans);
    // -> undefined
    
    whya.delete('Why so serious?').then((ans) => ans);
    // -> 1
    whyd.set({'q': 'Why are you so happy at the end of every month?'}, undefined).then((ans) => ans);
    // -> 1 (set(key, undefined) is same as delete)

    whya.size.then((ans) => ans);
    // -> 2
    // ...
  });
  done();
});
```

[PostgreSQL]: https://www.postgresql.org
[Map]: https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Map
[Promised]: https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise
