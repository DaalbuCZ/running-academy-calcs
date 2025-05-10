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

  const validRoots = [perf1, perf2].filter((r) => isFinite(r) && r > 0);

  if (validRoots.length === 0) {
    resultDiv.textContent = "Nelze vypočítat platný kladný výkon.";
    return;
  } else if (validRoots.length === 1) {
    calculatedValueFromFormula = validRoots[0];
  } else {
    calculatedValueFromFormula = Math.min(...validRoots);
  }

  if (calculatedValueFromFormula < 0) {
    resultDiv.textContent =
      "Vypočítaný výkon je záporný, což není platné pro čas.";
    return;
  }

  const formattedPerformance = formatOutputPerformance(
    calculatedValueFromFormula,
    event
  );
  resultDiv.textContent = `Odpovídající výkon: ${formattedPerformance}`;
}

document.addEventListener("DOMContentLoaded", () => {
  loadCoefficients();
  document
    .getElementById("calculateButton")
    .addEventListener("click", calculatePoints);
  document
    .getElementById("calculatePerformanceButton")
    .addEventListener("click", calculatePerformanceFromPoints);
});
