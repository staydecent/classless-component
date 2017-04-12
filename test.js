/* globals describe it */

// Preact
import {Component, h} from 'preact'
import render from 'preact-render-to-string'

// React
import React from 'react'
import ReactShallowRenderer from 'react-test-renderer/shallow'

// Our library!
import createComponent from './index.js'

// Assertion library
import chai from 'chai'
const expect = chai.expect

const objWithRender = (hyperscript) => ({
  render () {
    return hyperscript('div', null, 'Hello world')
  }
})

describe('createComponent', () => {
  it('Should be a function', () => {
    expect(createComponent).to.be.a('function')
  })

  it('Should create a Preact component', () => {
    const Test = createComponent(Component, objWithRender(h))
    const output = render(h(Test))
    expect(output).to.equal('<div>Hello world</div>')
  })

  it('Should create a React component', () => {
    const Test = createComponent(React.Component, objWithRender(React.createElement))

    const shallowRenderer = new ReactShallowRenderer()
    shallowRenderer.render(React.createElement(Test))

    const output = shallowRenderer.getRenderOutput()
    expect(output.type).to.equal('div')
    expect(output.props.children).to.equal('Hello world')
  })
})
