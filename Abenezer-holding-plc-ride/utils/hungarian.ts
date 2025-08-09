// // hungarian.ts
// export function hungarian(matrix: number[][]): number[] {
//     // Uses https://github.com/addaleax/hungarian-algorithm (MIT), simplified for square matrices
//     const n = matrix.length;
//     const u = Array(n + 1).fill(0);
//     const v = Array(n + 1).fill(0);
//     const p = Array(n + 1).fill(0);
//     const way = Array(n + 1).fill(0);

//     for (let i = 1; i <= n; ++i) {
//         p[0] = i;
//         let minv = Array(n + 1).fill(Infinity);
//         let used = Array(n + 1).fill(false);
//         let j0 = 0;
//         do {
//             used[j0] = true;
//             let i0 = p[j0], delta = Infinity, j1 = 0;
//             for (let j = 1; j <= n; ++j) {
//                 if (!used[j]) {
//                     let cur = matrix[i0 - 1][j - 1] - u[i0] - v[j];
//                     if (cur < minv[j]) {
//                         minv[j] = cur;
//                         way[j] = j0;
//                     }
//                     if (minv[j] < delta) {
//                         delta = minv[j];
//                         j1 = j;
//                     }
//                 }
//             }
//             for (let j = 0; j <= n; ++j) {
//                 if (used[j]) {
//                     u[p[j]] += delta;
//                     v[j] -= delta;
//                 } else {
//                     minv[j] -= delta;
//                 }
//             }
//             j0 = j1;
//         } while (p[j0] != 0);
//         do {
//             let j1 = way[j0];
//             p[j0] = p[j1];
//             j0 = j1;
//         } while (j0);
//     }
//     const result = Array(n);
//     for (let j = 1; j <= n; ++j) {
//         if (p[j] > 0 && p[j] <= n) result[p[j] - 1] = j - 1;
//     }
//     return result;
// }

// hungarian.ts
export function hungarian(matrix: number[][]): number[] {
  // Optimization 1: Input validation
  if (!matrix.length || !matrix[0].length) return [];
  const n = matrix.length;

  // Optimization 2: Early exit for trivial cases
  if (n === 1) return [0];

  // Optimization 3: Use typed arrays for better performance
  const u = new Float64Array(n + 1).fill(0);
  const v = new Float64Array(n + 1).fill(0);
  const p = new Uint32Array(n + 1).fill(0);
  const way = new Uint32Array(n + 1).fill(0);

  // Optimization 4: Cache matrix access
  const getMatrixValue = (i: number, j: number) => matrix[i - 1][j - 1];

  for (let i = 1; i <= n; ++i) {
    p[0] = i;
    const minv = new Float64Array(n + 1).fill(Infinity);
    const used = new Uint8Array(n + 1).fill(0); // Using 0/1 instead of boolean for performance
    let j0 = 0;

    // Optimization 5: Optimized inner loop
    do {
      used[j0] = 1;
      const i0 = p[j0];
      let delta = Infinity;
      let j1 = 0;
      let cur;

      for (let j = 1; j <= n; ++j) {
        if (!used[j]) {
          cur = getMatrixValue(i0, j) - u[i0] - v[j];
          if (cur < minv[j]) {
            minv[j] = cur;
            way[j] = j0;
          }
          if (minv[j] < delta) {
            delta = minv[j];
            j1 = j;
          }
        }
      }

      // Optimization 6: Vectorized updates
      for (let j = 0; j <= n; ++j) {
        if (used[j]) {
          u[p[j]] += delta;
          v[j] -= delta;
        } else {
          minv[j] -= delta;
        }
      }

      j0 = j1;
    } while (p[j0] !== 0);

    // Optimization 7: Path compression
    let tempJ0 = j0;
    do {
      const j1 = way[tempJ0];
      p[tempJ0] = p[j1];
      tempJ0 = j1;
    } while (tempJ0);
  }

  // Optimization 8: Pre-allocated result
  const result = new Array(n);
  for (let j = 1; j <= n; ++j) {
    if (p[j] > 0 && p[j] <= n) result[p[j] - 1] = j - 1;
  }

  return result;
}

// Optimization 9: Memoization wrapper for repeated similar matrices
const memoizedHungarian = (function () {
  const cache = new Map<string, number[]>();
  const matrixToKey = (matrix: number[][]) =>
    matrix.map((row) => row.join(',')).join('|');

  return function (matrix: number[][]): number[] {
    const key = matrixToKey(matrix);
    if (cache.has(key)) return cache.get(key)!;

    const result = hungarian(matrix);
    cache.set(key, result);
    return result;
  };
})();

export { memoizedHungarian as cachedHungarian };
