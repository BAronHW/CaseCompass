import { sum } from '../src/functions/add'

test('add 1 and 2 to equals 3', () => {
    expect(sum(1,2).toFixed(3));
})