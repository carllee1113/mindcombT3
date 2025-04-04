// Node layout configuration parameters

export interface NodeLayoutConfig {
  // Base radius for the first layer of nodes
  baseRadius: number;
  
  // Level-specific spacing configuration
  levelSpacing: {
    first: number;   // First level nodes from central node
    second: number;  // Second level nodes
    other: number;   // All other levels
  };
  
  // Angle constraints for node distribution
  angleConstraints: {
    smoothing: number;      // Angle smoothing factor (0-1)
    maxDeviation: number;   // Maximum angle deviation from parent
  };
  
  // Region definitions for first layer node distribution
  regions: {
    upper: {
      start: number;  // Start angle in radians
      end: number;    // End angle in radians
    };
    lower: {
      start: number;  // Start angle in radians
      end: number;    // End angle in radians
    };
  };
  
  // Position variation settings
  variation: {
    angle: number;    // Maximum angle variation (radians)
    radius: number;   // Maximum radius variation factor
  };
}

// Default configuration values
export const defaultNodeLayout: NodeLayoutConfig = {
  baseRadius: 250,
  
  levelSpacing: {
    first: 300,    // Larger spacing for first level to match image
    second: 250,   // Consistent spacing for second level
    other: 220     // Slightly reduced for deeper levels
  },
  
  angleConstraints: {
    smoothing: 0.2,           // 20% parent angle influence for more natural spread
    maxDeviation: Math.PI / 2  // 90° maximum deviation for wider distribution
  },
  
  regions: {
    upper: {
      start: -Math.PI / 6,   // -30°
      end: Math.PI / 2       // 90°
    },
    lower: {
      start: -Math.PI * 0.9, // -162°
      end: -Math.PI / 4      // -45°
    }
  },
  
  variation: {
    angle: Math.PI / 36,  // ±5° variation for more consistent layout
    radius: 0.05          // ±2.5% radius variation for better alignment
  }
};