// return the value by doing a deeep inspection using the parts array
export function deepPropValue (parts: Array<string>, parent: any) {
  for (let i = 0; i < parts.length && parent; i++) {
    parent = parent[parts[i]];
  }
  return parent;
}

export function checkRequiredOptions (keys: Array<string>, options: any): void {
  if (!options) {
    throw new Error('missing options');
  }
  keys.forEach(function (key) {
    if (typeof options[key] === 'undefined') {
      throw new Error('missing "' + key + '" options value');
    }
  });
}

export function logger (prefix: string): any {
  const pre = [prefix];
  return function (): void {
    /* eslint-disable no-console */
    console.log.apply(console, pre.concat.apply(pre, arguments));
    /* eslint-enable no-console */
  };
}
