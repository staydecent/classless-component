'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.compose = compose;
exports.withState = withState;
exports.mapProps = mapProps;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var toType = function toType(val) {
  var str = {}.toString.call(val);
  return str.toLowerCase().slice(8, -1);
};

/**
 * Create a class-based Component out of object literals
 * @param  {Function} Component   React, Preact, Inferno Component creator
 * @param  {Function} hyperscript React, Preact, Inferno element/vnode creator
 * @param  {Object}   objs        object-literals containing lifecycle methods etc.
 * @return {Component}            The final Component to render
 */
function compose() {
  var args = Array.prototype.slice.call(arguments);
  var Component = args[0];
  var h = args[1];

  if (toType(Component) !== 'function' || toType(h) !== 'function') {
    throw new Error('compose expects to be called like, `compose(Component, createElement, [{}, {}, ...]`');
  }

  // Allow partial appliction for reuse, ex:
  // `const preactCompose = compose(Component, h)`
  // `preactCompose(withState(..), {}, ...)`
  if (args.length <= 2) {
    return compose.bind(null, Component, h);
  }

  var objs = args.slice(2).map(function (obj) {
    return toType(obj) === 'function' ? _defineProperty({}, obj.name, obj) : obj;
  });
  var obj = Object.assign.apply(Object, [{}].concat(objs));
  var userRender = obj.render.bind(null);
  var pfc = function pfc(props) {
    return userRender(props);
  };

  obj.render = function () {
    var props = _arbitraryFuncs.call(this, this.props);

    // handle mapProps
    if (obj._mapProps) {
      _extends(props, obj._mapProps.call(this, props));
      delete props._mapProps;
    }

    // handle withState
    if (obj._mergeState) {
      // Pass props to _initialValue function to set initialValue for withState
      if (obj._initialValue && obj._initialValue.length === 2) {
        _extends(obj.state, _defineProperty({}, obj._initialValue[0], obj._initialValue[1].call(null, props)));
        delete props._initialValue;
      }

      // Bind withState setter
      var setter = obj[obj._mergeState].bind(this);
      _extends(obj.state, _defineProperty({}, obj._mergeState, setter));
      delete props._mergeState;
    }

    // Always pass the state of the hoc to the pfc as props
    _extends(props, obj.state);

    return h(pfc, props);
  };

  // Create a HoC class, avoiding class syntax
  function hoc() {
    Component.apply(this, arguments);

    // auto-bind methods to the component
    for (var i in obj) {
      if (i !== 'render' && toType(obj[i]) === 'function') {
        this[i] = obj[i].bind(this);
      }
    }

    if (obj.init) {
      obj.init.call(this);
    }
  }

  hoc.prototype = _extends(Object.create(Component.prototype), obj);

  hoc.prototype.constructor = hoc;

  return hoc;
}

function _arbitraryFuncs(props) {
  var newProps = _extends({}, props);
  var ignore = ['componentWillMount', 'componentDidMount', 'componentWillUnmount', 'componentDidUnmount', 'componentWillReceiveProps', 'shouldComponentUpdate', 'componentWillUpdate', 'componentDidUpdate'];
  var keys = Object.keys(this);
  for (var x = 0; x < keys.length; x++) {
    if (toType(this[keys[x]]) === 'function' && ignore.indexOf(keys[x]) === -1) {
      newProps[keys[x]] = this[keys[x]];
    }
  }
  return newProps;
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

/**
 * Pass props to function, that returns new props
 * @param  {Function} fn (ownerProps: Object) => Object
 * @return {Object}
 */
function mapProps(fn) {
  return { _mapProps: fn };
}