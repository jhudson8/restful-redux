"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.deepPropValue = deepPropValue;
// return the value by doing a deeep inspection using the parts array
function deepPropValue(parts, parent) {
  for (var i = 0; i < parts.length && parent; i++) {
    parent = parent[parts[i]];
  }
  return parent;
}