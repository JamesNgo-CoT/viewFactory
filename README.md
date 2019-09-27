# View Factory

View factories are functions used to generate modified HTML elements to be used as MVC View objects. The generated HTML elements can be assigned dynamic attributes and child elements configurations. The dynamic configurations can react to variables and environments allowing the element to update itself when its new `render` method is called.

## View Factory Element Factory

Core to View Factory, the View Factory Element is used to generate a new (and modified) HTML Element.

``` JavaScript
const element = document.createElement('div');

let counter = 0;
const attributes = {

  // Static
  'id': 'id123',

  // Dynamic
  'data-counter': () => { return counter++; },

  // Async with Promise
  'data-ready': new Promise((resolve) => { resolve(true) })
};

const childElement = document.createElement('div');
childElement.innerHTML = 'testing';
const childElements = [

  // Static
  childElement,

  // Dynamic
  () => {
    const element = document.createElement('div');
    element.innerHTML = counter++;
    return element;
  },

  // Async with Promise
  new Promise((resolve) => {
    const element = document.createElement('div');
    element.innerHTML = counter++;
    resolve(element);
  }),

  // Nesting View Factory Element
  viewFactory.element('span', { 'class': 'test' }, [ 'Text' ], []);
];

const callBacks = [
  (element) => { console.log('DISPLAY ORDER - 2', element); }
];

const htmlElement = viewFactory.element(element, attributes, childElements, callBacks);

htmlElement.promise.then((element) => {
  console.log('DISPLAY ORDER - 3', element);
})

console.log('DISPLAY ORDER - 1', htmlElement);
```