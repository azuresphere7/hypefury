import moment from 'moment';
import 'moment-timezone';
import sinon from 'sinon';
import {trialPeriodCalculator} from '@/util/trialPeriodCalculator';

describe('trialPeriodCalculator', () => {
  test('returns the right time difference (1)', () => {
    const createdAt = moment('2019-11-23T00:00:00.000Z');
    const now = moment('2019-11-29T10:00:00.000Z');
    sinon.useFakeTimers(now.toDate());
    const userProfile = {createdAt: () => createdAt};
    const {daysLeft, percentage} = trialPeriodCalculator(userProfile);
    expect(daysLeft).toBe(8);
    expect(percentage).toBe(42);
  });

  test('returns the right time difference (2)', () => {
    const createdAt = moment('2019-11-17T00:00:00.000Z');
    const now = moment('2019-11-17T10:00:00.000Z');
    sinon.useFakeTimers(now.toDate());
    const userProfile = {createdAt: () => createdAt};
    const {daysLeft, percentage} = trialPeriodCalculator(userProfile);
    expect(daysLeft).toBe(14);
    expect(percentage).toBe(0);
  });

  test('returns the right time difference (3)', () => {
    const createdAt = moment('2019-11-17T00:00:00.000Z');
    const now = moment('2019-11-18T10:00:00.000Z');
    sinon.useFakeTimers(now.toDate());
    const userProfile = {createdAt: () => createdAt};
    const {daysLeft, percentage} = trialPeriodCalculator(userProfile);
    expect(daysLeft).toBe(13);
    expect(percentage).toBe(7);
  });

  test('returns the right time difference (4)', () => {
    const createdAt = moment('2019-11-16T00:00:00.000Z');
    const now = moment('2019-11-17T10:00:00.000Z');
    sinon.useFakeTimers(now.toDate());
    const userProfile = {createdAt: () => createdAt};
    const {daysLeft, percentage} = trialPeriodCalculator(userProfile);
    expect(daysLeft).toBe(14);
    expect(percentage).toBe(0);
  });

  test('returns the right time difference (5)', () => {
    const createdAt = moment('2019-11-16T00:00:00.000Z');
    const now = moment('2019-11-18T10:00:00.000Z');
    sinon.useFakeTimers(now.toDate());
    const userProfile = {createdAt: () => createdAt};
    const {daysLeft, percentage} = trialPeriodCalculator(userProfile);
    expect(daysLeft).toBe(13);
    expect(percentage).toBe(7);
  });

  test('returns the right time difference (6)', () => {
    const createdAt = moment('2019-10-16T00:00:00.000Z');
    const now = moment('2019-11-19T10:00:00.000Z');
    sinon.useFakeTimers(now.toDate());
    const userProfile = {createdAt: () => createdAt};
    const {daysLeft, percentage} = trialPeriodCalculator(userProfile);
    expect(daysLeft).toBe(12);
    expect(percentage).toBe(14);
  });

  test('returns the right time difference (7)', () => {
    const createdAt = moment('2019-10-20T00:00:00.000Z');
    const now = moment('2019-11-20T10:00:00.000Z');
    sinon.useFakeTimers(now.toDate());
    const userProfile = {createdAt: () => createdAt};
    const {daysLeft, percentage} = trialPeriodCalculator(userProfile);
    expect(daysLeft).toBe(11);
    expect(percentage).toBe(21);
  });

  test('returns the right time difference (8)', () => {
    const createdAt = moment('2019-11-17T00:00:00.000Z');
    const now = moment('2019-12-17T10:00:00.000Z');
    sinon.useFakeTimers(now.toDate());
    const userProfile = {createdAt: () => createdAt};
    const {daysLeft, percentage} = trialPeriodCalculator(userProfile);
    expect(daysLeft).toBe(0);
    expect(percentage).toBe(100);
  });
});
