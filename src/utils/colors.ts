export const branchColors = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#96CEB4', // Mint
  '#FFEEAD', // Yellow
  '#D4A5A5', // Pink
  '#9B59B6', // Purple
  '#3498DB', // Sky Blue
  '#E67E22', // Orange
  '#2ECC71', // Green
  '#F1C40F', // Golden
  '#E74C3C'  // Crimson
]

export const getRandomColor = () => {
  return branchColors[Math.floor(Math.random() * branchColors.length)]
}