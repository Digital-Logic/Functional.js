/*
*   fn - function to curry
*   RequiredNumOfArgs (optional argument)
*   Used to specify a minimal number of
*   arguments that function (fn) must have before executing it.
*   More then this number of arguments may be passed in on invocation
*/
function curry(fn, RequiredNumOfArgs = Infinity) {
    if (typeof fn !== 'function') throw new TypeError('curry requires a function');

    return _argStorage([]);

    function _argStorage(storedArgs) {
        return function _curry(...newArgs) {
            /*
            *   Assign the (storedArgs) from previous invocations and append any new
            *   arguments passed to this function into (args);
            */
            const args = [...storedArgs, ...newArgs];
            /*
            *   Run the function if, the total number of stored arguments (args)
            *   is equal to the functions argument length (fn.length)
            *   Or if the total number of stored arguments (args)
            *   is equal to the (RequiredNumOfArgs) -- if specified.
            */
            if (args.length >= fn.length || args.length >= RequiredNumOfArgs) {
                return fn(...args);
            } else {
                return _argStorage(args);
            }
        };
    }
}

// Pipe multiply function together,
// on execution you can specify multiply arguments which will be passed to the
// first function provided to pipe
function pipe(...fnArr) {
    // validate input
    fnArr.forEach( fn => {
        if (typeof fn !== 'function')
            throw new TypeError('Invalid function');
    });
    // args = array of arguments
    // this function excepts multiply arguments on first execution
    return function(...args) {
        return fnArr.reduce( (curArgs, fn) => {
            return [fn(...curArgs)];
        }, args)
        // convert [value] into value
        .reduce( item => item);
    };
}

/*
*   Memorize a functions output based on it's import and return that stored
*   value the next time the function is called with the same arguments.
*   fn must be a pure function or the returned results will not be as expected.
*/
function memorizer(fn) {
    const cache = new Map();
    return function _memorizer(...args) {
        const key = JSON.stringify(args);

        if (!cache.has(key)) {
            // cache does not contain a result for the specified key,
            // run the function and store the result.
            const result = fn(...args);
            cache.set(key, result);
        }
        return cache.get(key);
    };
}
// See pipe
function compose(...fnArr) {
    return pipe( ...fnArr.reverse() );
}
/*
*   Partially apply a functions arguments across two function calls
*/
function partial(fn, ...firstArgs) {
    return function applied(...lastArgs) {
        return fn(...firstArgs, ...lastArgs);
    };
}

const map = curry( function _map(fn, obj) {
    return obj.map(fn);
});

const prop = curry( function _prop(propName, obj) {
    return obj[propName];
});

const match = curry( function _match(regex, str) {
    return regex.test(str);
});

const reduce = curry( function _reduce(fn, startValue, arr) {
    return arr.reduce(fn, startValue);
});

const split = curry( function _split( splitAt, str) {
    return str.split(splitAt);
});

function reverse (arr) {
    if (Array.isArray(arr))
        return arr.reverse();
    else if (typeof arr === 'string')
        return [...arr].reverse().join();
    else throw new TypeError('reverse only works on arrays and strings');
}
function debounce(fn, timeToWait) {
    let timer = null;

    function executer(...args) {
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(() => {
            fn(...args);
            timer = null;
        }, timeToWait);
    };
    // Provide a cancellation function attached to the executer.
    executer.cancel = () => clearTimeout(timer);

    return executer;
}

function throttle(fn, timeToWait) {
    let isThrottling = false;
    let timer = null;

    function executer(...args) {
        if (!isThrottling) {
            isThrottling = true;
            timer = setTimeout(() => {
                fn(...args);
                isThrottling = false;
            }, timeToWait);
        }
    }
    // Provide a cancellation function attached to the executer.
    executer.cancel = () => clearTimeout(timer);

    return executer;
}

class Identity {
    constructor(value) {
        this._value = value;
    }

    /*
    *   Apply the mapped function to the internal data and
    *   return a new Container element.
    */
    map(fn) {
        return new Identity( fn(this._value) );
    }

    ap(f) {
        return f.map(this._value);
    }

    static of(value) {
        return new Identity(value);
    }
}


class Maybe {
    constructor(value) {
        this._value = value;
    }

    map(fn) {
        if (this._value == undefined) {
            return Maybe.of(null);
        } else {
            return Maybe.of(fn(this._value));
        }
    }
    join() {
        return this._value;
    }
    chain(fn) {
        return this.map(fn).join();
    }

    static of(value) {
        return new Maybe(value);
    }
}


export {
    pipe,
    compose,
    curry,
    memorizer,
    partial,
    Identity,
    Maybe,
    reverse,
    throttle,
    debounce
};