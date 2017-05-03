import _ from 'underscore';
export const copyJSON = json => JSON.parse(JSON.stringify(json));

export const qs = (function(a) {
  if (a === '') {
    return {};
  }
  const b = {};
  for (let i = 0; i < a.length; ++i) {
    const p = a[i].split('=', 2);
    if (p.length === 1) {
      b[p[0]] = '';
    } else {
      b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, ' '));
    }
  }
  return b;
})(window.location.search.substr(1).split('&'));

const someJson = [
  {
    labels: [
      {
        labels: ['1', '2']
      }
    ],
    url: 'url'
  },
  {
    labels: [
      {
        labels: ['1', '2']
      }
    ],
    url: 'url'
  }
];
export const findLabel = (obj, val) => {
  if (_.isArray(obj)) {
    for (let label of obj) {
      return findLabel(label, val);
    }
  } else if (_.isObject(obj)) {
    return findLabel(obj.labels, val);
  } else {
    return obj === val;
  }
};
