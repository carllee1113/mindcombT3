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
  baseRadius: 200,
  
  levelSpacing: {
    first: 240,    // Slightly larger than base radius for first level
    second: 180,   // Slightly smaller for second level
    other: 160     // Even smaller for deeper levels
  },
  
  angleConstraints: {
    smoothing: 0.3,           // 30% parent angle influence
    maxDeviation: Math.PI / 3  // Maximum 60° deviation
  },
  
  regions: {
    upper: {
      start: -Math.PI / 12,  // -15°
      end: Math.PI / 2.4     // 75°
    },
    lower: {
      start: -Math.PI,       // -180°
      end: -Math.PI / 3      // -60°
    }
  },
  
  variation: {
    angle: Math.PI / 24,  // ±7.5° variation
    radius: 0.1           // ±5% radius variation
  }
};