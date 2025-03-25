const branchColors = [
  '#FF6B6B', // coral red
  '#4ECDC4', // turquoise
  '#45B7D1', // sky blue
  '#96CEB4', // sage green
  '#FFEEAD', // soft yellow
  '#9B59B6', // purple
  '#3498DB', // bright blue
  '#E74C3C', // crimson
  '#2ECC71', // emerald
  '#F1C40F', // golden
  '#E67E22', // orange
  '#1ABC9C', // teal
];

export const getBranchColor = (index: number): string => {
  return branchColors[index % branchColors.length];
};

export const getRandomColor = (): string => {
  const randomIndex = Math.floor(Math.random() * branchColors.length);
  return branchColors[randomIndex];
};