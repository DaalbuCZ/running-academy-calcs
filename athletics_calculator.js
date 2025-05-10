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

  let isShortTrack = false;
  if (name.includes(" sh")) {
    isShortTrack = true;
    name = name.replace(" sh", "").trim(); // Remove sh and trim potential space
  }
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
      populateEventDropdown(); // This will also trigger event population
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

  // Define a custom sort order
  const customOrder = [
    // Sprints & Hurdles (shortest to longest, track then indoor if applicable)
    "50m",
    "50m sh",
    "50mH",
    "55m",
    "55m sh", // Added "sh" variant for completeness if it exists
    "55mH",
    "55mH sh", // Added "sh" variant
    "60m",
    "60m sh",
    "60mH",
    "60mH sh", // Added "sh" variant
    "100m",
    "100m sh",
    // "100mH", // Standard Women's Hurdles - add if key exists in data
    "110mH", // Typically Men's Hurdles
    "150m",
    "150m sh",
    "200m",
    "200m sh",
    "300m",
    "300m sh",
    "400m",
    "400m sh",
    "400mH",

    // Middle Distances (track then indoor, including miles and SC)
    "500m",
    "500m sh",
    "600m",
    "600m sh",
    "800m",
    "800m sh",
    "1000m",
    "1000m sh",
    "1500m",
    "1500m sh",
    "Mile",
    "Mile sh",
    "2000m",
    "2000m sh",
    "2000mSC",
    "2000mSC sh",
    "2 Miles",
    "2 Miles sh",
    "3000m",
    "3000m sh",
    "3000mSC",
    "3000mSC sh",

    // Long Distances (track then indoor)
    "5000m",
    "5000m sh",
    "10000m",
    "10000m sh",

    // Road Races (shortest to longest)
    "Road Mile",
    "Road 5 km", // Key from user's example
    "Road 5K", // Keep old key in case it's used for other gender/data
    "Road 10 km", // Key from user's example
    "Road 10K", // Keep old key
    "Road 10 Miles",
    "Road 15 km", // Key from user's example
    "Road 15K", // Keep old key
    "Road 20 km", // Key from user's example
    "Road 20K", // Keep old key
    "Road 25 km", // Key from user's example
    "Road HM",
    "Road 30 km", // Key from user's example
    "Road Marathon",
    "Road 100 km", // Key from user's example
    "Road 100K", // Keep old key

    // Walks (ensure keys match data, e.g., 10000mW vs 10,000mW)
    "3000mW",
    "3000mW sh",
    "5000mW",
    "5000mW sh",
    "10000mW",
    "10000mW sh", // Assuming 10000mW is the key
    "10kmW",
    "20000mW",
    "20000mW sh", // Assuming 20000mW is the key
    "20kmW",
    "30kmW",
    "35kmW",
    "50kmW",

    // Jumps
    "HJ",
    "HJ sh",
    "PV",
    "PV sh",
    "LJ",
    "LJ sh",
    "TJ",
    "TJ sh",

    // Throws
    "SP",
    "SP sh",
    "DT",
    "DT sh",
    "HT",
    "HT sh",
    "JT",
    "JT sh",
    "BT",
    "BT sh",

    // Combined Events
    "Pentathlon",
    "Pentathlon sh",
    "Heptathlon",
    "Heptathlon sh",
    "Decathlon",
    "Decathlon sh",
  ];

  if (gender && coefficientsData[gender]) {
    let eventKeys = Object.keys(coefficientsData[gender]);

    // Sort eventKeys based on customOrder
    eventKeys.sort((a, b) => {
      let indexA = customOrder.indexOf(a);
      let indexB = customOrder.indexOf(b);

      // If both are in customOrder, sort by their order
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      // If only a is in customOrder, a comes first
      if (indexA !== -1) {
        return -1;
      }
      // If only b is in customOrder, b comes first
      if (indexB !== -1) {
        return 1;
      }
      // If neither is in customOrder, sort alphabetically
      return a.localeCompare(b);
    });

    eventKeys.forEach((event) => {
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
  return parseFloat(performanceStr); // Keep basic float parsing for potential other uses or simplify further
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
  const resultDiv = document.getElementById("result");
  let performanceValue;

  // Always read from time input fields
  const hoursInput = document.getElementById("perfHours");
  const minutesInput = document.getElementById("perfMinutes");
  const secondsInput = document.getElementById("perfSeconds");
  const fractionsInput = document.getElementById("perfFractions");

  const hours = parseFloat(hoursInput.value) || 0;
  const minutes = parseFloat(minutesInput.value) || 0;
  const seconds = parseFloat(secondsInput.value) || 0;
  const fractions = parseFloat(fractionsInput.value) || 0;

  // Check if all fields are truly empty (not just '0' if user typed it and then deleted)
  const allFieldsEmpty =
    hoursInput.value.trim() === "" &&
    minutesInput.value.trim() === "" &&
    secondsInput.value.trim() === "" &&
    fractionsInput.value.trim() === "";

  if (!gender || !event) {
    resultDiv.textContent = "Vyberte prosím pohlaví a disciplínu.";
    return;
  }

  if (allFieldsEmpty) {
    resultDiv.textContent = "Zadejte prosím výkon.";
    return;
  }

  performanceValue = hours * 3600 + minutes * 60 + seconds + fractions / 100;

  if (isNaN(performanceValue)) {
    resultDiv.textContent =
      "Neplatná hodnota výkonu. Zkontrolujte zadané údaje.";
    return;
  }

  // Ensure performanceValue is not negative, though inputs are min="0"
  if (performanceValue < 0) {
    resultDiv.textContent = "Výkon nemůže být záporný.";
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

  if (coeffs.length === 3) {
    const [A, B, C] = coeffs;
    points = A * Math.pow(performanceValue, 2) + B * performanceValue + C;
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
  result += `.${hundredths.toString().padStart(2, "0").slice(0, 2)}`;
  return result;
}

document.addEventListener("DOMContentLoaded", () => {
  loadCoefficients();
  document
    .getElementById("calculateButton")
    .addEventListener("click", calculatePoints);
});
