import {beforeEach} from '@/routes/router';

describe('router', () => {
  describe('beforeEach', () => {
    test('redirect to /login if (authenticated route, user logged out, route isn\'t /login)', () => {
      const store = { getters: {} };
      expect(beforeEach(true, null, {path: '/asjdflsajdf'}, store)).toBe('/login');
    });
    test('redirect to /login if (user logged out, route is /login)', () => {
      const store = { getters: {} };
      expect(beforeEach(false, null, {path: '/login'}, store)).toBe(undefined);
    });
    test('redirect to /anyroute if (authenticated route, user logged in, route /anyroute)', () => {
      const store = { getters: { getUserProfile: { timezone: 'Europe/Paris', email: 'a@b.com' } } };
      expect(beforeEach(true, {}, {path: '/anyroute'}, store)).toBe(undefined);
    });
    test('redirect to / if (user logged in, route /login)', () => {
      const store = { getters: { getUserProfile: { timezone: 'Europe/Paris', email: 'a@b.com' } } };
      expect(beforeEach(false, {}, {path: '/login'}, store)).toBe('/');
    });
    test('redirect to /setup if (user logged in, route /anyroute, time zone not defined)', () => {
      const store = { getters: { getUserProfile: {} } };
      expect(beforeEach(true, {}, {path: '/anyroute'}, store)).toBe('/setup');
    });
    test('redirect to /setup if (user logged in, route /setup, time zone not defined)', () => {
      const store = { getters: { getUserProfile: {} } };
      expect(beforeEach(true, {}, {path: '/setup'}, store)).toBe(undefined);
    });
    test('redirect to / if (user logged in, route /setup, time zone defined, email undefined)', () => {
      const store = { getters: { getUserProfile: { timezone: 'Europe/Paris' } } };
      expect(beforeEach(true, {}, {path: '/setup'}, store)).toBe(undefined);
    });
    test('redirect to / if (user logged in, route /setup, time zone undefined, email defined)', () => {
      const store = { getters: { getUserProfile: { email: 'a@b.com' } } };
      expect(beforeEach(true, {}, {path: '/setup'}, store)).toBe(undefined);
    });
    test('redirect to / if (user logged in, route /setup, time zone defined, email defined)', () => {
      const store = { getters: { getUserProfile: { timezone: 'Europe/Paris', email: 'a@b.com' } } };
      expect(beforeEach(true, {}, {path: '/setup'}, store)).toBe('/');
    });
  });
});

