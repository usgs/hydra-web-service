'use strict';


var el = document.querySelector('#application');


el.innerHTML = 'waiting 2 seconds';

setTimeout(function () {
  el.innerHTML = 'js content';
}, 2000);
