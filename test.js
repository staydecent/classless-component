import test from 'ava'

// Preact
import {Component, h} from 'preact'
import render from 'preact-render-to-string'

// React
import React from 'react'
import ReactTestRenderer from 'react-test-renderer'

// Inferno
import {Component as InfernoComponent} from 'inferno'
import {createElement as infernoCreateElement} from 'inferno-create-element'
import {renderToString as infernoRenderToString} from 'inferno-server'

// Our library!
import {compose, withState, mapProps, setNodeName} from './dist/classless-component'

const objWithRender = (hyperscript) => ({
  render () {
    return hyperscript('div', null, 'Hello world')
  }
})

test('compose should be a function', (t) => {
  t.is(typeof compose, 'function')
})

test('compose should create a Preact component', (t) => {
  const Test = compose(Component, h, objWithRender(h))
  const output = render(h(Test, {test: 56}))
  t.is(output, '<div>Hello world</div>')
})

test('compose should create a React component', (t) => {
  const Test = compose(React.Component, React.createElement, objWithRender(React.createElement))
  const renderer = ReactTestRenderer.create(React.createElement(Test, {}))
  const output = renderer.toJSON()
  t.is(output.type, 'div')
  t.is(output.children[0], 'Hello world')
})

test('compose should create an Inferno component', (t) => {
  const Test = compose(InfernoComponent, infernoCreateElement, objWithRender(infernoCreateElement))
  const output = infernoRenderToString(infernoCreateElement(Test))
  t.is(output, '<div>Hello world</div>')
})

test('compose should pass state as props to PFC', (t) => {
  const Test = compose(Component, h,
    {state: {stateNum: 2}},
    {render ({stateNum, propNum}) {
      return h('div', null, 'Hello ' + (stateNum * propNum))
    }}
  )
  const output = render(h(Test, {propNum: 4}))
  t.is(output, '<div>Hello 8</div>')
})

test('compose should pass arbitrary functions as props to PFC', (t) => {
  const Test = compose(Component, h, {
    someFunction () {
      return 8
    },
    render ({someFunction}) {
      return h('div', null, 'Hello ' + someFunction())
    }
  })
  const output = render(h(Test))
  t.is(output, '<div>Hello 8</div>')
})

test('withState should set state prop and pass to render', (t) => {
  const Counter = compose(Component, h,
    withState('counter', 'setCounter', 0),
    {render ({counter, setCounter}) {
      setCounter(counter + 1)
      return h('div', null, [
        'Count: ' + counter,
        h('button', {onClick: (t) => setCounter(n => n + 1)}, 'Increment'),
        h('button', {onClick: (t) => setCounter(n => n - 1)}, 'Decrement')
      ])
    }}
  )
  const output = render(h(Counter))
  t.is(output, '<div>Count: 0<button>Increment</button><button>Decrement</button></div>')
})

test('withState should pass props to initialValue function', (t) => {
  const Counter = compose(Component, h,
    withState('counter', 'setCounter', ({counter}) => counter * counter),
    {
      componentWillMount () {
        this.setState({counter: this.state.counter * this.state.counter})
      },
      render ({counter, setCounter}) {
        return h('div', null, [
          'Count: ' + counter,
          h('button', {onClick: (t) => setCounter(n => n + 1)}, 'Increment'),
          h('button', {onClick: (t) => setCounter(n => n - 1)}, 'Decrement')
        ])
      }
    }
  )
  const output = render(h(Counter, {counter: 2}))
  t.is(output, '<div>Count: 16<button>Increment</button><button>Decrement</button></div>')
})

test('withState should work with React', (t) => {
  const Counter = compose(React.Component, React.createElement,
    withState('counter', 'setCounter', ({counter}) => counter),
    {render ({counter, setCounter}) {
      return React.createElement('div', null, ['Count: ' + counter])
    }}
  )
  const renderer = ReactTestRenderer.create(
    React.createElement(Counter, {counter: 5}))
  const output = renderer.toJSON()
  t.is(output.type, 'div')
  t.is(output.children[0], 'Count: 5')
})

test('mapProps should work with Preact', (t) => {
  const List = compose(Component, h,
    mapProps(({nums}) => ({nums: nums.map((n) => n + 1)})),
    {render ({nums}) {
      return h('div', null, [
        'List: ' + (nums && nums.join(', '))
      ])
    }}
  )
  const output = render(h(List, {nums: [1, 2, 3, 4, 5]}))
  t.is(output, '<div>List: 2, 3, 4, 5, 6</div>')
})

test('mapProps should work with React', (t) => {
  const List = compose(React.Component, React.createElement,
    mapProps((props) => ({nums: props.nums ? props.nums.map((n) => n + 1) : []})),
    {render ({nums}) {
      return React.createElement('div', null, [
        'List: ' + (nums && nums.join(', '))
      ])
    }}
  )
  const renderer = ReactTestRenderer.create(
    React.createElement(List, {nums: [1, 2, 3, 4, 5]}))
  const output = renderer.toJSON()
  t.is(output.type, 'div')
  t.is(output.children[0], 'List: 2, 3, 4, 5, 6')
})

test('setNodeName should set nodeName to not be "hoc"', (t) => {
  const List = compose(Component, h,
    setNodeName('CoolComponent'),
    {render () {
      return h('div', null, ['Cool!'])
    }}
  )
  const comp = h(List, {nums: [1, 2, 3, 4, 5]})
  t.is(comp.nodeName.name, 'CoolComponent')
})
