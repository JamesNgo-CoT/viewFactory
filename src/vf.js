/* global viewFactory */

window.viewFactory = window.viewFactory = {};

viewFactory.element = function (element, attributes, childElements, callBacks) {
  if (typeof element === 'string') {
    element = document.createElement(element);
  }

  if (element.hasAttributes()) {
    for (let index = 0, length = element.attributes.length; index < length; index++) {
      const { name, value } = element.attributes[index];

      if (typeof attributes === 'object' && attributes !== null) {
        attributes = Object.assign({}, attributes);
      } else {
        if (attributes == null) {
          attributes = {};
        } else {
          attributes = {
            'original attributes': attributes
          };
        }
      }

      attributes[name] = value;
    }
  }

  if (element.firstChild) {
    const tempChildElements = [];
    for (let index = 0, length = element.childNodes.length; index < length; index++) {
      tempChildElements.push(element.childNodes[index]);
    }

    if (tempChildElements.length > 0) {
      if (Array.isArray(childElements)) {
        childElements = childElements.slice();
      } else {
        if (childElements == null) {
          childElements = [];
        } else {
          childElements = [childElements];
        }
      }

      childElements.unshift(...tempChildElements);
    }
  }

  if (!element.hasViewFactoryElementPropertyDescriptors) {
    Object.defineProperties(element, viewFactory.element.propertyDescriptors);
  }

  return element
    .setAttributes(attributes)
    .setChildElements(childElements)
    .render(callBacks, true);
};

viewFactory.element.propertyDescriptors = {
  hasViewFactoryElementPropertyDescriptors: {
    value: true
  },

  _attributes: {
    writable: true
  },

  setAttributes: {
    value(attributes) {
      this._attributes = attributes;
      return this;
    }
  },

  _childElements: {
    writable: true
  },

  setChildElements: {
    value(childElements) {
      this._childElements = childElements;
      return this;
    }
  },

  promise: {
    writable: true
  },

  render: {
    value(callBacks, calledFromFactory = false) {
      if (this.hasAttributes()) {
        const attributeKeys = [];
        for (let index = 0, length = this.attributes.length; index < length; index++) {
          attributeKeys.push(this.attributes[index].name);
        }
        attributeKeys.forEach((key) => {
          this.removeAttribute(key);
        });
      }

      console.log(this, this.firstChild);
      while (this.firstChild) {
        console.log(this.firstChild);
        this.removeChild(this.firstChild);
      }

      const renderAttribute = (key, value) => {
        if (typeof value === 'object') {
          return renderAttributes(value);
        } else if (typeof value === 'function') {
          return renderAttribute(key, value(this));
        } else if (value instanceof Promise) {
          return value.then((finalAttribute) => { return renderAttribute(finalAttribute); });
        } else if (value != null) {
          this.setAttribute(key, value);
        }
      };

      const renderAttributes = (attributes) => {
        if (typeof attributes === 'function') {
          return renderAttributes(attributes(this));
        } else if (attributes instanceof Promise) {
          return attributes.then((finalAttributes) => { return renderAttributes(finalAttributes); });
        } else if (typeof attributes === 'object' && attributes != null) {
          return Promise.all(Object.keys(attributes).map((key) => renderAttribute(key, attributes[key])));
        }
      };

      const renderChildElement = (childElement, placeHolder) => {
        placeHolder = placeHolder || this.appendChild(document.createElement('span'));

        if (Array.isArray(childElement)) {
          placeHolder.parentNode.removeChild(placeHolder);
          return renderChildElements(childElement);
        } else if (typeof childElement === 'function') {
          return renderChildElement(childElement(this), placeHolder);
        } else if (childElement instanceof Promise) {
          return childElement.then((finalChildElement) => { return renderChildElement(finalChildElement, placeHolder); });
        }

        let returnValue;

        if (childElement instanceof HTMLElement || childElement instanceof Text) {
          placeHolder.parentNode.insertBefore(childElement, placeHolder)
          if (childElement.hasViewFactoryElementPropertyDescriptors) {
            returnValue = childElement.promise;
          }
        } else {
          const tempElement = document.createElement('div');
          tempElement.innerHTML = childElement;
          while (tempElement.firstChild) {
            placeHolder.parentNode.insertBefore(tempElement.firstChild, placeHolder);
          }
        }

        placeHolder.parentNode.removeChild(placeHolder);
        return returnValue;
      };

      const renderChildElements = (childElements) => {
        if (typeof childElements === 'function') {
          return renderChildElements(childElements(this));
        } else if (childElements instanceof Promise) {
          return childElements.then((finalChildElements) => { return renderChildElements(finalChildElements); });
        } else if (childElements instanceof HTMLElement) {
          return renderChildElement(childElements);
        } else if (Array.isArray(childElements)) {
          return Promise.all(childElements.map((childElement) => { return renderChildElement(childElement); }));
        } else {
          return renderChildElements([childElements]);
        }
      };

      this.promise = Promise.all([renderAttributes(this._attributes), renderChildElements(this._childElements)])
        .then(() => {
          const promises = [];
          if (!calledFromFactory && this._childElements && Array.isArray(this._childElements)) {
            this._childElements.forEach((childElement) => {
              if (childElement.hasViewFactoryElementPropertyDescriptors) {
                promises.push(childElement.render().promise);
              }
            });
          }
          return Promise.all(promises);
        })
        .then(() => {
          if (callBacks) {
            callBacks = Array.isArray(callBacks) ? callBacks : [callBacks];
            return Promise.all(callBacks.map((callBack) => { return callBack(this); }));
          }
        })
        .then(() => {
          return this;
        });

      return this;
    }
  }
};

const vf = viewFactory;
vf.e = vf.element;

['a', 'abbr', 'acronym', 'address', 'applet', 'area', 'article', 'aside', 'audio', 'b', 'base', 'basefont', 'bdi', 'bdo', 'big', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'center', 'cite', 'code', 'col', 'colgroup', 'datalist', 'dd', 'del', 'details', 'dfn', 'dialog', 'dir', 'div', 'dl', 'dt', 'em', 'embed', 'fieldset', 'figcaption', 'figure', 'font', 'footer', 'form', 'frame', 'frameset', 'h1-h2-h3-h4', 'head', 'header', 'hr', 'html', 'i', 'iframe', 'img', 'input', 'ins', 'kbd', 'keygen', 'label', 'legend', 'li', 'link', 'main', 'map', 'mark', 'menu', 'menuitem', 'meta', 'meter', 'nav', 'noframes', 'noscript', 'object', 'ol', 'optgroup', 'option', 'output', 'p', 'param', 'picture', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'script', 'section', 'select', 'small', 'source', 'span', 'strike', 'strong', 'style', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track', 'tt', 'u', 'ul', 'var', 'video', 'wbr']
  .forEach((element) => {
    vf[element] = (attributes, childElements, callBacks) => { return vf.e(element, attributes, childElements, callBacks) }
  });