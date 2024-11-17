// src/core/Validator.js
class Validator {
  constructor(form) {
    this.form = form;
    this.validationRules = new Map();
    this.customValidators = new Map();
    this.locale = document.documentElement.lang || "en";
    this.messages = {
      required: "This field is required",
      email: "Please check your email address",
      phone: "Please check your phone number",
      minLength: (length) => `Minimum ${length} characters`,
      maxLength: (length) => `Maximum ${length} characters`,
      pattern: "Please check the format",
      number: "Please enter a valid number",
      date: "Please enter a valid date",
      fileSize: "File is too large",
      fileType: "File type not allowed",
    };

    // Setup default validators
    this.setupDefaultValidators();
  }

  setupDefaultValidators() {
    // Required field - accepts any non-whitespace including Unicode
    this.customValidators.set("required", (value) => ({
      valid: String(value).trim().length > 0,
      message: this.messages.required,
    }));

    // Email - Unicode support + TLD optional
    this.customValidators.set("email", (value) => ({
      valid: value.length === 0 || this.validateEmail(value),
      message: this.messages.email,
    }));

    // Phone - International format support
    this.customValidators.set("phone", (value) => ({
      valid: value.length === 0 || this.validatePhone(value),
      message: this.messages.phone,
    }));

    // Length validation with Unicode support
    this.customValidators.set("minLength", (value, length) => ({
      valid: [...String(value)].length >= Number(length),
      message: this.messages.minLength(length),
    }));

    this.customValidators.set("maxLength", (value, length) => ({
      valid: [...String(value)].length <= Number(length),
      message: this.messages.maxLength(length),
    }));

    // Number validation with localization
    this.customValidators.set("number", (value, params = "") => {
      if (value.length === 0) return { valid: true };

      // Handle different number formats
      const [min, max] = params
        .split(",")
        .map((p) => (p ? parseFloat(p) : null));
      const normalizedValue = this.normalizeNumber(value);

      if (isNaN(normalizedValue)) {
        return { valid: false, message: this.messages.number };
      }

      if (min !== null && normalizedValue < min) {
        return { valid: false, message: `Value must be at least ${min}` };
      }

      if (max !== null && normalizedValue > max) {
        return { valid: false, message: `Value must be no more than ${max}` };
      }

      return { valid: true };
    });

    // Date validation with flexible formats
    this.customValidators.set("date", (value, format = "") => {
      if (value.length === 0) return { valid: true };
      return {
        valid: this.validateDate(value, format),
        message: this.messages.date,
      };
    });

    // File validation
    this.customValidators.set("file", (value, params = "") => {
      if (!value || !value.length) return { valid: true };

      const [maxSize, allowedTypes] = params.split(",");
      const file = value[0];

      if (maxSize && file.size > maxSize * 1024 * 1024) {
        return { valid: false, message: this.messages.fileSize };
      }

      if (allowedTypes && !allowedTypes.split("|").includes(file.type)) {
        return { valid: false, message: this.messages.fileType };
      }

      return { valid: true };
    });

    // Flexible pattern matching with flags
    this.customValidators.set("pattern", (value, patternString) => {
      if (value.length === 0) return { valid: true };
      try {
        const [pattern, flags = ""] = patternString.split("|");
        return {
          valid: new RegExp(pattern, flags).test(value),
          message: this.messages.pattern,
        };
      } catch (e) {
        console.warn("Invalid regex pattern:", e);
        return { valid: true };
      }
    });
  }

  validateEmail(email) {
    // Basic structure check
    if (!/^[^@\s]+@[^@\s]+/.test(email)) return false;

    try {
      // Split into local and domain parts
      const [local, domain] = email.split("@");

      // Local part checks
      if (local.length > 64) return false;

      // Domain checks (more permissive)
      const domainParts = domain.split(".");
      return domainParts.every((part) => part.length > 0 && part.length <= 63);
    } catch (e) {
      return false;
    }
  }

  validatePhone(phone) {
    // Remove all formatting characters
    const stripped = phone.replace(/[\s\-.()\u2000-\u206F\u2E00-\u2E7F]/g, "");

    // Allow for various international formats
    // Minimum 5 digits (some old phone numbers)
    // Maximum 15 digits (ITU-T recommendation)
    // Optional + at start
    return /^\+?\d{5,15}$/.test(stripped);
  }

  validateDate(value, format) {
    if (!value) return false;

    // Try parsing as ISO date first
    let date = new Date(value);
    if (!isNaN(date.getTime())) return true;

    // If format is specified, try parsing with format
    if (format) {
      try {
        // Simple format parsing (can be expanded)
        const formatParts = format.split(/[-/]/);
        const valueParts = value.split(/[-/]/);

        if (formatParts.length !== valueParts.length) return false;

        const dateObj = {};
        formatParts.forEach((part, i) => {
          dateObj[part.toLowerCase()] = parseInt(valueParts[i], 10);
        });

        date = new Date(
          dateObj.yyyy || dateObj.yy + 2000,
          (dateObj.mm || 1) - 1,
          dateObj.dd || 1
        );

        return !isNaN(date.getTime());
      } catch (e) {
        return false;
      }
    }

    return false;
  }

  normalizeNumber(value) {
    // Handle different number formats (1,234.56 or 1.234,56)
    const cleaned = value.replace(/[^\d,.-]/g, "");

    // Detect format based on position of . and ,
    const lastDot = cleaned.lastIndexOf(".");
    const lastComma = cleaned.lastIndexOf(",");

    if (lastDot > lastComma) {
      // 1,234.56 format
      return parseFloat(cleaned.replace(/,/g, ""));
    } else if (lastComma > lastDot) {
      // 1.234,56 format
      return parseFloat(cleaned.replace(/\./g, "").replace(",", "."));
    }

    return parseFloat(cleaned);
  }

  // Rest of the class implementation remains the same...
  init() {
    this.setupFieldValidations();
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

      if (ruleString.includes(":")) {
        [ruleName, ruleValue] = ruleString.split(":");
      } else {
        ruleName = ruleString;
      }

      const validator = this.customValidators.get(ruleName);
      if (validator) {
        const value = field.type === "file" ? field.files : field.value;
        const result = validator(value, ruleValue);
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
    field.setAttribute("data-invalid", "");
    field.setAttribute("aria-invalid", "true");

    let errorElement = field.parentElement.querySelector(".form-error-message");
    if (!errorElement) {
      errorElement = document.createElement("div");
      errorElement.className = "form-error-message";
      errorElement.setAttribute("role", "alert");
      field.parentElement.appendChild(errorElement);
    }
    errorElement.textContent = message;
  }

  clearError(field) {
    field.removeAttribute("data-invalid");
    field.removeAttribute("aria-invalid");
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

  setMessages(messages) {
    this.messages = { ...this.messages, ...messages };
  }

  setLocale(locale) {
    this.locale = locale;
  }

  addValidator(name, validatorFn) {
    this.customValidators.set(name, validatorFn);
  }
}

export default Validator;
