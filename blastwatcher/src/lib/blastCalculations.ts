
// Constants for PPV calculation
const SITE_CONSTANTS = {
  'Jayanta OCP': { k: 1100, b: -1.6 },
  'Khadia OCP': { k: 950, b: -1.5 },
  'Beena OCP': { k: 1250, b: -1.7 },
};

type PPVResult = {
  ppv: number;
  damageLevel: string;
  description: string;
};

// Calculate Peak Particle Velocity (PPV) using site-specific constants
export function calculatePPV(
  mineName: string,
  distance: number,
  chargePerHole: number
): number {
  const constants = SITE_CONSTANTS[mineName as keyof typeof SITE_CONSTANTS] || 
                    { k: 1100, b: -1.6 }; // Default if mine not found

  // Apply scaled distance formula: PPV = k * (D / √Q)^b
  const scaledDistance = distance / Math.sqrt(chargePerHole);
  const ppv = constants.k * Math.pow(scaledDistance, constants.b);

  return parseFloat(ppv.toFixed(2));
}

// Determine damage level based on PPV value
export function determineDamageLevel(ppv: number): PPVResult {
  if (ppv <= 10) {
    return {
      ppv,
      damageLevel: 'None',
      description: 'No observable damage'
    };
  } else if (ppv <= 25) {
    return {
      ppv,
      damageLevel: 'Minor',
      description: 'Fine cracks in plaster, small chips'
    };
  } else if (ppv <= 50) {
    return {
      ppv,
      damageLevel: 'Moderate',
      description: 'Cracks in walls, broken windows'
    };
  } else if (ppv <= 100) {
    return {
      ppv,
      damageLevel: 'Severe',
      description: 'Major structural damage, unsafe conditions'
    };
  } else {
    return {
      ppv,
      damageLevel: 'Extreme',
      description: 'Partial or complete building collapse'
    };
  }
}

// Main function to predict PPV and damage from blast parameters
export function predictBlastImpact(
  mineName: string,
  distance: number,
  chargePerHole: number,
  buildingsPresent: boolean
): PPVResult {
  // Calculate basic PPV
  const ppv = calculatePPV(mineName, distance, chargePerHole);
  
  // Adjust prediction if buildings are present (simplified approximation)
  const adjustedPPV = buildingsPresent ? ppv * 1.2 : ppv;
  
  // Determine damage level based on PPV
  return determineDamageLevel(adjustedPPV);
}

// Advanced PPV calculation considering delay timing
export function advancedPredictBlastImpact(
  mineName: string,
  distance: number,
  chargePerHole: number,
  buildingsPresent: boolean,
  numHoles: number,
  rowDelay: number,
  holeDelay: number
): PPVResult {
  // Basic PPV calculation
  let ppv = calculatePPV(mineName, distance, chargePerHole);
  
  // Apply delay factor (simplified approximation)
  // Longer delays between rows and holes generally reduce PPV
  const delayFactor = Math.min(1.0, (50 / (rowDelay + holeDelay)) * 0.8);
  
  // More holes can increase overall ground vibration (simplified)
  const holeFactor = 1.0 + Math.log10(numHoles) * 0.1;
  
  // Building presence factor
  const buildingFactor = buildingsPresent ? 1.2 : 1.0;
  
  // Final adjusted PPV
  const adjustedPPV = ppv * delayFactor * holeFactor * buildingFactor;
  
  return determineDamageLevel(parseFloat(adjustedPPV.toFixed(2)));
}

export function getPPVColor(damageLevel: string): string {
  switch (damageLevel) {
    case 'None':
      return 'text-green-600';
    case 'Minor':
      return 'text-yellow-500';
    case 'Moderate':
      return 'text-orange-500';
    case 'Severe':
      return 'text-red-600';
    case 'Extreme':
      return 'text-purple-700';
    default:
      return 'text-gray-700';
  }
}
