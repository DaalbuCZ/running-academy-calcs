/**
 * Running Pace Calculator
 * Utility functions for calculating training paces based on race performance
 */

/**
 * Validates if the input is a positive integer or zero
 * @param {number} value - The value to validate
 * @returns {boolean} True if valid, false otherwise
 */
function isValidInput(value) {
  return !value || (Number.isInteger(value) && value > 0);
}

/**
 * Calculates a pace factor based on an input value
 * @param {number} value - The input value
 * @returns {number} The calculated pace factor
 */
function calculatePaceFactor(value) {
  return 29.54 + 5.000663 * value - 0.007546 * value * value;
}

/**
 * Formats a pace value to minutes:seconds format
 * @param {number} paceValue - The pace value
 * @returns {string} The formatted pace (e.g., "5:30")
 */
function formatPace(paceValue) {
  const pace = (1 / paceValue) * 1000;
  const minutes = Math.floor(pace);
  const seconds = Math.floor(60 * (pace - minutes));
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

/**
 * Formats a Yasso800 pace value
 * @param {number} paceFactor - The pace factor
 * @returns {string} The formatted Yasso800 pace (e.g., "3:45")
 */
function formatYasso800(paceFactor) {
  // Multiply by 1.95 as in the original implementation
  const adjustedPaceFactor = 1.95 * paceFactor;

  // Use miles (1609m) for calculation
  const pace = (1 / adjustedPaceFactor) * 1609;
  const minutes = Math.floor(pace);
  const seconds = Math.floor(60 * (pace - minutes));
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

/**
 * Calculates VO2max from distance and time
 * @param {number} distanceMeters - Race distance in meters
 * @param {number} timeMinutes - Race time in minutes
 * @returns {number} The calculated VO2max value
 */
function calculateVO2Max(distanceMeters, timeMinutes) {
  const speed = distanceMeters / timeMinutes;
  const rawVO2Max = 0.182258 * speed - 4.6 + 0.000104 * speed * speed;
  const ageFactor =
    0.8 +
    0.1894393 * Math.exp(-0.012778 * timeMinutes) +
    0.2989558 * Math.exp(-0.1932695 * timeMinutes);
  return rawVO2Max / ageFactor;
}

/**
 * Calculates training paces based on VO2max
 * @param {number} vo2max - The VO2max value
 * @returns {Object} Object containing various training paces
 */
function calculateTrainingPaces(vo2max) {
  const easyPaceFactor = calculatePaceFactor(0.7 * vo2max);
  const vo2maxPaceFactor = calculatePaceFactor(vo2max);

  return {
    easy: formatPace(easyPaceFactor),
    threshold: formatPace(calculatePaceFactor(0.88 * vo2max)),
    vo2max: formatPace(vo2maxPaceFactor),
    anaerobic: formatPace(calculatePaceFactor(1.1 * vo2max)),
    longRunLower: formatPace(easyPaceFactor),
    longRunUpper: formatPace(calculatePaceFactor(0.6 * vo2max)),
    yasso800: formatYasso800(vo2maxPaceFactor),
  };
}

/**
 * Main function to calculate all training paces based on race results
 * @param {number} raceDistance - Race distance in kilometers
 * @param {number} hours - Race time hours
 * @param {number} minutes - Race time minutes
 * @param {number} seconds - Race time seconds
 * @returns {Object|null} Training paces object or null if inputs are invalid
 */
function calculatePaces(raceDistance, hours, minutes, seconds) {
  // Validate inputs
  if (!raceDistance || raceDistance <= 0) {
    return null; // Invalid race length
  }

  if (
    !isValidInput(hours) ||
    !isValidInput(minutes) ||
    !isValidInput(seconds)
  ) {
    return null; // Invalid time inputs
  }

  // Calculate total time in minutes
  const totalTimeMinutes = hours * 60 + minutes + seconds / 60;

  if (totalTimeMinutes <= 0) {
    return null; // Invalid time
  }

  // Convert distance to meters
  const distanceMeters = raceDistance * 1000;

  // Calculate VO2max
  const vo2max = calculateVO2Max(distanceMeters, totalTimeMinutes);

  if (vo2max <= 0) {
    return null; // Invalid VO2max result
  }

  // Return all training paces
  return calculateTrainingPaces(vo2max);
}

// Export the functions
export {
  isValidInput,
  calculatePaceFactor,
  formatPace,
  calculateVO2Max,
  calculateTrainingPaces,
  calculatePaces,
};
