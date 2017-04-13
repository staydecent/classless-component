# Classless Component
[![travis](https://travis-ci.org/staydecent/classless-component.svg?branch=master)](https://travis-ci.org/staydecent/classless-component)
[![devDependency Status](https://david-dm.org/staydecent/classless-component/dev-status.svg?style=flat)](https://david-dm.org/staydecent/classless-component#info=devDependencies)

If you use [React](https://github.com/facebook/react), [Preact](https://github.com/developit/preact), or [Inferno](https://github.com/infernojs/inferno), but don't want to use the `class` syntax because you've read articles by [Eric Elliott](https://medium.com/javascript-scene/a-simple-challenge-to-classical-inheritance-fans-e78c2cf5eead#.a3ako7xx9) and others that have lead you to favour object composition over class inheritance, then this utility is for you. 

### Installation

```
$ npm install --save classless-component
```

### Usage

```js
import {compose} from 'classless-component'

import {Component} from 'preact'
// or
// import {Component} from 'react'
// or
// import Component from 'inferno-component'

const HelloWorld = compose(Component, {
	render(props, state) {
		return (
			<div>Hello world!</div>
		)
	}
})
```

Also included at this time, are two functions inspired by [recompose](https://github.com/acdlite/recompose)

```js
import {compose, withState, mapProps} from 'classless-component'
import {Component} from 'preact'

const Counter = compose(Component,
	// The withState function will create an object literal to pass to `compose`
	// As well as pass the state value of 'counter' and the setter function 'setCounter' to the props object
	withState('counter', 'setCounter', 0),
	
	// passing a named function will result in an object literal like: `{render: render}`
	function render ({counter, setCounter}) {
		return h('div', null, [
			'Count: ' + counter,
			h('button', {onClick: () => setCounter(n => n + 1)}, 'Increment'),
			h('button', {onClick: () => setCounter(n => n - 1)}, 'Decrement')
		])
	}
)
```

For working examples, see `test.js`.

### Acknowledgments

Based on [preact-classless-component](https://github.com/laurencedorman/preact-classless-component) by Laurence Dorman.

### License

MIT 
