"use strict";
exports.__esModule = true;
// allow multiple reducers to be joined together
function default_1(reducers) {
    return function (state, action) {
        for (var i = 0; i < reducers.length; i++) {
            state = reducers[i](state, action);
        }
        return state;
    };
}
exports["default"] = default_1;
