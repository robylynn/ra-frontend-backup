export function* zip(...iterables) {
    // get the iterator of for each iterables
    const iters = [...iterables].map((iterable) => iterable[Symbol.iterator]());
    let next = iters.map((iter) => iter.next().value);
    // as long as any of the iterables returns something, yield a value (zip longest)
    while (anyOf(next)) {
        yield next;
        next = iters.map((iter) => iter.next().value);
    }

    function anyOf(arr) {
        return arr.some((v) => v !== undefined);
    }
}
