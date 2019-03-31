# Acting

[![Travis](https://img.shields.io/travis/unadlib/acting.svg)](https://travis-ci.org/unadlib/acting)
[![npm](https://img.shields.io/npm/v/acting.svg)](https://www.npmjs.com/package/acting)

Acting is a tiny agent model tool.

### Usage

To install `acting` with yarn:
```bash
yarn install acting # or npm install --save acting
```

### Example

```js
import Acting from 'acting';

const acting = new Acting({
  fetch: (...args) => console.log(...args),
  domains: {
    admin: ['GET', 'POST'],
    groups: {
      _self: ['DELETE'],
      role: ['PUT'],
    },
    users: {
      _with: {
        books: ['GET'],
      }
    }
  }
});

await acting.admin.get({ params: { a: 1 } });
await acting.admin.post({ body: { foo: 'bar'} });
await acting.groups.delete({ params: { b: 1 }, body: 'testbody' });
await acting.groups.role.put();
await acting.users(10).books.get();
```

console.log results:
```
{ path: '/admin?a=1', method: 'GET' }
{ path: '/admin', method: 'POST' } { foo: 'bar' }
{ path: '/groups?b=1', method: 'DELETE' } 'testbody'
{ path: '/groups/role', method: 'PUT' }
{ path: '/users/10/books', method: 'GET' }
```

### Options

- `root`: string
- `domains`: object
- `fetch`: function
- `selfKey`: string(defalt: `_self`)
- `withKey`: string(default: `_with`)




