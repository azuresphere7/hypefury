import Queue from '@/views/Queue';

describe('Queue', () => {
  test('getShortTimezone', () => {
    const that1 = { userProfile: { timezone: 'A' } };
    const f1 = Queue.methods.getShortTimezone.bind(that1);
    expect(f1()).toBe('A');

    const that2 = { userProfile: { timezone: 'A/B' } };
    const f2 = Queue.methods.getShortTimezone.bind(that2);
    expect(f2()).toBe('B');

    const that3 = { userProfile: { timezone: 'A/B/C' } };
    const f3 = Queue.methods.getShortTimezone.bind(that3);
    expect(f3()).toBe('C');

    const that4 = { userProfile: { timezone: 'A/B/C/D' } };
    const f4 = Queue.methods.getShortTimezone.bind(that4);
    expect(f4()).toBe('D');
  });
});
