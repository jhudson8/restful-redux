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
