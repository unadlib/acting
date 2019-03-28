export default class Model {
  constructor({
    root = ``,
    fetch,
    domains = {},
  }) {
    this._root = root;
    this._fetch = fetch;
    Object.entries(domains).forEach(domain => this._generateSubDomain(...domain));
  }

  _getPath(subDomain = '', postfix = '') {
    return `${this._root}/${subDomain}${postfix}`;
  }
  
  _getMethods(subDomain, methods) {
    return methods.reduce(
      (_subDomain, method) => Object.assign(_subDomain, {
        [method.toLowerCase()]: async (postfix, ...args) => {
          const path = this._getPath(subDomain, postfix);
          return await this._fetch({ path, method }, ...args);
        }
      }),
    {});
  }

  _generateSubDomain(subDomain, subConfig) {
    if (Array.isArray(subConfig)) {
      this[subDomain] = this._getMethods(subDomain, subConfig);
    }
    if (Array.isArray(subConfig._self)) {
      this[subDomain] = this._getMethods(subDomain, subConfig._self);
    }
    if (toString.call(subConfig) === '[object Object]') {
      this[subDomain] = {
        ...this[subDomain],
        ...new Model({
          root: this._getPath(subDomain),
          fetch: this._fetch,
          domains: subConfig,
        }),
      };
    }
  }
}