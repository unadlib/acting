import Model from '../src';

test('simple object', async () => {
  const model = new Model({
    root: '',
    fetch: (...args) => args,
    domains: {
      admin: ['GET', 'POST'],
      users: {
        _with: ['GET']
      },
      roles: {
        _with: {
          _self: ['GET'],
          groups: ['POST']
        }
      }
    }
  });
  expect(await (model as any).admin.post({ body: 'bar' }))
    .toEqual([{"method": "POST", "path": "/admin"}, "bar"]);
  expect(await (model as any).users(42).get({ params: { a: 1, b: 'string' }, body: 'bar' }))
    .toEqual([{"method": "GET", "path": "/users/42?a=1&b=string"}, "bar"]);
  expect(await (model as any).roles(33).groups.post({ params: { a: 1, b: ['string', 'true'] }, body: 'bar' }))
    .toEqual([{"method": "POST", "path": "/roles/33/groups?a=1&b=string&b=true"}, "bar"]);
  expect(await (model as any).roles(86).get({ body: 'bar' }))
    .toEqual([{"method": "GET", "path": "/roles/86"}, "bar"]);
});

test('deep object', async () => {
  const model = new Model({
    root: '/test',
    fetch: (...args) => args,
    domains: {
      admin: {
        _self: ['GET', 'POST'],
        users: ['GET', 'POST', 'DELETE'],
        roles: {
          groups: ['PATCH', 'DELETE', 'PUT'],
        }
      },
    }
  });
  expect(await (model as any).admin.post({ body: 'bar' }))
    .toEqual([{"method": "POST", "path": "/test/admin"}, "bar"]);
  expect(await (model as any).admin.get({ body: 'bar' }))
    .toEqual([{"method": "GET", "path": "/test/admin"}, "bar"]);
  expect(await (model as any).admin.users.get({ params: { a: 1 } }))
    .toEqual([{"method": "GET", "path": "/test/admin/users?a=1"} ,undefined]);
  expect(await (model as any).admin.roles.groups.put({ params: { a: 1 }, body: 'testbody' }))
    .toEqual([{"method": "PUT", "path": "/test/admin/roles/groups?a=1"}, 'testbody']);
});

test('config', async () => {
  const model = new Model({
    root: '/test',
    fetch: (...args) => args,
    domains: {
      admin: {
        self: ['GET', 'POST'],
      },
      users: {
        at: ['GET', 'POST'],
      },
      goods: {
        self: ['GET', 'POST'],
        at: {
          detail: ['GET', 'POST'],
        },
      },
    },
    selfKey: 'self',
    withKey: 'at'
  });
  expect(await (model as any).admin.post({ body: 'bar' }))
    .toEqual([{"method": "POST", "path": "/test/admin"}, "bar"]);
  expect(await (model as any).users(12).get({ body: 'bar' }))
    .toEqual([{"method": "GET", "path": "/test/users/12"}, "bar"]);
  expect(await (model as any).goods(12).detail.get({ body: 'bar' }))
    .toEqual([{"method": "GET", "path": "/test/goods/12/detail"}, "bar"]);
  expect(await (model as any).goods.post({ body: 'bar' }))
    .toEqual([{"method": "POST", "path": "/test/goods"}, "bar"]);  
});


test('complex object', async () => {
  const model = new Model({
    root: '',
    fetch: (...args) => args,
    domains: {
      app: {
        persons: ['GET'],
        posts: ['POST'],
        files: ['POST'],
        groups: {
          _self: ['GET', 'POST'],
          _with: {
            _self: ['GET'],
            'bulk-assign': ['POST'],
            posts: {
              _with: {
                _self: ['GET'],
                text: ['PUT']
              }
            }
          },
        },
      },
    }
  });
  expect(await (model as any).app.groups.post({ body: 'bar' }))
    .toEqual([{"method": "POST", "path": "/app/groups"}, "bar"]);
  expect(await (model as any).app.groups.get({ params: { a:1 } }))
    .toEqual([{"method": "GET", "path": "/app/groups?a=1"}, undefined]);
  expect(await (model as any).app.groups(11).get({ params: { a:1 } }))
    .toEqual([{"method": "GET", "path": "/app/groups/11?a=1"}, undefined]);
  expect(await (model as any).app.groups(11)['bulk-assign'].post({ body: 'bar' }))
    .toEqual([{"method": "POST", "path": "/app/groups/11/bulk-assign"}, "bar"]);
  expect(await (model as any).app.groups(11).posts(12).text.put({ body: 'bar' }))
    .toEqual([{"method": "PUT", "path": "/app/groups/11/posts/12/text"}, "bar"]);
  expect(await (model as any).app.groups(11).posts(12).get({ params: { a:1 } }))
    .toEqual([{"method": "GET", "path": "/app/groups/11/posts/12?a=1"}, undefined]);  
});
