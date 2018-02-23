// allow multiple reducers to be joined together
export default function(reducers) {
  return function (state, action) {
    for (var i = 0; i < reducers.length; i ++) {
      state = reducers[i](state, action);
    }
    return state;
  };
}
