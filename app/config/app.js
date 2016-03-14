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
  },

  startsWithVowel: function (string) {
    if (_.startsWith(string, 'a') ||
        _.startsWith(string, 'e') ||
        _.startsWith(string, 'i') ||
        _.startsWith(string, 'o') ||
        _.startsWith(string, 'u'))
      return true;
    return false;
  },

  isValidDate: function(value) {
    var date = new Date(value);
    if (typeof(value) === "boolean" || typeof(value) === "number") return false;
    if ( Object.prototype.toString.call(date) === "[object Date]" )
      if ( ! isNaN(date.getTime()) ) return date;
    return false
  },

  isCorrectType: function (type, value) {
    if (type !== typeof(value)) {
      if (_.includes(this.getNoNativeTypes(), type)) {
        //No native types
        if (type === "date") {
          var date = this.isValidDate(value);
          if (!date) return {ok: false};
          return {ok: true, newValue: date};
        }

        if (type === "integer" && !_.isInteger(value)) {
          return {ok: false};
        }

        if (type === "image") {
          //TODO:check image types
          return {ok: true, newValue: value};
        }

        return {ok: true, newValue: value};
      }
      //Not recognize the indicated type
      return {ok: false};
    }
    return {ok: true, newValue: value};
  }

}


module.exports = app;
