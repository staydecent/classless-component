const toType = function (val) {
  var str = ({}).toString.call(val)
  return str.toLowerCase().slice(8, -1)
}

/**
 * Create a class-based Component out of object literals
 * @param  {function} Component React, Preact, Inferno Component creator
 * @param  {object}   objs      object-literals containing lifecycle methods etc.
 * @return {Component}          The final Component to render
 */
export function compose () {
  const args = Array.prototype.slice.call(arguments)
  const Component = args[0]
  const objs = args.slice(1).map((obj) =>
    toType(obj) === 'function' ? {[obj.name]: obj} : obj
  )
  const obj = Object.assign.apply(Object, [{}].concat(objs))

  function classlessComponent () {
    const args = Array.prototype.slice.call(arguments)

    // Return new props, instead if requiring R.pipe or similar
    if (obj._mapProps) {
      const newProps = obj._mapProps.apply(this, args)
      args[0] = Object.assign(args[0], newProps)
      delete obj._mapProps
    }

    if (obj._mergeState) {
      // Pass props to _initialValue function to set initialValue for withState
      if (obj._initialValue && obj._initialValue.length === 2) {
        Object.assign(obj.state, {[obj._initialValue[0]]: obj._initialValue[1].apply(null, args)})
        delete obj._initialValue
      }

      // Bind withState setter and assign state to props
      const setter = obj[obj._mergeState].bind(this)
      args[0] = Object.assign(args[0], obj.state, {[obj._mergeState]: setter})
      delete obj._mergeState
    }

    Component.apply(this, args)

    for (let i in obj) {
      if (i !== 'render' && typeof obj[i] === 'function') {
        this[i] = obj[i].bind(this)
      }
    }

    if (obj.init) {
      obj.init.call(this)
    }
  }

  classlessComponent.prototype = Object.assign(
    Object.create(Component.prototype), obj
  )

  classlessComponent.prototype.constructor = classlessComponent

  return classlessComponent
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
