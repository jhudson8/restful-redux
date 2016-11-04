// return the value by doing a deeep inspection using the parts array
export function deepPropValue (parts, parent) {
  for (let i = 0; i < parts.length && parent; i++) {
    parent = parent[parts[i]];
  }
  return parent;
}
