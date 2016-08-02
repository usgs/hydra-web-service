'use strict';

(function () {
  var _CLASS_NAME;

  _CLASS_NAME = '.example-url';


  var initialize,
      updateLink;


  /**
   * Update all links with the class name.
   *
   */
  initialize = function (className) {
    var links;

    links = Array.prototype.slice.call(
        document.querySelectorAll(className));
    links.forEach(updateLink);
    links = null;
  };

  /**
   * Update one link.
   *
   * @param el {DOMElement}
   *     anchor element to be updated.
   */
  updateLink = function (el) {
    el.innerText = el.href;
  };


  initialize(_CLASS_NAME);
})();
