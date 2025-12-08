
const assetPriority = ['frd', 'base'];

export const sortBalancesByPriority = (a: [string, number], b: [string, number]): number => {
  // Assign priority index; unknown assets get a large index
  const indexA = assetPriority.indexOf(a[0]);
  const indexB = assetPriority.indexOf(b[0]);

  // If both have known priorities, compare them
  if (indexA !== -1 && indexB !== -1) {
    return indexA - indexB;
  }

  // If one has priority and the other doesn't — priority goes first
  if (indexA !== -1) return -1;
  if (indexB !== -1) return 1;

  // Otherwise fall back to normal sorting (alphabetical)
  return b[1] - a[1];
}