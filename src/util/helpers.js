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

export const findLabel = (obj, val) => {
  console.log(obj);
  let datas = false;
  function filtering(o, v) {
    if (_.isArray(o)) {
      o.forEach(label => {
        return filtering(label, v);
      });
    } else if (_.isObject(o)) {
      return filtering(o.labels, v);
    } else if (o === v) {
      datas = true;
    }
  }
  filtering(obj, val);
  console.log(datas);
  return datas;
};
