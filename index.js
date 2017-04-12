export default function (Component, obj) {
  function componentFactory () {
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

  componentFactory.prototype = Object.assign(
    Object.create(Component.prototype), obj
  )

  componentFactory.prototype.constructor = componentFactory

  return componentFactory
}
