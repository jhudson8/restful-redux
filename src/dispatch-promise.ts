/**
 * Monkey patch the store.promise function to see if the action has a `promise` attribute and, if so,
 * override the standard return value of dispatch with the promise provided by the action.
 */
export default function (store) {
  const _dispatch = store.dispatch;
  store.dispatch = function (action) {
    const rtn = _dispatch.call(store, action);
    if (action.promise) {
      return action.promise;
    }
    return rtn;
  };
}
