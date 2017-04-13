'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.compose = compose;
exports.withState = withState;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var toType = function toType(val) {
  var str = {}.toString.call(val);
  return str.toLowerCase().slice(8, -1);
};

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

    if (obj._mergeState) {
      // Pass props to _initialValue function to set initialValue for withState
      if (obj._initialValue && obj._initialValue.length === 2) {
        _extends(obj.state, _defineProperty({}, obj._initialValue[0], obj._initialValue[1].apply(null, args)));
        delete obj._initialValue;
      }

      // Bind withState setter and assign state to props
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

/**
 * Set a state value, and a function to update that state value.
 * @param  {[type]} propName      [description]
 * @param  {[type]} setterName    [description]
 * @param  {[type]} initialValue) [description]
 * @return {[type]}               [description]
 */
function withState(propName, setterName, initialValue) {
  var _obj;

  var obj = (_obj = {}, _defineProperty(_obj, setterName, function setter(val) {
    this.setState(_defineProperty({}, propName, val));
  }), _defineProperty(_obj, '_mergeState', setterName), _obj);
  if (toType(initialValue) === 'function') {
    obj._initialValue = [propName, initialValue];
    obj.state = {};
  } else {
    obj.state = _defineProperty({}, propName, initialValue);
  }
  return obj;
}