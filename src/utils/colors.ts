export const branchColors = [
  '#00cc44', // bright green
  '#3366ff', // vibrant blue
  '#9933ff', // bright purple
  '#ff3366', // hot pink
  '#ffcc00', // bright yellow
  '#00ccff', // cyan
  '#ff6600', // orange
  '#cc33ff', // magenta
  '#33cc99', // turquoise
  '#ff3399', // deep pink
  '#6600ff', // indigo
  '#ff9900', // amber
  '#00ff99', // spring green
  '#ff0066', // crimson
  '#3399ff', // azure
];

export const getBranchColor = (index: number): string => {
  return branchColors[index % branchColors.length];
};

export const getRandomColor = (): string => {
  const randomIndex = Math.floor(Math.random() * branchColors.length);
  return branchColors[randomIndex];
};