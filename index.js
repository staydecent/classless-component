import check from 'check-arg-types'

const toType = check.prototype.toType

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
    if (obj._mergeState && obj.state) {
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

export default compose

/**
 * Set a state value, and a function to update that state value.
 * @param  {[type]} propName      [description]
 * @param  {[type]} setterName    [description]
 * @param  {[type]} initialValue) [description]
 * @return {[type]}               [description]
 */
export const withState = (propName, setterName, initialValue) => ({
  state: {[propName]: initialValue},
  [setterName]: function setter (val) {
    this.setState({[propName]: val})
  },
  _mergeState: setterName
})
