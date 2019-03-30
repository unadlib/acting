type Properties<T = any> = {
  [P in string]?: T;
}
interface FetchOption {
  path: string,
  method: string,
}
type Fn = (...args:[]) => any;
type Fetch = (option: FetchOption, ...args) => any;
interface ModelOption {
  root?: string,
  fetch: Fetch,
  domains: Properties,
  selfKey?: string,
  withKey?: string,
}
type SubConfig = string[] & Properties & {
  _self?: string[],
}

export default class Model {
  public _root: string;
  public _fetch: Fetch;
  public _selfKey: string;
  public _withKey: string;

  constructor({
    root = ``,
    fetch,
    domains = {},
    selfKey = '_self',
    withKey = '_with',
  }: ModelOption) {
    this._root = root;
    this._fetch = fetch;
    this._selfKey = selfKey;
    this._withKey = withKey;
    (<any>Object).entries(domains).forEach(
      ([subDomain, subConfig]) => this._generateSubDomain(subDomain, subConfig)
    );
  }

  _getPath(subDomain: string = '', postfix: string = ''): string {
    const isSelfKey = subDomain === this._selfKey;
    const substring = isSelfKey ? '' : `/${subDomain}`;
    return `${this._root}${substring}${postfix}`;
  }
  
  _getMethods(subDomain: string, methods: string[]): Properties<Fn> {
    return methods.reduce(
      (_subDomain, method) => (<any>Object).assign(_subDomain, {
        [method.toLowerCase()]: async (postfix, ...args) => {
          const path = this._getPath(subDomain, postfix);
          return await this._fetch({ path, method }, ...args);
        }
      }),
    {});
  }

  _generateSubDomain(subDomain: string, subConfig: SubConfig) {
    if (Array.isArray(subConfig)) {
      const methods = this._getMethods(subDomain, subConfig);
      if (subDomain === this._selfKey) {
        Object.assign(this, methods);
      } else {
        this[subDomain] = methods;
      }
    }
    if (Array.isArray(subConfig[this._selfKey])) {
      const methods = this._getMethods(subDomain, subConfig[this._selfKey]);
      if (subDomain === this._withKey) {
        Object.assign(this, methods);
      } else {
        this[subDomain] = methods;
      }
    }
    if (Array.isArray(subConfig[this._withKey])) {
      this[subDomain] = id => {
        return this._getMethods(`${subDomain}/${id}`, subConfig[this._withKey])
      };
    }
    if ((<any>Object).prototype.toString.call(subConfig[this._withKey]) === '[object Object]') {
      this[subDomain] = id => new Model({
        root: `${this._getPath(subDomain)}/${id}`,
        fetch: this._fetch,
        domains: subConfig[this._withKey],
        selfKey: this._selfKey,
        withKey: this._withKey,
      });
    }
    if ((<any>Object).prototype.toString.call(subConfig) === '[object Object]') {
      this[subDomain] = this[subDomain] || {};
      Object.assign(this[subDomain], new Model({
        root: this._getPath(subDomain),
        fetch: this._fetch,
        domains: subConfig,
      }));
    }
  }
}
