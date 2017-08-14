var $ = function(db, tab, key, val) {
	this.db = db;
	this.tab = tab || 'MAP';
	this.key = key || 'key';
	this.val = val || 'val';
	this.db.query(`CREATE TABLE IF NOT EXISTS "${this.tab}"("${this.key}" TEXT PRIMARY KEY, "${this.val}" TEXT)`;
};
module.exports = $;


var _ = $.prototype;


Object.defineProperty(_, 'size', {'get': function() {
	return this.db.query(
		`SELECT COUNT(*) AS n FROM ${this.tab};`
	).then((ans) => parseInt(ans.rows[0].n));
}});


_.has = function(k) {
	return this.db.query(
		`SELECT "${this.key}" FROM "${this.tab}" `+
		`WHERE "${this.key}"=$1;`, [k]
	).then((ans) => ans.rowCount===1);
};


_.get = function(k) {
	return this.db.query(
		`SELECT "${this.val}" AS v FROM "${this.tab}" `+
		`WHERE "${this.key}"=$1;`, [k]
	).then((ans) => ans.rowCount? ans.rows[0].v : undefined);
};


_.set = function(k, v) {
	return this.db.query(
		`INSERT INTO "${this.tab}" ("${this.key}", "${this.val}") `+
		`VALUES ($1, $2) ON CONFLICT ("${this.key}") `+
		`DO UPDATE SET "${this.val}"=$2;`, [k, v]
	).then((ans) => ans.rowCount);
};


_.delete = function(k) {
	return this.db.query(
		`DELETE FROM "${this.tab}" `+
		`WHERE "${this.key}"=$1;`, [k]
	).then((ans) => ans.rowCount);
};


_.clear = function() {
	return this.db.query(
		`DELETE FROM "${this.tab}";`
	).then((ans) => ans.rowCount);
};


_.valueOf = function() {
	return this.db.query(
		`SELECT "${this.key}" AS k, "${this.val}" AS v FROM "${this.tab}";`
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
	return this.db.query(
		`SELECT "${this.key}" AS k, "${this.val}" AS v FROM "${this.tab}"`
	).then((ans) => {
		for(var i=0, I=ans.rowCount; i<I; i++)
			fn.call(thisArg, ans.rows[i].v, ans.rows[i].k);
		return ans.rowCount;
	});
};
