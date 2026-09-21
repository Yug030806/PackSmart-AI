/**
 * PackSmart AI — Input Validation Utility
 * Validates food, packaging, and storage parameters against physical constraints.
 */

export function validateFoodInputs(input) {
  const errors = {};

  // 1. Food Commodity
  if (!input.food && !input.food_name) {
    errors.food = "Please select or name a food commodity.";
  }

  // 2. Moisture Content (0.1% to 99.0%)
  const moisture = Number(input.moisture);
  if (isNaN(moisture) || moisture < 0.1 || moisture > 99.0) {
    errors.moisture = "Moisture must be between 0.1% and 99.0%.";
  }

  // 3. Fat / Lipid Content (0% to 100%)
  const fat = Number(input.fat);
  if (isNaN(fat) || fat < 0 || fat > 100.0) {
    errors.fat = "Fat content must be between 0% and 100%.";
  }

  // 4. Physical Feasibility: Moisture + Fat cannot exceed 100%
  if (!isNaN(moisture) && !isNaN(fat) && (moisture + fat) > 100.0) {
    errors.composition = `Physically invalid: Moisture (${moisture}%) + Fat (${fat}%) exceeds 100% total mass.`;
  }

  // 5. pH Level (1.0 to 14.0)
  const ph = Number(input.ph);
  if (isNaN(ph) || ph < 1.0 || ph > 14.0) {
    errors.ph = "pH must be between 1.0 (acidic) and 14.0 (alkaline).";
  }

  // 6. Storage Temperature (-30°C to 70°C)
  const temp = Number(input.temperature);
  if (isNaN(temp) || temp < -30 || temp > 70) {
    errors.temperature = "Storage temperature must be between -30°C and 70°C.";
  }

  // 7. Storage Relative Humidity (5% to 100%)
  const humidity = Number(input.humidity);
  if (isNaN(humidity) || humidity < 5 || humidity > 100) {
    errors.humidity = "Relative humidity must be between 5% and 100%.";
  }

  // 8. Shelf Life Horizon (1 to 1825 days)
  const shelf = Number(input.shelf);
  if (isNaN(shelf) || shelf < 1 || shelf > 1825) {
    errors.shelf = "Target shelf-life must be between 1 and 1825 days (up to 5 years).";
  }

  // 9. Package Net Weight (5g to 100,000g)
  const weight = Number(input.packageWeight);
  if (isNaN(weight) || weight < 5 || weight > 100000) {
    errors.packageWeight = "Package weight must be between 5g and 100,000g.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
