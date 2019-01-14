import { pipe, compose, curry, memorizer, partial, Container, Maybe, throttle, debounce, reverse } from '../src/fn';

describe('pipe, compose', () => {
    // pipe(f1, f2)(value) === f2(f1(value))

    it('Should Pipe one function', () => {
        const multiply = pipe(x => x * 2);
        expect( multiply(2)).toBe(4);
        expect(multiply(4)).toBe(8);
    });
    it('Should Pipe two function together', () => {
        expect(pipe(x => x+1, x => x *2)(1)).toBe(4);
        expect( pipe(x => x+2, x => x * 2)(2)).toBe(8);
    });
    it('Should Pipe 3 function together', () => {
        /// pie(f1,f2,f3)(value) === f3(f2(f1(value)))
        const calculate = pipe(x=> x + 1, x => x * 2, x => x * 3);
        expect( calculate(1)).toBe(12);
        expect( calculate(3)).toBe(24);
    });
    it('Should except multiply arguments on execution', () => {
        const calculate = pipe( (x, y) => x + y, x=> x * 2);
        expect(calculate(2,3)).toBe(10);
        expect(calculate(4,6)).toBe(20);
    });
    it('Should work on arrays', () => {
        const calArray =
            pipe(
                arr => arr.map( item => item + 1),
                arr => arr.map( item => item * 2)
            );
        expect(calArray([1,2,3])).toEqual([4,6,8]);
    });
    it('Should throw when givin an invalid function', () => {
        expect( () => {
            pipe( x => x +1, x => x * 2, 'Hello', x => x + 4);
        }).toThrowError(TypeError);
    });
    it('Compose should work', () => {
        const cal = compose( x => x * 2, x => x + 1);
        expect(cal(1)).toBe(4);
    });
});

describe('curry', () => {
    it('Should curry a function', () => {
        const add = curry( (a,b) => a + b);
        const addOne = add(1);
        expect(addOne(1)).toBe(2);
    });
    it('Should throw if provided a invalid function', () => {
        expect( () => {
            const add = curry( 1 );
            add(2);
        }).toThrowError(TypeError);
    });
    it('Should expect multiply args at once', () => {
        const add = curry(function _add(a,b,c,d) {
                return a + b + c + d;
            });
        const addOneTwo = add(1,2);
        expect(addOneTwo(3,4)).toBe(10);
    });
});

describe('Memorizer', () => {
    // Create a mocked function to test with
    const mockFn = jest.fn( (a,b) => a+b);
    const memTest = memorizer( mockFn );

    it('mockFn, should not have been called', () => {
        expect(mockFn.mock.calls.length).toBe(0);
    });
    it('Should execute the stored function', () => {
        expect(memTest(1,2)).toBe(3);
        expect(mockFn.mock.calls.length).toBe(1);
    });

    it('Should not execute the mocked function', () => {
        expect(memTest(1,2)).toBe(3);
        expect(mockFn.mock.calls.length).toBe(1);
    });

    it('Should work as expected.', () => {
        expect(memTest(2,3)).toBe(5);
        expect(mockFn.mock.calls.length).toBe(2);

        expect(memTest(1,2)).toBe(3);
        expect(memTest(2,3)).toBe(5);
        expect(mockFn.mock.calls.length).toBe(2);
    });

    it('Should work with complex arguments', () => {
        const fn = jest.fn( (a, b) => {
            return {
                value: a.value + b.value
            };
        });
        const memComplex = memorizer(fn);

        expect(fn.mock.calls.length).toBe(0);
        expect(memComplex({value:1}, {value:2})).toEqual({value:3});
        expect(fn.mock.calls.length).toBe(1);
        expect(memComplex({value:1}, {value:2})).toEqual({value:3});
        expect(fn.mock.calls.length).toBe(1);

        expect(memComplex({value:2}, {value:3})).toEqual({value:5});
        expect(fn.mock.calls.length).toBe(2);
        expect(memComplex({value:2}, {value:3})).toEqual({value:5});
        expect(fn.mock.calls.length).toBe(2);
    });
});

describe('Partial', () => {
    it('Should return a partially applied function', () => {
        function _sumFour(a, b, c, d) {
            return a + b + c + d;
        }
        const sumPart = partial(_sumFour, 1,2);
        expect(typeof sumPart).toBe('function');
        expect(sumPart(3,4)).toBe(10);
    });
});

describe('Maybe', () => {
    it('Map should return a Maybe', () => {
        expect( Maybe.of(null).map( x => x + 2)).toEqual(Maybe.of(null));
        expect(Maybe.of(2).map(x => x * 2)).toEqual(Maybe.of(4));
    });
});

describe("Debounce", () => {
    jest.useFakeTimers();

    it("Should debounce function calls", () => {
        const fnHandler = jest.fn();
        const fn = debounce( fnHandler, 300);
        expect(fnHandler.mock.calls.length).toBe(0);
        expect(setTimeout).toHaveBeenCalledTimes(0);
        fn();
        expect(setTimeout).toHaveBeenCalledTimes(1);
        fn();
        fn();
        expect(fnHandler.mock.calls.length).toBe(0);
        jest.advanceTimersByTime(200);
        expect(fnHandler.mock.calls.length).toBe(0);
        jest.runAllTimers();
        expect(fnHandler.mock.calls.length).toBe(1);
    });

    it('Should be cancelable', () => {
        const fnHandler = jest.fn();
        const fn = debounce(fnHandler, 300);
        expect(fnHandler.mock.calls.length).toBe(0);
        jest.advanceTimersByTime(200);
        fn.cancel();
        jest.runAllTimers();
        expect(fnHandler.mock.calls.length).toBe(0);
    });
});

describe("Throttle", () => {
    jest.useFakeTimers();
    it("Should throttle function calls", () => {
        const fnHandler = jest.fn();
        const fn = throttle(fnHandler, 500);
        expect(fnHandler.mock.calls.length).toBe(0);
        fn();
        jest.advanceTimersByTime(200);
        fn();
        jest.advanceTimersByTime(200);
        fn();
        jest.advanceTimersByTime(200);
        expect(fnHandler.mock.calls.length).toBe(1);
        fn();
        jest.runAllTimers();
        expect(fnHandler.mock.calls.length).toBe(2);
    });
    it('Should be cancelable', () => {
        const fnHandler = jest.fn();
        const fn = throttle(fnHandler, 500);
        expect(fnHandler.mock.calls.length).toBe(0);
        fn();
        fn();
        fn.cancel();
        jest.runAllTimers();
        expect(fnHandler.mock.calls.length).toBe(0);
    });
});