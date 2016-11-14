'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.reduxEffectsActionCreator = exports.modelProvider = exports.reducer = exports.Model = undefined;

var _model = require('./model');

var _model2 = _interopRequireDefault(_model);

var _modelReducer = require('./model-reducer');

var _modelReducer2 = _interopRequireDefault(_modelReducer);

var _modelProvider = require('./model-provider');

var _modelProvider2 = _interopRequireDefault(_modelProvider);

var _reduxEffects = require('./action-creator/redux-effects');

var _reduxEffects2 = _interopRequireDefault(_reduxEffects);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.Model = _model2.default;
exports.reducer = _modelReducer2.default;
exports.modelProvider = _modelProvider2.default;
exports.reduxEffectsActionCreator = _reduxEffects2.default;