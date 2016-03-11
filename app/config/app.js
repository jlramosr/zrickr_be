var _ = require("lodash");

var app = {

  fieldsTypes: ['boolean', 'string', 'number', 'integer', 'date', 'image'],

  getNoNativeTypes: function() {
    return _.remove( _.slice(this.fieldsTypes), function (type) {
      return type !== 'boolean' && type !== 'string' && type !== 'number';
    });
  },

  toTrim: function (field) {
    if (typeof(field) === 'string') return field.trim();
    return field;
  }

}


module.exports = app;
