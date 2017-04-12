# Component Factory
[![npm](https://img.shields.io/npm/v/component-factory.svg)](http://npm.im/component-factory)
[![travis](https://travis-ci.org/staydecent/component-factory.svg?branch=master)](https://travis-ci.org/staydecent/component-factory)
[![devDependency Status](https://david-dm.org/staydecent/component-factory/dev-status.svg?style=flat)](https://david-dm.org/staydecent/component-factory#info=devDependencies)

If you use [React](https://github.com/facebook/react), [Preact](https://github.com/developit/preact), or [Inferno](https://github.com/infernojs/inferno), but don't want to use the `class` syntax because you've read articles by [Eric Elliott](https://medium.com/javascript-scene/a-simple-challenge-to-classical-inheritance-fans-e78c2cf5eead#.a3ako7xx9) and others that have lead you to favour object composition over class inheritance, then this utility is for you. 

### Installation

```
$ npm install --save component-factory
```

### Usage

```js
import componentFactory from 'component-factory'

import {Component} from 'preact'
// or
// import {Component} from 'react'
// or
// import Component from 'inferno-component'

const HelloWorld = componentFactory(Component, {
	render(props, state) {
		return (
			<div>
				Hello world!			
			</div>
		)
	}
})

```

### Acknowledgments

Based on [preact-classless-component](https://github.com/laurencedorman/preact-classless-component) by Laurence Dorman.

### License

MIT 
