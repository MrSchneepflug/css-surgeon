# css-surgeon

Takes a single HTML document, removes all unused styles within style-tags and minifies the remains.
The initial intent of this library was to satisfy the size limits of CSS within AMP pages.
Therefore no CSS within an `<style amp-boilerplate>`-tag will be touched.

[![Build Status](https://travis-ci.com/MrSchneepflug/css-surgeon.svg?branch=master)](https://travis-ci.com/MrSchneepflug/css-surgeon)
[![Coverage Status](https://coveralls.io/repos/github/MrSchneepflug/css-surgeon/badge.svg?branch=master)](https://coveralls.io/github/MrSchneepflug/css-surgeon?branch=master)
[![Greenkeeper badge](https://badges.greenkeeper.io/MrSchneepflug/css-surgeon.svg)](https://greenkeeper.io/)

## Installation

```sh
yarn add css-surgeon
```

## Usage

Just pass the HTML document to the exposed `operate`-function.
The function returns a promise which resolves with the whole document.

```js
import {operate} from "css-surgeon";

const htmlWithMinifiedCss = await operate("<!doctype html><html>...");
```

## Example

Take this HTML document for example. There are several unused rules and selectors.

```html
<!doctype html>
<html lang="en">
<head>
    <title>single style-tag</title>
    <style>
        .used-class, .unused-partial-class {color:#000000;}
        #used-id, #unused-partial-id {color:#000000;}
        h1, h3 {color:#000000;}

        .unused-class {color:#000000;}
        #unused-id {color:#000000;}
        h2 {color:#000000;}
    </style>
</head>
<body>
    <div class="used-class"></div>
    <div id="used-id"></div>
    <h1>used element</h1>
</body>
</html>
```

The result of the `operate`-function will be:

```html
<!DOCTYPE html><html lang="en"><head>
    <title>single style-tag</title>
    <style>.used-class{color:#000}#used-id{color:#000}h1{color:#000}</style>
</head>
<body>
    <div class="used-class"></div>
    <div id="used-id"></div>
    <h1>used element</h1>


</body></html>
```

> **Note:**
> The strange formatting is the result of `JSDOM.serialize()`.

## Tests

```sh
$ yarn install
$ yarn test
```
