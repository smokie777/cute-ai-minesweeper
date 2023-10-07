export const flatten1Depth = <T>(arr:T[][]): T[] => {
  const ret:T[] = [];
  arr.forEach(nestedArr => {
    nestedArr.forEach(i => {
      ret.push(i)
    });
  });
  return ret;
};

export const pickRandomFromArray = <T>(arr:T[]): T => arr[~~(Math.random() * arr.length)];
