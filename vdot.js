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
      "VO2max",
      "anaerobic",
      "speed",
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
      const paceKmSeconds = timeSeconds / (distance / 1000);
      const paceMileSeconds = timeSeconds / (distance / 1609.34);

      paces[distanceName] = {
        time: this._formatTime(timeSeconds),
        paceKm: this._formatPace(paceKmSeconds),
        speedKmh: this._calculateSpeedKmh(paceKmSeconds),
        paceMile: this._formatPace(paceMileSeconds),
        speedMph: this._calculateSpeedMph(paceMileSeconds),
      };
    });

    // Add additional track distances (pace only)
    const pace800 = this._predictTimeFromVDOT(vdot, 800);
    const pace400 = this._predictTimeFromVDOT(vdot, 400);
    paces["800m"] = {
      time: this._formatTime(pace800),
      paceKm: this._formatPace(pace800 / 0.8), // Pace per km
      speedKmh: this._calculateSpeedKmh(pace800 / 0.8),
      paceMile: this._formatPace(pace800 / (800 / 1609.34)), // Pace per mile
      speedMph: this._calculateSpeedMph(pace800 / (800 / 1609.34)),
    };
    paces["400m"] = {
      time: this._formatTime(pace400),
      paceKm: this._formatPace(pace400 / 0.4), // Pace per km
      speedKmh: this._calculateSpeedKmh(pace400 / 0.4),
      paceMile: this._formatPace(pace400 / (400 / 1609.34)), // Pace per mile
      speedMph: this._calculateSpeedMph(pace400 / (400 / 1609.34)),
    };

    return paces;
  }

  /**
   * Calculate training paces from VDOT
   * @param {number} vdot - VDOT score
   * @returns {Object} - Training paces for various types
   */
  calculateTrainingPaces(vdot) {
    const paces = {};
    this.paceTypes.forEach((type) => (paces[type] = {})); // Initialize pace types

    // Adjust these values to more closely match Daniels' tables
    const paceAdjustments = {
      easy: 0.71,
      marathon: 0.85,
      threshold: 0.9,
      VO2max: 0.98,
      anaerobic: 1.07,
      speed: 1.12,
    };

    // Calculate kilometer and mile paces
    Object.keys(paceAdjustments).forEach((type) => {
      const adjustment = paceAdjustments[type];
      const kmPaceSeconds = this._calculatePaceFromVDOT(vdot, 1000, adjustment);
      const milePaceSeconds = this._calculatePaceFromVDOT(
        vdot,
        1609.34,
        adjustment
      );

      paces[type]["km"] = this._formatPace(kmPaceSeconds);
      paces[type]["speedKmh"] = this._calculateSpeedKmh(kmPaceSeconds);
      paces[type]["mile"] = this._formatPace(milePaceSeconds);
      paces[type]["speedMph"] = this._calculateSpeedMph(milePaceSeconds);
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
      const paceKmSeconds = timeSeconds / (distance / 1000);
      const paceMileSeconds = timeSeconds / (distance / 1609.34);

      performances[distanceName] = {
        time: this._formatTime(timeSeconds),
        paceKm: this._formatPace(paceKmSeconds),
        speedKmh: this._calculateSpeedKmh(paceKmSeconds),
        paceMile: this._formatPace(paceMileSeconds),
        speedMph: this._calculateSpeedMph(paceMileSeconds),
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
   * Calculate speed in km/h from pace in seconds per km
   * @param {number} paceSeconds - Pace in seconds per kilometer
   * @returns {string} - Speed in km/h
   */
  _calculateSpeedKmh(paceSeconds) {
    if (paceSeconds <= 0) return "0.0";
    return (3600 / paceSeconds).toFixed(1);
  }

  /**
   * Calculate speed in mph from pace in seconds per mile
   * @param {number} paceSeconds - Pace in seconds per mile
   * @returns {string} - Speed in mph
   */
  _calculateSpeedMph(paceSeconds) {
    if (paceSeconds <= 0) return "0.0";
    return (3600 / paceSeconds).toFixed(1);
  }

  /**
   * Main calculation function
   * @param {Object} input - Input parameters
   * @returns {Object} - Calculated results
   */
  calculate(input) {
    // Sanitize numeric inputs passed as strings with comma decimals
    if (typeof input.distance === 'string') {
      input.distance = parseFloat(input.distance.replace(',', '.'));
    }
    if (input.temperature != null && typeof input.temperature === 'string') {
      input.temperature = parseFloat(input.temperature.replace(',', '.'));
    }
    if (input.altitude != null && typeof input.altitude === 'string') {
      input.altitude = parseFloat(input.altitude.replace(',', '.'));
    }
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
