/*
 * Copyright (c) 2015 Dickson Tam
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 *
 */
 (function(factory) {
  if (typeof module !== 'undefined' && module && module.exports) { // Node.js & CommonJS
    module.exports = function(window, property) {
      return factory(window,property);
    }
  } else if (typeof define === 'function' && define.amd) { // Require.js & AMD
    define('velm', [], function(jquery, afnum) {
      return factory(window);
    });
  } else { // Browser
    factory(window);
  }
})(function(window, property) {
  var property = property || 'bind';
  var rclass = /^[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*$/;
  var rattrib = /^[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*$/;
  var document = window.document;

  function truthy(str) {
    if (str == null) return false;

    var str = str.trim().toLowerCase();
    return str != 'no' && str != 'false' && str != '0';
  }

  function checkClassName(className) {

    if (className == null) {
      var fname = arguments.callee.caller.name;
      throw new Error('className parameter required in ' + fname + ' call.');
    } else if (typeof className != "string") {
      throw new Error('className parameter is not a string.');
    } else if (className.length == 0) {
      throw new Error('className parameter is an empty string.');
    } else if (!className.match(rclass)){
      throw new Error('className parameter is not valid class name.');
    }
  }

  function checkAttributeName(attribute) {
    var fname = arguments.callee.caller.name;

    if (attribute == null) {
      throw new Error('Attribute name required in ' + fname + ' call.');
    } else if (typeof attribute != "string") {
      throw new Error('Attribute parameter is not a string.');
    } else if (attribute.length == 0) {
      throw new Error('Attribute parameter is an empty string.');
    } else if (attribute.match(rattrib)){
      throw new Error('Attribute parameter is not valid attribute name.');
    }
  }

  function regExp(className) {
    return new RegExp('(^|\\s+)' + className + '(?=($|\\s+))');
  }


  function hasClass(el, className) {
    if (el.classList) {
      return el.classList.contains(className);
    } else if (el.className) {
      return !!~el.className.search(regExp(className));
    } else {
      throw new Error('Element ' + el + ' does not have classList or className properties.');
    }
  }

  function addClass(el, className) {
    if (hasClass(el, className)) return;

    if (el.classList) {
      el.classList.add(className);
    } else if (el.className) {
      el.className = el.className + ((el.className.trim().length > 0)? " " :"") + className;
    } else {
      throw new Error('Element ' + el + ' does not have classList or className properties.');
    }
  }

  function removeClass(el, className) {
    if (!hasClass(el, className)) return;

    if (el.classList) {
      el.classList.remove(className);
    } else if (el.className) {
      el.className = el.className.trim().replace(regExp(className), '');
    } else {
      throw new Error('Element ' + el + ' does not have classList or className properties.');
    }
  }

  function classList(el, arr) {
    if (arr && el.classList) { /*  New Setter */
      var last = el.classList.length - 1;
      for (var i=last; i >= 0; i--) {
        el.classList.remove(el.classList[i]);
      }

      for (var i=0; i < arr.length; i++) {
        el.classList.add(arr[i]);
      }

    } else if (arr && el.className) { /*  Old Setter */
        el.className = arr.join(' ');
    } else if (el.classList) { /* New Getter */
        return Array.prototype.slice.call(el.classList);
    } else if (el.className) { /* Old Getter */
        return el.className.split(/\s/);
    } else {
      throw new Error('Element ' + el + ' does not have classList or className properties.');
    }
  }

  function attachBindToElementPrototype(element, property) {

    Object.defineProperty(element.prototype, property, { get: getBind, enumerable: true});

    function getBind() {

      var opts = [];

      function addOptions() {
        var args = Array.prototype.slice.call(arguments);
        opts = opts.concat(args);

        return { to: createBinding.bind(this) };
      }

      function createBinding(obj, prop) {
        var el = this;
        var getter, setter;

        if (!(el instanceof HTMLElement)) {
          throw new Error('Element ' + el + ' is not a HTMLElement');
        }

/*
        if (obj.hasOwnProperty(prop)) {
          throw new Error('Object ' + obj + ' already has property ' + prop);
        }
*/

        switch (opts[0]) {
          case 'text':
            getter = function() {
              return el.textContent || el.innerText;
            };
            setter = function(text) {
              el.innerText = text;
            };
            break;
          case 'html':
            getter = function() {
              return el.innerHTML;
            };
            setter = function(html) {
              el.innerHTML = html;
            }
            break;
          case 'classList':
            getter = function() {
              return classList(el);
            }
            setter = function(arr) {
              classList(el, arr);
            }
            break;
          case 'hasClass':
            getter = function() {
              return hasClass(el, opts[1]);
            };
            setter = function(boolean) {
              if (boolean) {
                addClass(el, opts[1]);
              } else {
                removeClass(el, opts[1]);
              }

            }
            break;
          case 'noClass':
            getter = function() {
              return !hasClass(el, opts[1]);
            };
            setter = function(boolean) {
              if (!boolean) {
                addClass(el, opts[1]);
              } else {
                removeClass(el, opts[1]);
              }
            }
            break;
          case 'attr':
            getter = function() {
              return el.getAttribute(opts[1]);
            };
            setter = function(val) {
              el.setAttribute(opts[1], Object(val).toString());
            };
            break;
          case 'hasTruthyAttr':
            getter = function() {
              return truthy(el.getAttribute(opts[1]));
            };
            setter = function(val) {
              if (val == null) {
                el.removeAttribute(opts[1]);
              } else {
                el.setAttribute(opts[1], Object(val).toString());
              }
            };
            break;
          case 'noTruthyAttr':
            getter = function() {
              return !truthy(el.getAttribute(opts[1]));
            };
            setter = function(boolean) {
              var val = !boolean? 'true' : 'false';
              el.setAttribute(opts[1], val);
            };
            break;
          case 'textValue':
            getter = function() {
              return el.value;
            };
            setter = function(text) {
              el.value = text;
            };
            break;
          case 'selectValue':
            getter = function() {
              return el.value;
            };
            setter = function(text) {

              el.value = text;
            };
            break;
          case 'groupValue':
            getter = function() {
              var name = el.name;
              var group = document.getElementsByName(name);

              for (var i=0; i < group.length; i++) {
                var elradio = group[i];

                if (!(elradio instanceof HTMLInputElement)) continue;
                if (!(elradio.type == 'radio')) continue;

                if (elradio.checked) {
                  return elradio.value;
                }
              }

              return null;
            }
            setter = function(value) {
              var name = el.name;
              var group = document.getElementsByName(name);
              var found = false;

              for (var i=0; i < group.length; i++) {
                var elradio = group[i];

                if (!(elradio instanceof HTMLInputElement)) continue;
                if (!(elradio.type == 'radio')) continue;

                if (elradio.value == value) {
                  elradio.checked = true;
                  found = true;
                } else {
                  elradio.checked = false;
                }
              }

              if (value != null && !found)
                throw new Error('Failed to set value ' + ((typeof(value) == 'string')? "'" + value + "'" : value) + ' for radio group ' + name);
            }
            break;
          case 'checked':
            getter = function() {
              return el.checked;
            }
            setter = function(boolean) {
              el.checked = boolean;
            }
            break;
          default:
            getter = function() {
              throw new Error('Option ' + opts[0] + ' does not exist');
            }
            setter = function() {
              throw new Error('Option ' + opts[0] + ' does not exist');
            }
        }

        Object.defineProperty(obj, prop, {
          get: getter,
          set: setter,
          enumerable: true,
          configurable: true
        });
      }

      var el = this;
      var bind = {
        hasClass: function(className) {
          checkClassName(className);
          return (addOptions.bind(el, 'hasClass'))(className);
        },
        noClass: function(className) {
          checkClassName(className);
          return (addOptions.bind(el, 'noClass'))(className);
        },
        attr: function(attr) {
          checkAttributeName(attr);
          return (addOptions.bind(el, 'attr'))(attr);
        },
        hasTruthyAttr: function(attr) {
          checkAttributeName(attr);
          return (addOptions.bind(el, 'hasTruthyAttr'))(attr);
        },
        noTruthyAttr: function(attr) {
          checkAttributeName(attr);
          return (addOptions.bind(el, 'noTruthyAttr'))(attr);
        }
      };

      Object.defineProperty(bind, 'classList', {
        get: addOptions.bind(el, 'classList'),
        enumerable: true
      });

      Object.defineProperty(bind, 'text', {
        get: addOptions.bind(el, 'text'),
        enumerable: true
      })

      Object.defineProperty(bind, 'html', {
        get: addOptions.bind(el, 'html'),
        enumerable: true
      })

      if (element == HTMLSelectElement) {
        Object.defineProperty(bind, 'selectValue', {
          get: addOptions.bind(el, 'selectValue'),
          enumerable: true
        })
      } else if (element == HTMLInputElement) {
        switch (el.type) {
          case 'password':
          case 'text':
            Object.defineProperty(bind, 'textValue', {
              get: addOptions.bind(el, 'textValue'),
              enumerable: true
            });
            break;
          case 'radio':
            Object.defineProperty(bind, 'groupValue', {
              get: addOptions.bind(el, 'groupValue'),
              enumerable: true
            });
            break;
          case 'checkbox':
            Object.defineProperty(bind, 'checked', {
              get:  addOptions.bind(el, 'checked'),
              enumerable: true
            });
            break;
        }
      } else if (element == HTMLTextAreaElement) {
        Object.defineProperty(bind, 'textValue', {
          get: addOptions.bind(el, 'textValue'),
          enumerable: true
        });
      }

      return bind;
    }
  }

  var ctors = ['HTMLElement', 'HTMLInputElement', 'HTMLSelectElement', 'HTMLTextAreaElement'];

  ctors.map(function(ctor) {
    if (!window.hasOwnProperty(ctor)) {
      throw new Error(ctor + ' not found.');
    }

    attachBindToElementPrototype(window[ctor], property);
  });

  var HTMLElement = window.HTMLElement;
  var HTMLInputElement = window.HTMLInputElement;
  var HTMLSelectElement = window.HTMLSelectElement;
  var HTMLTextAreaElement = window.HTMLTextAreaElement;

});