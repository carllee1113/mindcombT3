export const branchColors = [
  '#3d5a3f', // forest green (brightened)
  '#4b6393', // medium blue (brightened navy)
  '#72668a', // muted purple
  '#a46379', // dusty rose
  '#feb640', // golden yellow
  '#537692', // steel blue
  '#f7a49e', // coral pink
  '#ffdf7c', // bright gold
  '#4682b4', // steel blue (replaced deep navy)
  '#f7c6c2', // light coral
  '#948d71', // sage
  '#e6b800', // darker gold (replaced cream yellow)
  '#8fbc8f', // medium sea green (replaced light sage)
  '#d48f9d', // medium rose (replaced soft white)
  '#6495ed', // cornflower blue (replaced duplicate powder blue)
];

export const getBranchColor = (index: number): string => {
  return branchColors[index % branchColors.length];
};

export const getRandomColor = (): string => {
  const randomIndex = Math.floor(Math.random() * branchColors.length);
  return branchColors[randomIndex];
};