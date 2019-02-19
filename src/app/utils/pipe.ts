// Utilize the previous pipe function that accepts only two functions
const _pipe = (a, b) => arg => b(a(arg));

// The rest parameters creates an array of operations
export const pipe = (...ops) => {
    // Iterate over the array of operations
    // By using reduce, merge all operations into a single bundle
    let bundle = ops.reduce((prevOp, nextOp) => {
        return _pipe(prevOp, nextOp);
    });
    return bundle;
};
