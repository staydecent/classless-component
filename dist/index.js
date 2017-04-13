'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.withState = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.compose = compose;

var _checkArgTypes = require('check-arg-types');

var _checkArgTypes2 = _interopRequireDefault(_checkArgTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var toType = _checkArgTypes2.default.prototype.toType;

/**
 * Create a class-based Component out of object literals
 * @param  {function} Component React, Preact, Inferno Component creator
 * @param  {object}   objs      object-literals containing lifecycle methods etc.
 * @return {Component}          The final Component to render
 */
function compose() {
  var args = Array.prototype.slice.call(arguments);
  var Component = args[0];
  var objs = args.slice(1).map(function (obj) {
    return toType(obj) === 'function' ? _defineProperty({}, obj.name, obj) : obj;
  });
  var obj = Object.assign.apply(Object, [{}].concat(objs));

  function classlessComponent() {
    var args = Array.prototype.slice.call(arguments);
    if (obj._mergeState && obj.state) {
      var setter = obj[obj._mergeState].bind(this);
      args[0] = _extends(args[0], obj.state, _defineProperty({}, obj._mergeState, setter));
      delete obj._mergeState;
    }

    Component.apply(this, args);

    for (var i in obj) {
      if (i !== 'render' && typeof obj[i] === 'function') {
        this[i] = obj[i].bind(this);
      }
    }

    if (obj.init) {
      obj.init.call(this);
    }
  }

  classlessComponent.prototype = _extends(Object.create(Component.prototype), obj);

  classlessComponent.prototype.constructor = classlessComponent;

  return classlessComponent;
}

exports.default = compose;

/**
 * Set a state value, and a function to update that state value.
 * @param  {[type]} propName      [description]
 * @param  {[type]} setterName    [description]
 * @param  {[type]} initialValue) [description]
 * @return {[type]}               [description]
 */

var withState = exports.withState = function withState(propName, setterName, initialValue) {
  var _ref2;

  return _ref2 = {
    state: _defineProperty({}, propName, initialValue)
  }, _defineProperty(_ref2, setterName, function setter(val) {
    this.setState(_defineProperty({}, propName, val));
  }), _defineProperty(_ref2, '_mergeState', setterName), _ref2;
};