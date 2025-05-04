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
 * Converts pace to speed in km/h
 * @param {number} paceValue - The pace value in seconds per km
 * @returns {number} The speed in km/h
 */
function paceToSpeedKmh(paceValue) {
  if (paceValue <= 0) return "0.0";
  return (3600 / paceValue).toFixed(1);
}

/**
 * Converts pace to speed in mph
 * @param {number} paceValue - The pace value in seconds per mile
 * @returns {number} The speed in mph
 */
function paceToSpeedMph(paceValue) {
  if (paceValue <= 0) return "0.0";
  return (3600 / paceValue).toFixed(1);
}

/**
 * Formats a pace value to minutes:seconds format for both km and miles
 * @param {number} paceValueKm - The pace value in seconds per km
 * @returns {Object} The formatted pace and speed for km and miles
 */
function formatPace(paceValueKm) {
  const paceKm = paceValueKm;
  const minutesKm = Math.floor(paceKm / 60);
  const secondsKm = Math.floor(paceKm % 60);
  const speedKmh = paceToSpeedKmh(paceKm);

  const paceMile = paceKm * 1.60934; // Convert pace from sec/km to sec/mile
  const minutesMile = Math.floor(paceMile / 60);
  const secondsMile = Math.floor(paceMile % 60);
  const speedMph = paceToSpeedMph(paceMile);

  return {
    paceKm: `${minutesKm}:${secondsKm < 10 ? "0" : ""}${secondsKm}`,
    speedKmh: `${speedKmh}`,
    paceMile: `${minutesMile}:${secondsMile < 10 ? "0" : ""}${secondsMile}`,
    speedMph: `${speedMph}`,
  };
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
  const easyPaceFactorKm = calculatePaceFactor(0.7 * vo2max); // Factor for km pace
  const vo2maxPaceFactorKm = calculatePaceFactor(vo2max); // Factor for km pace

  // Calculate pace values in seconds per km
  // Corrected formula: pace (sec/km) = 60000 / speed (m/min)
  const easyPaceKm = 60000 / easyPaceFactorKm;
  const thresholdPaceKm = 60000 / calculatePaceFactor(0.88 * vo2max);
  const vo2maxPaceKm = 60000 / vo2maxPaceFactorKm;
  const anaerobicPaceKm = 60000 / calculatePaceFactor(1.1 * vo2max);
  const longRunLowerPaceKm = 60000 / calculatePaceFactor(0.6 * vo2max); // Adjusted to be slower
  const longRunUpperPaceKm = easyPaceKm; // Adjusted to match easy pace

  return {
    easy: formatPace(easyPaceKm),
    threshold: formatPace(thresholdPaceKm),
    vo2max: formatPace(vo2maxPaceKm),
    anaerobic: formatPace(anaerobicPaceKm),
    longRunLower: formatPace(longRunLowerPaceKm),
    longRunUpper: formatPace(longRunUpperPaceKm),
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
  formatPace, // Updated formatPace
  calculateVO2Max,
  calculateTrainingPaces, // Updated calculateTrainingPaces
  calculatePaces,
};
