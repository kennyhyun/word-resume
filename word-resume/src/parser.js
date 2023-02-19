const get = require('lodash/get');

class Parser {
  constructor(data, context = '') {
    this._context = context;
    Object.assign(this, data);
  }

  getByContext(target) {
    if (target.default) {
      if (this._context) {
        return target[this._context] || target.default;
      }
      return target.default;
    }
    return target;
  }

  get(path) {
    const target = get(this, path, {});
    if (Array.isArray(target)) {
      return target;
    }
    return this.getByContext(target);
  }
}

export default Parser;
