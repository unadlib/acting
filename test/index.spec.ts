import Model from '../src';

test('simple object', async () => {
  const model = new Model({
    root: '',
    fetch: (...args) => args,
    domains: {
      admin: ['GET', 'POST'],
    }
  });
  expect(await (model as any).admin.post('/foo', 'bar'))
    .toEqual([{"method": "POST", "path": "/admin/foo"}, "bar"]);
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
  expect(await (model as any).admin.post('/foo', 'bar'))
    .toEqual([{"method": "POST", "path": "/test/admin/foo"}, "bar"]);
  expect(await (model as any).admin.get('/foo', 'bar'))
    .toEqual([{"method": "GET", "path": "/test/admin/foo"}, "bar"]);
  expect(await (model as any).admin.users.get('?a=1'))
    .toEqual([{"method": "GET", "path": "/test/admin/users?a=1"}]);
  expect(await (model as any).admin.roles.groups.put('/check?a=1', 'testbody'))
    .toEqual([{"method": "PUT", "path": "/test/admin/roles/groups/check?a=1"}, 'testbody']);
});



