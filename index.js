const toType = function (val) {
  var str = ({}).toString.call(val)
  return str.toLowerCase().slice(8, -1)
}

/**
 * Create a class-based Component out of object literals
 * @param  {Function} Component   React, Preact, Inferno Component creator
 * @param  {Function} hyperscript React, Preact, Inferno element/vnode creator
 * @param  {Object}   objs        object-literals containing lifecycle methods etc.
 * @return {Component}            The final Component to render
 */
export function compose () {
  const args = Array.prototype.slice.call(arguments)
  const Component = args[0]
  const h = args[1]

  if (toType(Component) !== 'function' || toType(h) !== 'function') {
    throw new Error('compose expects to be called like, `compose(Component, createElement, [{}, {}, ...]`')
  }

  // Allow partial appliction for reuse, ex:
  // `const preactCompose = compose(Component, h)`
  // `preactCompose(withState(..), {}, ...)`
  if (args.length <= 2) {
    return compose.bind(null, Component, h)
  }

  const objs = args.slice(2).map((obj) =>
    toType(obj) === 'function' ? {[obj.name]: obj} : obj
  )
  const obj = Object.assign.apply(Object, [{}].concat(objs))
  const userRender = obj.render.bind(null)
  const pfc = function (props) {
    let newProps = Object.assign({}, props)

    // handle mapProps
    if (obj._mapProps) {
      Object.assign(newProps, obj._mapProps.call(this, props))
      delete obj._mapProps
    }

    // handle withState
    if (obj._mergeState) {
      // Pass props to _initialValue function to set initialValue for withState
      if (obj._initialValue && obj._initialValue.length === 2) {
        Object.assign(obj.state, {[obj._initialValue[0]]: obj._initialValue[1].call(null, newProps)})
        delete obj._initialValue
      }

      // Bind withState setter and assign state to props
      const setter = obj[obj._mergeState].bind(this)
      Object.assign(newProps, obj.state, {[obj._mergeState]: setter})
      delete obj._mergeState
    }

    const node = userRender(newProps)
    return node
  }

  obj.render = function () {
    return h(pfc, this.props)
  }

  // Create a HoC class, avoiding class syntax
  function hoc () {
    Component.apply(this, arguments)

    // auto-bind methods to the component
    for (let i in obj) {
      if (i !== 'render' && toType(obj[i]) === 'function') {
        this[i] = obj[i].bind(this)
      }
    }

    if (obj.init) {
      obj.init.call(this)
    }
  }

  hoc.prototype = Object.assign(
    Object.create(Component.prototype), obj
  )

  hoc.prototype.constructor = hoc

  return hoc
}

/**
 * Set a state value, and a function to update that state value.
 * @param  {[type]} propName      [description]
 * @param  {[type]} setterName    [description]
 * @param  {[type]} initialValue) [description]
 * @return {[type]}               [description]
 */
export function withState (propName, setterName, initialValue) {
  const obj = {
    [setterName]: function setter (val) {
      this.setState({[propName]: val})
    },
    _mergeState: setterName
  }
  if (toType(initialValue) === 'function') {
    obj._initialValue = [propName, initialValue]
    obj.state = {}
  } else {
    obj.state = {[propName]: initialValue}
  }
  return obj
}

/**
 * Pass props to function, that returns new props
 * @param  {Function} fn (ownerProps: Object) => Object
 * @return {Object}
 */
export function mapProps (fn) {
  return {_mapProps: fn}
}
