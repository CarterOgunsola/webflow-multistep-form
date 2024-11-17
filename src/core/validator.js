// src/core/Validator.js
class Validator {
  constructor(form) {
    this.form = form;
    this.validationRules = new Map();
    this.customValidators = new Map();

    // Setup default validators
    this.setupDefaultValidators();
  }

  setupDefaultValidators() {
    this.customValidators.set("required", (value) => ({
      valid: value.trim().length > 0,
      message: "This field is required",
    }));

    this.customValidators.set("email", (value) => ({
      valid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      message: "Please enter a valid email address",
    }));

    this.customValidators.set("phone", (value) => ({
      valid: /^[\d\s\-+()]{7,}$/.test(value),
      message: "Please enter a valid phone number",
    }));

    this.customValidators.set("minLength", (value, length) => ({
      valid: value.length >= length,
      message: `Must be at least ${length} characters`,
    }));

    this.customValidators.set("maxLength", (value, length) => ({
      valid: value.length <= length,
      message: `Must be no more than ${length} characters`,
    }));

    this.customValidators.set("pattern", (value, pattern) => ({
      valid: new RegExp(pattern).test(value),
      message: "Please match the requested format",
    }));
  }

  init() {
    // Set up validation from data attributes
    this.setupFieldValidations();

    // Add real-time validation listeners
    this.setupValidationListeners();
  }

  setupFieldValidations() {
    const fields = this.form.querySelectorAll("[data-validate]");

    fields.forEach((field) => {
      const rules = field.getAttribute("data-validate").split(" ");
      this.validationRules.set(field, rules);
    });
  }

  setupValidationListeners() {
    this.form.querySelectorAll("input, select, textarea").forEach((field) => {
      if (this.validationRules.has(field)) {
        field.addEventListener("blur", () => this.validateField(field));
        field.addEventListener("input", () => {
          // Remove error states while typing
          this.clearError(field);
        });
      }
    });
  }

  validateField(field) {
    const rules = this.validationRules.get(field);
    if (!rules) return true;

    let isValid = true;
    let errorMessage = "";

    for (const ruleString of rules) {
      let ruleName, ruleValue;

      // Check if rule has a value (e.g., minLength:3)
      if (ruleString.includes(":")) {
        [ruleName, ruleValue] = ruleString.split(":");
      } else {
        ruleName = ruleString;
      }

      const validator = this.customValidators.get(ruleName);
      if (validator) {
        const result = validator(field.value, ruleValue);
        if (!result.valid) {
          isValid = false;
          errorMessage =
            field.getAttribute("data-error-message") || result.message;
          break;
        }
      }
    }

    if (!isValid) {
      this.showError(field, errorMessage);
    } else {
      this.clearError(field);
    }

    return isValid;
  }

  validateStep(stepElement) {
    const fields = stepElement.querySelectorAll("input, select, textarea");
    let isStepValid = true;

    fields.forEach((field) => {
      if (this.validationRules.has(field)) {
        if (!this.validateField(field)) {
          isStepValid = false;
        }
      }
    });

    return isStepValid;
  }

  validateAllSteps() {
    const steps = this.form.querySelectorAll("[data-form-step]");
    let isValid = true;

    steps.forEach((step) => {
      if (!this.validateStep(step)) {
        isValid = false;
      }
    });

    return isValid;
  }

  showError(field, message) {
    // Add error state to field
    field.setAttribute("data-invalid", "");

    // Create or update error message
    let errorElement = field.parentElement.querySelector(".form-error-message");
    if (!errorElement) {
      errorElement = document.createElement("div");
      errorElement.className = "form-error-message";
      field.parentElement.appendChild(errorElement);
    }
    errorElement.textContent = message;
  }

  clearError(field) {
    field.removeAttribute("data-invalid");
    const errorElement = field.parentElement.querySelector(
      ".form-error-message"
    );
    if (errorElement) {
      errorElement.remove();
    }
  }

  clearAllErrors() {
    this.form.querySelectorAll("[data-invalid]").forEach((field) => {
      this.clearError(field);
    });
  }

  // Add custom validator
  addValidator(name, validatorFn) {
    this.customValidators.set(name, validatorFn);
  }
}

export default Validator;
