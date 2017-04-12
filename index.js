export default function (Component, obj) {
  function classlessComponent () {
    Component.apply(this, arguments)

    // auto-bind methods to the component
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
