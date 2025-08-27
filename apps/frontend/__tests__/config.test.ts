import { calculateTotalMinutes } from '../app/lib/config';

describe('calculateTotalMinutes', () => {
  it('sums visit + menus + options', () => {
    const total = calculateTotalMinutes('1回目〈30分〉', ['和装プラン', '洋装プランA'], ['眉カット']);
    // visit 30 + 和装30 + A60 + 眉30 = 150
    expect(total).toBe(150);
  });

  it('handles repeat visit (0 min)', () => {
    const total = calculateTotalMinutes('2回目以降〈0分〉', ['洋装プランA'], []);
    expect(total).toBeGreaterThanOrEqual(60);
  });
});


