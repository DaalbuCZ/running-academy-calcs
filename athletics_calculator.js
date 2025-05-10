let coefficientsData = {};

async function loadCoefficients() {
  try {
    const response = await fetch("coefficients-2025.json");
    if (!response.ok) {
      throw new Error(`HTTP chyba! Stav: ${response.status}`);
    }
    coefficientsData = await response.json();
    populateGenderDropdown();
  } catch (error) {
    console.error("Chyba při načítání koeficientů:", error);
    document.getElementById("result").textContent =
      "Chyba při načítání koeficientů. Zkontrolujte konzoli.";
    // Disable UI elements if data loading fails
    document.getElementById("gender").innerHTML =
      '<option value="">Chyba načítání</option>';
    document.getElementById("event").innerHTML =
      '<option value="">Chyba načítání</option>';
    document.getElementById("calculateButton").disabled = true;
  }
}

function translateEventName(eventKey) {
  let name = eventKey;

  // Handle specific full names first to avoid partial replacements
  if (name === "Road HM") return "Silniční půlmaraton";
  if (name === "Road Marathon") return "Silniční maraton";
  if (name === "TJ") return "Trojskok";
  if (name === "HJ") return "Skok do výšky";
  if (name === "PV") return "Skok o tyči";
  if (name === "LJ") return "Skok do dálky";
  if (name === "SP") return "Vrh koulí";
  if (name === "DT") return "Hod diskem";
  if (name === "HT") return "Hod kladivem";
  if (name === "JT") return "Hod oštěpem";

  let isShortTrack = false;
  if (name.includes(" sh")) {
    isShortTrack = true;
    name = name.replace(" sh", "").trim(); // Remove sh and trim potential space
  }

  // Combined events - check after 'sh' removal
  if (name === "Dec.") return isShortTrack ? "Desetiboj (hala)" : "Desetiboj";
  if (name === "Hept.") return isShortTrack ? "Sedmiboj (hala)" : "Sedmiboj";
  if (name === "Pent.") return isShortTrack ? "Pětiboj (hala)" : "Pětiboj";

  // General transformations
  if (name.startsWith("Road ")) {
    name = name.replace("Road ", "Silniční ");
  }

  // Check for "W" (walk) - could be "20kmW" or "20,000mW"
  if (name.endsWith("W")) {
    name = name.slice(0, -1) + " chůze"; // Remove W and add "chůze"
  }

  // Check for "H" (hurdles) - e.g., "110mH"
  if (/[0-9]+mH$/.test(name)) {
    name = name.slice(0, -1) + " překážek"; // Remove H and add "překážek"
  }

  if (name.includes("SC")) {
    // Steeplechase
    name = name.replace("SC", "překážek").replace("  ", " "); // Replace SC and fix potential double space
  }

  if (name.includes("mix")) {
    name = name.replace("mix", "smíšená");
  }

  // Relays like "4x100m"
  if (/^[0-9]+x[0-9]+m$/.test(name.split(" ")[0])) {
    // Check if the first part is a relay format
    name += " štafeta";
  }

  // Add (hala) if it was detected and not added by combined events
  if (isShortTrack && !name.includes("(hala)")) {
    name += " (hala)";
  }

  // Other specific names
  if (name === "Mile") name = "Míle";
  if (name === "2 Miles") name = "2 míle";

  // Normalize spaces (e.g. if " Silniční" or "chůze ")
  name = name.replace(/\s+/g, " ").trim();

  return name;
}

function populateGenderDropdown() {
  const genderSelect = document.getElementById("gender");
  genderSelect.innerHTML = '<option value="">Vyberte pohlaví</option>'; // Clear previous options
  if (coefficientsData && typeof coefficientsData === "object") {
    Object.keys(coefficientsData).forEach((gender) => {
      const option = document.createElement("option");
      option.value = gender;
      let translatedGender = gender;
      if (gender.toLowerCase() === "men") translatedGender = "Muži";
      if (gender.toLowerCase() === "women") translatedGender = "Ženy";
      option.textContent = translatedGender;
      genderSelect.appendChild(option);
    });
    genderSelect.addEventListener("change", () => {
      localStorage.setItem("selectedGender", genderSelect.value);
      populateEventDropdown();
    });

    // Load saved gender
    const savedGender = localStorage.getItem("selectedGender");
    if (
      savedGender &&
      genderSelect.querySelector(`option[value="${savedGender}"]`)
    ) {
      genderSelect.value = savedGender;
      populateEventDropdown();
    }
  } else {
    console.error(
      "Data koeficientů nejsou v očekávaném formátu:",
      coefficientsData
    );
    genderSelect.innerHTML = '<option value="">Chyba dat</option>';
  }
}

function populateEventDropdown() {
  const gender = document.getElementById("gender").value;
  const eventSelect = document.getElementById("event");
  eventSelect.innerHTML = '<option value="">Vyberte disciplínu</option>'; // Clear previous options

  if (gender && coefficientsData[gender]) {
    Object.keys(coefficientsData[gender])
      .sort()
      .forEach((event) => {
        const option = document.createElement("option");
        option.value = event; // Keep original key for calculations
        option.textContent = translateEventName(event); // Display translated name
        eventSelect.appendChild(option);
      });

    // Load saved event for this gender
    const savedEvent = localStorage.getItem(`selectedEvent_${gender}`);
    if (
      savedEvent &&
      eventSelect.querySelector(`option[value="${savedEvent}"]`)
    ) {
      eventSelect.value = savedEvent;
    }
    // Add event listener for saving event selection
    eventSelect.removeEventListener("change", handleEventChange); // Remove previous if any
    eventSelect.addEventListener("change", handleEventChange);
  } else if (gender) {
    console.error(`No events found for gender: ${gender}`);
    eventSelect.innerHTML = '<option value="">No events</option>';
  }
}

function parsePerformance(performanceStr) {
  if (performanceStr.includes(":")) {
    const parts = performanceStr.split(":").map(Number);
    let seconds = 0;
    if (parts.length === 3) {
      // hh:mm:ss.ff
      seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      // mm:ss.ff
      seconds = parts[0] * 60 + parts[1];
    } else {
      return NaN; // Invalid time format
    }
    return seconds;
  }
  return parseFloat(performanceStr);
}

// Helper function to handle event change and save to localStorage
function handleEventChange() {
  const gender = document.getElementById("gender").value;
  const event = document.getElementById("event").value;
  if (gender && event) {
    localStorage.setItem(`selectedEvent_${gender}`, event);
  }
}

function calculatePoints() {
  const gender = document.getElementById("gender").value;
  const event = document.getElementById("event").value;
  const performanceStr = document.getElementById("performance").value;
  const resultDiv = document.getElementById("result");

  if (!gender || !event || !performanceStr) {
    resultDiv.textContent =
      "Vyberte prosím pohlaví, disciplínu a zadejte výkon.";
    return;
  }

  const performanceValue = parsePerformance(performanceStr); // Renamed from 'performance'
  if (isNaN(performanceValue)) {
    resultDiv.textContent =
      "Neplatná hodnota výkonu. Použijte čísla nebo formát hh:mm:ss.ff / mm:ss.ff.";
    return;
  }

  if (!coefficientsData[gender] || !coefficientsData[gender][event]) {
    resultDiv.textContent =
      "Koeficienty nebyly nalezeny pro vybrané pohlaví/disciplínu.";
    console.error("Koeficienty nenalezeny pro:", gender, event);
    return;
  }

  const coeffs = coefficientsData[gender][event];
  let points = 0;

  const fieldEvents = [
    "HJ",
    "PV",
    "LJ",
    "TJ",
    "SP",
    "DT",
    "HT",
    "JT",
    "Dec.",
    "Hept.",
    "SHOT",
    "DISCUS",
    "HAMMER",
    "JAVELIN", // Added full names for robustness
    "HIGH JUMP",
    "POLE VAULT",
    "LONG JUMP",
    "TRIPLE JUMP",
  ];
  const isFieldEvent = fieldEvents.some((fe) =>
    event.toUpperCase().includes(fe.toUpperCase())
  );

  if (coeffs.length === 3) {
    const [A, B, C] = coeffs;
    let valueForFormula = performanceValue;

    if (
      event.toUpperCase().includes("HJ") ||
      event.toUpperCase().includes("PV")
    ) {
      valueForFormula = performanceValue * 100; // Convert m to cm for these specific field events
    }

    points = A * Math.pow(valueForFormula, 2) + B * valueForFormula + C;
  } else if (coeffs.length === 1) {
    resultDiv.textContent =
      "Neplatný formát koeficientů pro tuto disciplínu (jedna hodnota).";
    return;
  } else {
    resultDiv.textContent = "Neplatný formát koeficientů pro tuto disciplínu.";
    return;
  }

  points = Math.max(0, Math.floor(points)); // Points cannot be negative

  if (isNaN(points)) {
    resultDiv.textContent =
      "Chyba výpočtu. Zkontrolujte vstupy nebo koeficienty.";
  } else {
    resultDiv.textContent = `Vypočítané body: ${points}`;
  }
}

function formatOutputPerformance(value, eventKey) {
  if (isNaN(value)) return "Chyba výpočtu";

  const eventUpper = eventKey.toUpperCase();
  const isHJ_PV = eventUpper.includes("HJ") || eventUpper.includes("PV");
  const isFieldDistanceHeight = [
    "LJ",
    "TJ",
    "SP",
    "DT",
    "HT",
    "JT",
    "SHOT",
    "DISCUS",
    "HAMMER",
    "JAVELIN",
    "HIGH JUMP",
    "POLE VAULT",
    "LONG JUMP",
    "TRIPLE JUMP",
  ].some((e) => eventUpper.includes(e));
  const isDec_Hept =
    eventUpper.includes("DEC.") || eventUpper.includes("HEPT.");

  if (isDec_Hept) {
    if (value < 0) return "Neplatný výkon (záporné body)";
    return `${Math.round(value)} bodů`;
  } else if (isHJ_PV || isFieldDistanceHeight) {
    if (value < 0) return "Neplatný výkon (záporná vzdálenost/výška)";
    return `${value.toFixed(2)} m`;
  } else {
    // Track event (time)
    if (value < 0) return "Neplatný výkon (záporný čas)";
    const totalSeconds = value;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secondsFull = totalSeconds % 60;
    const secondsInt = Math.floor(secondsFull);
    const hundredths = Math.round((secondsFull - secondsInt) * 100);

    let result = "";
    if (hours > 0) {
      result += `${hours}:`;
      result += `${minutes.toString().padStart(2, "0")}:`;
      result += `${secondsInt.toString().padStart(2, "0")}`;
    } else if (minutes > 0) {
      result += `${minutes}:`;
      result += `${secondsInt.toString().padStart(2, "0")}`;
    } else {
      result += `${secondsInt}`;
    }
    result += `.${hundredths.toString().padStart(2, "0").slice(0, 2)}`; // Ensure two digits for hundredths
    return result;
  }
}

function calculatePerformanceFromPoints() {
  const gender = document.getElementById("gender").value;
  const event = document.getElementById("event").value;
  const pointsStr = document.getElementById("points").value;
  const resultDiv = document.getElementById("result");

  if (!gender || !event || !pointsStr) {
    resultDiv.textContent = "Vyberte pohlaví, disciplínu a zadejte body.";
    return;
  }

  const targetPoints = parseFloat(pointsStr);
  if (isNaN(targetPoints)) {
    resultDiv.textContent = "Neplatná hodnota bodů. Použijte číslo.";
    return;
  }

  if (!coefficientsData[gender] || !coefficientsData[gender][event]) {
    resultDiv.textContent =
      "Koeficienty nebyly nalezeny pro vybrané pohlaví/disciplínu.";
    return;
  }

  const coeffs = coefficientsData[gender][event];
  if (coeffs.length !== 3) {
    resultDiv.textContent =
      "Výpočet výkonu pro tento typ koeficientů není podporován.";
    return;
  }

  const [A, B, C] = coeffs;
  const C_prime = C - targetPoints;
  const discriminant = B * B - 4 * A * C_prime;

  if (discriminant < 0) {
    resultDiv.textContent = "Nelze vypočítat výkon (záporný diskriminant).";
    return;
  }

  const sqrtDiscriminant = Math.sqrt(discriminant);
  let perf1 = (-B + sqrtDiscriminant) / (2 * A);
  let perf2 = (-B - sqrtDiscriminant) / (2 * A);

  const fieldEvents = [
    "HJ",
    "PV",
    "LJ",
    "TJ",
    "SP",
    "DT",
    "HT",
    "JT",
    "Dec.",
    "Hept.",
    "SHOT",
    "DISCUS",
    "HAMMER",
    "JAVELIN",
    "HIGH JUMP",
    "POLE VAULT",
    "LONG JUMP",
    "TRIPLE JUMP",
  ];
  const isFieldEvent = fieldEvents.some((fe) =>
    event.toUpperCase().includes(fe.toUpperCase())
  );

  let calculatedValueFromFormula;

  const positiveRoots = [perf1, perf2].filter((r) => r > 0 && isFinite(r));

  if (positiveRoots.length === 0) {
    resultDiv.textContent = "Nelze vypočítat platný kladný výkon.";
    return;
  } else if (positiveRoots.length === 1) {
    calculatedValueFromFormula = positiveRoots[0];
  } else {
    if (isFieldEvent) {
      calculatedValueFromFormula = Math.max(...positiveRoots);
    } else {
      calculatedValueFromFormula = Math.min(...positiveRoots);
    }
  }

  if (
    typeof calculatedValueFromFormula === "undefined" ||
    isNaN(calculatedValueFromFormula)
  ) {
    resultDiv.textContent = "Chyba při výběru kořene kvadratické rovnice.";
    return;
  }

  let finalPerformance = calculatedValueFromFormula;
  if (
    event.toUpperCase().includes("HJ") ||
    event.toUpperCase().includes("PV")
  ) {
    finalPerformance = calculatedValueFromFormula / 100;
  }

  resultDiv.textContent = `Vypočítaný výkon: ${formatOutputPerformance(
    finalPerformance,
    event
  )}`;
}

document.addEventListener("DOMContentLoaded", () => {
  loadCoefficients();
  const calculateButton = document.getElementById("calculateButton");
  if (calculateButton) {
    calculateButton.addEventListener("click", calculatePoints);
  }
  const calculatePerformanceButton = document.getElementById(
    "calculatePerformanceButton"
  );
  if (calculatePerformanceButton) {
    calculatePerformanceButton.addEventListener(
      "click",
      calculatePerformanceFromPoints
    );
  }
});
