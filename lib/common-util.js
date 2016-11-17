'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.deepPropValue = deepPropValue;
exports.checkRequiredOptions = checkRequiredOptions;
// return the value by doing a deeep inspection using the parts array
function deepPropValue(parts, parent) {
  for (var i = 0; i < parts.length && parent; i++) {
    parent = parent[parts[i]];
  }
  return parent;
}

function checkRequiredOptions(keys, options) {
  if (!options) {
    throw new Error('missing options');
  }
  keys.forEach(function (key) {
    if (!options[key]) {
      throw new Error('missing "' + key + '" options value');
    }
  });
}