// Constants for athletics scoring
const coefficients = {
  men: {
    "100m": [-0.00676, 3.05, -329.5],
    "200m": [-0.00168, 1.51, -329.5],
    "400m": [-0.000416, 0.749, -329.5],
    "800m": [-0.000104, 0.367, -329.5],
    "1500m": [-0.0000289, 0.195, -329.5],
    "5000m": [-0.00000261, 0.0577, -329.5],
    "10000m": [-0.000000653, 0.0287, -329.5],
    "110mh": [-0.00676, 3.05, -329.5],
    "400mh": [-0.000416, 0.749, -329.5],
    "high jump": [291.0, 2.1, -250.0],
    "pole vault": [51.0, 3.95, -250.0],
    "long jump": [14.3, 3.15, -250.0],
    "triple jump": [3.43, 2.1, -250.0],
    "shot put": [25.4, -180.0, 2300.0],
    discus: [2.54, -54.0, 2300.0],
    hammer: [2.54, -54.0, 2300.0],
    javelin: [2.54, -54.0, 2300.0],
  },
  women: {
    "100m": [-0.00912, 3.48, -329.5],
    "200m": [-0.00228, 1.74, -329.5],
    "400m": [-0.00057, 0.87, -329.5],
    "800m": [-0.000142, 0.427, -329.5],
    "1500m": [-0.0000391, 0.226, -329.5],
    "5000m": [-0.00000352, 0.067, -329.5],
    "10000m": [-0.00000088, 0.0334, -329.5],
    "100mh": [-0.00912, 3.48, -329.5],
    "400mh": [-0.00057, 0.87, -329.5],
    "high jump": [250.0, 1.95, -250.0],
    "pole vault": [44.0, 3.6, -250.0],
    "long jump": [12.3, 2.85, -250.0],
    "triple jump": [2.95, 1.9, -250.0],
    "shot put": [20.5, -160.0, 2100.0],
    discus: [2.05, -48.0, 2100.0],
    hammer: [2.05, -48.0, 2100.0],
    javelin: [2.05, -48.0, 2100.0],
  },
};

const order = {
  outdoor: [
    "100m",
    "200m",
    "400m",
    "800m",
    "1500m",
    "5000m",
    "10000m",
    "110mh",
    "400mh",
    "high jump",
    "pole vault",
    "long jump",
    "triple jump",
    "shot put",
    "discus",
    "hammer",
    "javelin",
  ],
  indoor: [
    "60m",
    "200m",
    "400m",
    "800m",
    "1500m",
    "3000m",
    "60mh",
    "high jump",
    "pole vault",
    "long jump",
    "triple jump",
    "shot put",
  ],
};

const markTypes = {
  "100m": "time",
  "200m": "time",
  "400m": "time",
  "800m": "time",
  "1500m": "time",
  "5000m": "time",
  "10000m": "time",
  "110mh": "time",
  "400mh": "time",
  "60m": "time",
  "60mh": "time",
  "3000m": "time",
  "high jump": "distance",
  "pole vault": "distance",
  "long jump": "distance",
  "triple jump": "distance",
  "shot put": "distance",
  discus: "distance",
  hammer: "distance",
  javelin: "distance",
};

const eventNames = {
  "100m": "100 m",
  "200m": "200 m",
  "400m": "400 m",
  "800m": "800 m",
  "1500m": "1500 m",
  "5000m": "5000 m",
  "10000m": "10000 m",
  "110mh": "110 m př.",
  "400mh": "400 m př.",
  "60m": "60 m",
  "60mh": "60 m př.",
  "3000m": "3000 m",
  "high jump": "Skok vysoký",
  "pole vault": "Skok o tyči",
  "long jump": "Skok daleký",
  "triple jump": "Trojskok",
  "shot put": "Vrh koulí",
  discus: "Hod diskem",
  hammer: "Hod kladivem",
  javelin: "Hod oštěpem",
};

const units = {
  time: "",
  distance: "m",
  points: "b.",
};

// Utility functions
function zeroPad(num, places) {
  return String(num).padStart(places, "0");
}

function score(coefficients, x) {
  if (coefficients.length === 2) {
    return coefficients[0] * x + coefficients[1];
  }
  return Math.round(
    coefficients[0] * x * x + coefficients[1] * x + coefficients[2]
  );
}

function getMarkFromScore(coefficients, y) {
  let ret = Number(
    (
      (-1 * coefficients[1] -
        Math.sqrt(
          Math.pow(coefficients[1], 2) -
            4 * coefficients[0] * (coefficients[2] - y)
        )) /
      (2 * coefficients[0])
    ).toFixed(2)
  );

  if (ret < 0) {
    ret = Number(
      (
        (-1 * coefficients[1] +
          Math.sqrt(
            Math.pow(coefficients[1], 2) -
              4 * coefficients[0] * (coefficients[2] - y)
          )) /
        (2 * coefficients[0])
      ).toFixed(2)
    );
  }

  return ret;
}

function userMarkToMark(markValue, markType, timeInputs) {
  switch (markType) {
    case "time":
      const hours = parseFloat(timeInputs.hours || "0");
      const minutes = parseFloat(timeInputs.minutes || "0");
      const seconds = parseFloat(timeInputs.seconds.replace(",", ".") || "0");
      if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
        throw new Error("Invalid time input");
      }
      return 60 * 60 * hours + 60 * minutes + seconds;
    case "distance":
      const sanitizedMark = markValue.replace(",", ".");
      const distance = parseFloat(sanitizedMark);
      if (isNaN(distance)) {
        throw new Error("Invalid distance input");
      }
      return distance;
    case "points":
      return parseInt(markValue);
    default:
      throw new Error(`unknown mark type ${markType}`);
  }
}

function markToUserMark(mark, markType, timeInputs) {
  switch (markType) {
    case "time":
      const totalSeconds = mark;
      timeInputs.hours.value = Math.floor(totalSeconds / 3600);
      timeInputs.minutes.value = Math.floor((totalSeconds % 3600) / 60);
      timeInputs.seconds.value = (totalSeconds % 60).toFixed(2);
      return "";
    case "distance":
      return mark.toFixed(2);
    case "points":
      return `${mark}`;
    default:
      throw new Error(`unknown mark type ${markType}`);
  }
}

// Calculator class
class AthleticsCalculator {
  constructor() {
    this.lastChanged = null; // Track which input was last changed
    this.initializeElements();
    this.initializeEventListeners();
    this.loadFromURL();
  }

  initializeElements() {
    this.categorySelect = document.getElementById("category");
    this.genderSelect = document.getElementById("gender");
    this.eventSelect = document.getElementById("event");
    this.markInput = document.getElementById("mark");
    this.pointsInput = document.getElementById("points");
    this.markUnitSpan = document.getElementById("mark-unit");
    this.calculateButton = document.getElementById("calculate-button");
    this.markContainer = document.getElementById("mark-container");
    this.timeMarkContainer = document.getElementById("time-mark-container");
    this.hoursInput = document.getElementById("hours");
    this.minutesInput = document.getElementById("minutes");
    this.secondsInput = document.getElementById("seconds");

    this.updateEvents();
  }

  initializeEventListeners() {
    this.categorySelect.addEventListener("change", () => {
      this.updateEvents();
      this.updateURL();
    });

    this.genderSelect.addEventListener("change", () => {
      this.updateURL();
      this.recalculate();
    });

    this.eventSelect.addEventListener("change", () => {
      this.updateMarkUnit();
      this.updateURL();
      this.recalculate();
    });

    this.markInput.addEventListener("input", () => {
      this.lastChanged = "mark";
      this.markInput.value = this.markInput.value.replace(",", ".");
    });

    this.hoursInput.addEventListener("input", () => {
      this.lastChanged = "mark";
    });
    this.minutesInput.addEventListener("input", () => {
      this.lastChanged = "mark";
    });
    this.secondsInput.addEventListener("input", () => {
      this.secondsInput.value = this.secondsInput.value.replace(",", ".");
      this.lastChanged = "mark";
    });

    this.pointsInput.addEventListener("input", () => {
      this.lastChanged = "points";
    });

    this.calculateButton.addEventListener("click", () =>
      this.performCalculation()
    );
  }

  updateEvents() {
    const category = this.categorySelect.value;
    const events = order[category];

    this.eventSelect.innerHTML = "";

    events.forEach((event) => {
      const option = document.createElement("option");
      option.value = event;
      option.textContent = eventNames[event] || event;
      this.eventSelect.appendChild(option);
    });

    this.updateMarkUnit();
  }

  updateMarkUnit() {
    const event = this.eventSelect.value;
    const markType = markTypes[event];
    this.markUnitSpan.textContent = units[markType];

    if (markType === "time") {
      this.markContainer.classList.add("hidden");
      this.timeMarkContainer.classList.remove("hidden");
    } else {
      this.markContainer.classList.remove("hidden");
      this.timeMarkContainer.classList.add("hidden");
    }
  }

  calculatePoints(markValue, eventType, timeInputs) {
    if (!markValue && eventType !== "time") return "";
    try {
      const markNum = userMarkToMark(
        markValue,
        markTypes[eventType],
        timeInputs
      );
      const gender = this.genderSelect.value;
      if (!coefficients[gender] || !coefficients[gender][eventType]) {
        console.warn(`Coefficients not found for ${gender} - ${eventType}`);
        return "";
      }
      const points = score(coefficients[gender][eventType], markNum);

      // Check limits and alert if exceeded, but allow 0 and 1400
      if (points < 0 || points > 1400) {
        alert(`Vypočtené body (${points}) jsou mimo platný rozsah (0-1400).`);
        return ""; // Return empty if outside valid range (excluding 0 and 1400)
      }
      return points.toString(); // Return points if 0 <= points <= 1400
    } catch (error) {
      console.error("Error calculating points:", error);
      return "";
    }
  }

  calculateMark(pointsValue, eventType) {
    const pointsNum = parseInt(pointsValue);
    if (isNaN(pointsNum)) return "";

    // Check points input limits and alert if exceeded
    if (pointsNum < 0 || pointsNum > 1400) {
      alert(`Zadané body (${pointsNum}) jsou mimo platný rozsah (0-1400).`);
      return ""; // Return empty if points are outside valid range
    }

    const gender = this.genderSelect.value;
    if (!coefficients[gender] || !coefficients[gender][eventType]) {
      console.warn(`Coefficients not found for ${gender} - ${eventType}`);
      return "";
    }
    try {
      const mark = getMarkFromScore(coefficients[gender][eventType], pointsNum);
      const timeInputs = {
        hours: this.hoursInput,
        minutes: this.minutesInput,
        seconds: this.secondsInput,
      };
      return markToUserMark(mark, markTypes[eventType], timeInputs);
    } catch (error) {
      // This might happen if the points value leads to an invalid mark (e.g., negative time/distance)
      console.error("Error calculating mark:", error);
      alert(`Nelze vypočítat platný výkon pro zadané body (${pointsNum}).`);
      return "";
    }
  }

  onMarkChanged() {
    const event = this.eventSelect.value;
    const markType = markTypes[event];
    let markValue = "";
    let timeInputs = null;

    if (markType === "time") {
      timeInputs = {
        hours: this.hoursInput.value,
        minutes: this.minutesInput.value,
        seconds: this.secondsInput.value,
      };
    } else {
      markValue = this.markInput.value;
    }

    try {
      const newPoints = this.calculatePoints(markValue, event, timeInputs);
      // Only update if calculatePoints didn't return empty (which happens on error/alert)
      if (newPoints !== "") {
        this.pointsInput.value = newPoints;
        this.updateURL();
      } else {
        this.pointsInput.value = ""; // Clear points if calculation failed or limits exceeded
      }
    } catch (error) {
      console.error("Error in onMarkChanged:", error);
      this.pointsInput.value = "";
    }
  }

  onPointsChanged() {
    const newPoints = this.pointsInput.value;
    const event = this.eventSelect.value;
    const markType = markTypes[event];
    const calculatedMark = this.calculateMark(newPoints, event); // calculateMark now handles alerts

    // Only update if calculateMark didn't return empty
    if (calculatedMark !== "") {
      if (markType !== "time") {
        this.markInput.value = calculatedMark;
      }
      // For time marks, calculateMark already updated the HH/MM/SS inputs
      this.updateURL();
    } else {
      // Clear mark inputs if calculation failed or limits exceeded
      if (markType === "time") {
        this.hoursInput.value = "";
        this.minutesInput.value = "";
        this.secondsInput.value = "";
      } else {
        this.markInput.value = "";
      }
    }
  }

  performCalculation() {
    if (this.lastChanged === "mark") {
      this.onMarkChanged();
    } else if (this.lastChanged === "points") {
      this.onPointsChanged();
    } else {
      this.onMarkChanged();
    }
  }

  loadFromURL() {
    const params = new URLSearchParams(window.location.search);

    if (params.has("category")) {
      this.categorySelect.value = params.get("category");
      this.updateEvents();
    }

    if (params.has("gender")) {
      this.genderSelect.value = params.get("gender");
    }

    const eventParam = params.get("event");
    if (
      eventParam &&
      Array.from(this.eventSelect.options).some(
        (opt) => opt.value === eventParam
      )
    ) {
      this.eventSelect.value = eventParam;
    }
    this.updateMarkUnit();

    const markType = markTypes[this.eventSelect.value];

    if (markType === "time") {
      if (params.has("h")) this.hoursInput.value = params.get("h");
      if (params.has("m")) this.minutesInput.value = params.get("m");
      if (params.has("s")) this.secondsInput.value = params.get("s");
      this.lastChanged = "mark";
    } else {
      if (params.has("mark")) {
        this.markInput.value = params.get("mark");
        this.lastChanged = "mark";
      }
    }

    if (params.has("points")) {
      this.pointsInput.value = params.get("points");
      this.lastChanged = "points";
    }
  }

  updateURL() {
    const params = new URLSearchParams();
    const markType = markTypes[this.eventSelect.value];

    params.set("category", this.categorySelect.value);
    params.set("gender", this.genderSelect.value);
    params.set("event", this.eventSelect.value);

    if (markType === "time") {
      if (this.hoursInput.value) params.set("h", this.hoursInput.value);
      if (this.minutesInput.value) params.set("m", this.minutesInput.value);
      if (this.secondsInput.value) params.set("s", this.secondsInput.value);
    } else {
      if (this.markInput.value) params.set("mark", this.markInput.value);
    }

    if (this.pointsInput.value) {
      params.set("points", this.pointsInput.value);
    }

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, "", newUrl);
  }

  recalculate() {
    if (this.markInput.value) {
      this.onMarkChanged();
    } else if (this.pointsInput.value) {
      this.onPointsChanged();
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new AthleticsCalculator();
});
