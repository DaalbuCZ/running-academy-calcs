/**
 * VDOT Running Calculator
 * Based on Dr. Jack Daniels' running formula
 */
class VDOTCalculator {
  constructor() {
    // Constants for calculations
    this.distanceMap = {
      marathon: 42195,
      "half-marathon": 21097.5,
      "15k": 15000,
      "10k": 10000,
      "5k": 5000,
      "3k": 3000,
      "1500m": 1500,
    };

    // Standard distances for equivalent performances
    this.equivalentDistances = [
      "marathon",
      "half-marathon",
      "15k",
      "10k",
      "5k",
      "3k",
      "1500m",
    ];

    // Training pace types
    this.paceTypes = [
      "easy",
      "marathon",
      "threshold",
      "interval",
      "repetition",
      "fast-reps",
    ];
  }

  /**
   * Calculate VDOT from race performance
   * @param {number} distance - Distance in meters
   * @param {number} timeSeconds - Time in seconds
   * @returns {number} - VDOT score
   */
  calculateVDOT(distance, timeSeconds) {
    // Simplified VDOT calculation based on Daniels' formula
    // This is an approximation of the actual formula
    const velocity = distance / timeSeconds; // meters per second
    const percentVO2max = this._getPercentVO2max(distance);

    // The actual formula is more complex but this gives a reasonable approximation
    let vdot =
      -4.6 + 0.182258 * velocity * 60 + 0.000104 * Math.pow(velocity * 60, 2);
    vdot = vdot / (percentVO2max / 100);

    return Math.round(vdot * 10) / 10; // Round to 1 decimal place
  }

  /**
   * Get percent of VO2max for a given race distance
   * @param {number} distance - Distance in meters
   * @returns {number} - Percent of VO2max
   */
  _getPercentVO2max(distance) {
    // Approximation of percent VO2max based on race distance
    if (distance >= 42195) return 84; // Marathon
    if (distance >= 21097) return 89; // Half Marathon
    if (distance >= 15000) return 92; // 15K
    if (distance >= 10000) return 94; // 10K
    if (distance >= 5000) return 97; // 5K
    if (distance >= 3000) return 98; // 3K
    if (distance >= 1500) return 100; // 1500m or less
    return 100;
  }

  /**
   * Calculate race paces from VDOT
   * @param {number} vdot - VDOT score
   * @returns {Object} - Race paces for various distances
   */
  calculateRacePaces(vdot) {
    const paces = {};

    // Calculate pace for each standard distance
    this.equivalentDistances.forEach((distanceName) => {
      const distance = this.distanceMap[distanceName];
      const timeSeconds = this._predictTimeFromVDOT(vdot, distance);

      paces[distanceName] = {
        time: this._formatTime(timeSeconds),
        paceKm: this._formatPace(timeSeconds / (distance / 1000)),
      };
    });

    // Add additional track distances
    paces["800m"] = {
      pace: this._formatTime(this._predictTimeFromVDOT(vdot, 800)),
    };

    paces["400m"] = {
      pace: this._formatTime(this._predictTimeFromVDOT(vdot, 400)),
    };

    return paces;
  }

  /**
   * Calculate training paces from VDOT
   * @param {number} vdot - VDOT score
   * @returns {Object} - Training paces for various types
   */
  calculateTrainingPaces(vdot) {
    const paces = {
      easy: {},
      marathon: {},
      threshold: {},
      interval: {},
      repetition: {},
      "fast-reps": {},
    };

    // Adjust these values to more closely match Daniels' tables
    const paceAdjustments = {
      easy: 0.71, // 71% of VDOT effort - unchanged
      marathon: 0.85, // 85% of VDOT effort - increased for faster pace
      threshold: 0.9, // 90% of VDOT effort - increased for faster pace
      interval: 0.98, // 98% of VDOT effort - unchanged
      repetition: 1.07, // 107% of VDOT - unchanged
      "fast-reps": 1.12, // 112% of VDOT - unchanged
    };

    // Calculate kilometer paces
    Object.keys(paceAdjustments).forEach((type) => {
      const adjustment = paceAdjustments[type];
      const kmPaceSeconds = this._calculatePaceFromVDOT(vdot, 1000, adjustment);
      paces[type]["km"] = this._formatPace(kmPaceSeconds);
    });

    // Calculate track interval distances (1200m, 800m, 600m, 400m, 300m, 200m)
    const trackDistances = [1200, 800, 600, 400, 300, 200];
    const trackPaceTypes = ["threshold", "interval", "repetition", "fast-reps"];

    trackPaceTypes.forEach((type) => {
      trackDistances.forEach((distance) => {
        // Apply constraints on which paces to calculate for each distance
        if (
          (type === "threshold" && distance >= 600) ||
          (type === "interval" && distance >= 200) ||
          (type === "repetition" && distance <= 800) ||
          (type === "fast-reps" && distance <= 400)
        ) {
          const adjustment = paceAdjustments[type];
          // For intervals, we want the total time, not pace
          const totalSeconds =
            this._predictTimeFromVDOT(vdot, distance) / adjustment;
          paces[type][`${distance}m`] = this._formatTime(totalSeconds);
        }
      });
    });

    return paces;
  }

  /**
   * Calculate equivalent race performances from VDOT
   * @param {number} vdot - VDOT score
   * @returns {Object} - Equivalent performances for standard distances
   */
  calculateEquivalentPerformances(vdot) {
    const performances = {};

    this.equivalentDistances.forEach((distanceName) => {
      const distance = this.distanceMap[distanceName];
      const timeSeconds = this._predictTimeFromVDOT(vdot, distance);

      performances[distanceName] = {
        time: this._formatTime(timeSeconds),
        paceKm: this._formatPace(timeSeconds / (distance / 1000)),
      };
    });

    return performances;
  }

  /**
   * Calculate temperature adjustment factor
   * @param {number} temperature - Temperature in degrees F
   * @returns {number} - Adjustment factor
   */
  calculateTemperatureAdjustment(temperature, isCelsius = false) {
    // Convert Celsius to Fahrenheit if needed
    const tempF = isCelsius ? (temperature * 9) / 5 + 32 : temperature;

    // Adjustment based on temperature (simplified)
    if (tempF < 60) return 1.0; // No adjustment for cool temperatures
    if (tempF < 70) return 1.01;
    if (tempF < 80) return 1.03;
    if (tempF < 90) return 1.06;
    return 1.1; // 10% slower for very hot conditions
  }

  /**
   * Calculate altitude adjustment factor
   * @param {number} altitude - Altitude in meters
   * @returns {number} - Adjustment factor
   */
  calculateAltitudeAdjustment(altitude) {
    // Adjustment based on altitude (meters)
    if (altitude < 305) return 1.0; // No adjustment for low altitudes
    if (altitude < 914) return 1.02;
    if (altitude < 1524) return 1.04;
    if (altitude < 2134) return 1.07;
    return 1.1; // 10% slower for very high altitudes
  }

  /**
   * Predict time for a distance based on VDOT
   * @param {number} vdot - VDOT score
   * @param {number} distance - Distance in meters
   * @returns {number} - Predicted time in seconds
   */
  _predictTimeFromVDOT(vdot, distance) {
    // This is a simplified formula based on Daniels' tables
    const percentVO2max = this._getPercentVO2max(distance);
    const velocity = this._getVelocityFromVDOT(vdot, percentVO2max);
    return distance / velocity;
  }

  /**
   * Calculate pace from VDOT
   * @param {number} vdot - VDOT score
   * @param {number} distance - Distance in meters
   * @param {number} adjustment - Adjustment factor for pace type
   * @returns {number} - Pace in seconds
   */
  _calculatePaceFromVDOT(vdot, distance, adjustment) {
    // Get race pace and adjust by the factor
    const racePace = this._predictTimeFromVDOT(vdot, distance) / adjustment;
    return racePace;
  }

  /**
   * Get running velocity from VDOT and %VO2max
   * @param {number} vdot - VDOT score
   * @param {number} percentVO2max - Percent of VO2max
   * @returns {number} - Velocity in m/s
   */
  _getVelocityFromVDOT(vdot, percentVO2max) {
    // Apply the percentVO2max adjustment
    const adjustedVDOT = vdot * (percentVO2max / 100);

    // Solve the quadratic equation: -4.6 + 0.182258v + 0.000104v² = adjustedVDOT
    // Where v = velocity*60
    const a = 0.000104;
    const b = 0.182258;
    const c = -4.6 - adjustedVDOT;

    // Use the quadratic formula: (-b + sqrt(b² - 4ac)) / 2a
    const discriminant = Math.pow(b, 2) - 4 * a * c;
    if (discriminant < 0) return 0; // No real solution

    const v = (-b + Math.sqrt(discriminant)) / (2 * a);

    // Convert v back to m/s (v was velocity in meters/minute)
    return v / 60;
  }

  /**
   * Format time in hh:mm:ss
   * @param {number} seconds - Time in seconds
   * @returns {string} - Formatted time
   */
  _formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  }

  /**
   * Format pace in mm:ss
   * @param {number} seconds - Pace in seconds
   * @returns {string} - Formatted pace
   */
  _formatPace(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  }

  /**
   * Main calculation function
   * @param {Object} input - Input parameters
   * @returns {Object} - Calculated results
   */
  calculate(input) {
    const {
      distance,
      time,
      temperature,
      altitude,
      temperatureUnit,
      altitudeUnit,
    } = input;

    // Convert time string to seconds
    const timeSeconds = this._timeToSeconds(time);

    // Calculate base VDOT
    let vdot = this.calculateVDOT(distance, timeSeconds);

    // Apply temperature adjustment if provided
    if (temperature) {
      const tempAdjustment = this.calculateTemperatureAdjustment(
        temperature,
        temperatureUnit === "C"
      );
      vdot = vdot * tempAdjustment;
    }

    // Apply altitude adjustment if provided
    if (altitude) {
      const altAdjustment = this.calculateAltitudeAdjustment(
        altitude,
        altitudeUnit === "m"
      );
      vdot = vdot * altAdjustment;
    }

    // Calculate all results
    return {
      vdot: Math.round(vdot * 10) / 10,
      racePaces: this.calculateRacePaces(vdot),
      trainingPaces: this.calculateTrainingPaces(vdot),
      equivalentPerformances: this.calculateEquivalentPerformances(vdot),
    };
  }

  /**
   * Convert time string to seconds
   * @param {string} timeStr - Time in format hh:mm:ss or mm:ss
   * @returns {number} - Time in seconds
   */
  _timeToSeconds(timeStr) {
    const parts = timeStr.split(":").map(Number);

    if (parts.length === 3) {
      // hh:mm:ss format
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      // mm:ss format
      return parts[0] * 60 + parts[1];
    }

    return Number(timeStr); // Assume seconds if no colons
  }
}

// Replace CommonJS export with ES Module export
export { VDOTCalculator };

// Example usage
// const calculator = new VDOTCalculator();
// const results = calculator.calculate({
//   distance: 5000, // 5k in meters
//   time: '20:00', // 20 minutes
// });
// console.log(results);
