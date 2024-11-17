class StepManager {
  constructor(form) {
    this.form = form;
    this.steps = Array.from(this.form.querySelectorAll("[data-form-step]"));
    this.currentStepIndex = 0;
    this.totalSteps = this.steps.length;
  }
  getCurrentStep() {
    return this.steps[this.currentStepIndex];
  }
  getCurrentStepIndex() {
    return this.currentStepIndex;
  }
  getTotalSteps() {
    return this.totalSteps;
  }
  goToStep(index) {
    if (index >= 0 && index < this.totalSteps) {
      this.currentStepIndex = index;
      this.updateStepStates();
      return true;
    }
    return false;
  }
  next() {
    return this.goToStep(this.currentStepIndex + 1);
  }
  previous() {
    return this.goToStep(this.currentStepIndex - 1);
  }
  hasNext() {
    return this.currentStepIndex < this.totalSteps - 1;
  }
  hasPrevious() {
    return this.currentStepIndex > 0;
  }
  updateStepStates() {
    this.steps.forEach((step, index) => {
      step.removeAttribute("data-form-step-active");
      step.removeAttribute("data-form-step-completed");
      step.removeAttribute("data-form-step-upcoming");
      if (index === this.currentStepIndex) {
        step.setAttribute("data-form-step-active", "");
        step.style.display = "block";
      } else if (index < this.currentStepIndex) {
        step.setAttribute("data-form-step-completed", "");
        step.style.display = "none";
      } else {
        step.setAttribute("data-form-step-upcoming", "");
        step.style.display = "none";
      }
    });
    this.form.setAttribute("data-form-step-index", this.currentStepIndex);
    this.form.setAttribute("data-form-step-count", this.totalSteps);
    this.form.dispatchEvent(
      new CustomEvent("stepChange", {
        detail: {
          currentStep: this.currentStepIndex,
          totalSteps: this.totalSteps,
          isFirstStep: !this.hasPrevious(),
          isLastStep: !this.hasNext()
        }
      })
    );
  }
}
class FormMemory {
  constructor(form) {
    this.form = form;
    this.formId = this.form.id;
    this.storageKey = `wf-form-${this.formId}`;
    this.autoSaveInterval = null;
    this.handleInput = this.handleInput.bind(this);
    this.saveProgress = this.saveProgress.bind(this);
    this.restoreProgress = this.restoreProgress.bind(this);
  }
  init() {
    this.form.addEventListener("input", this.handleInput);
    this.restoreProgress();
    this.autoSaveInterval = setInterval(this.saveProgress, 3e4);
    window.addEventListener("beforeunload", () => {
      this.saveProgress();
    });
  }
  handleInput(event) {
    if (event.target.type === "password") return;
    if (this.saveTimeout) clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => this.saveProgress(), 1e3);
  }
  saveProgress() {
    const formData = {};
    const fields = this.form.querySelectorAll("input, select, textarea");
    fields.forEach((field) => {
      if (field.type === "submit" || field.type === "password") return;
      switch (field.type) {
        case "checkbox":
        case "radio":
          if (field.checked) {
            formData[field.name] = field.value;
          }
          break;
        case "file":
          break;
        default:
          if (field.value) {
            formData[field.name] = field.value;
          }
      }
    });
    try {
      localStorage.setItem(
        this.storageKey,
        JSON.stringify({
          timestamp: Date.now(),
          data: formData,
          currentStep: this.form.getAttribute("data-form-step-index") || 0
        })
      );
      this.form.dispatchEvent(new CustomEvent("formProgressSaved"));
    } catch (error) {
      console.warn("Failed to save form progress:", error);
    }
  }
  restoreProgress() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (!saved) return false;
      const { data, timestamp, currentStep } = JSON.parse(saved);
      const MAX_AGE = 24 * 60 * 60 * 1e3;
      if (Date.now() - timestamp > MAX_AGE) {
        this.clearSavedProgress();
        return false;
      }
      Object.entries(data).forEach(([name, value]) => {
        const fields = this.form.querySelectorAll(`[name="${name}"]`);
        fields.forEach((field) => {
          switch (field.type) {
            case "checkbox":
            case "radio":
              field.checked = field.value === value;
              break;
            default:
              field.value = value;
          }
        });
      });
      if (currentStep) {
        this.form.dispatchEvent(
          new CustomEvent("restoreStep", {
            detail: { step: parseInt(currentStep, 10) }
          })
        );
      }
      this.form.dispatchEvent(
        new CustomEvent("formProgressRestored", {
          detail: { timestamp }
        })
      );
      return true;
    } catch (error) {
      console.warn("Failed to restore form progress:", error);
      return false;
    }
  }
  clearSavedProgress() {
    try {
      localStorage.removeItem(this.storageKey);
      return true;
    } catch (error) {
      console.warn("Failed to clear form progress:", error);
      return false;
    }
  }
  destroy() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.form.removeEventListener("input", this.handleInput);
  }
}
class QueryParams {
  constructor(form) {
    this.form = form;
  }
  init() {
    if (this.form.hasAttribute("data-form-prefill")) {
      this.prefillFromQueryParams();
    }
    const stepParam = this.getQueryParam("step");
    if (stepParam) {
      this.form.dispatchEvent(
        new CustomEvent("goToStep", {
          detail: { step: parseInt(stepParam, 10) - 1 }
        })
      );
    }
  }
  getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }
  prefillFromQueryParams() {
    const fields = this.form.querySelectorAll("[data-param]");
    fields.forEach((field) => {
      const paramName = field.getAttribute("data-param");
      const paramValue = this.getQueryParam(paramName);
      if (paramValue) {
        switch (field.type) {
          case "checkbox":
            field.checked = paramValue.toLowerCase() === "true";
            break;
          case "radio":
            if (field.value === paramValue) {
              field.checked = true;
            }
            break;
          default:
            field.value = paramValue;
        }
        field.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });
  }
}
class Validator {
  constructor(form) {
    this.form = form;
    this.validationRules = /* @__PURE__ */ new Map();
    this.customValidators = /* @__PURE__ */ new Map();
    this.setupDefaultValidators();
  }
  setupDefaultValidators() {
    this.customValidators.set("required", (value) => ({
      valid: value.trim().length > 0,
      message: "This field is required"
    }));
    this.customValidators.set("email", (value) => ({
      valid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      message: "Please enter a valid email address"
    }));
    this.customValidators.set("phone", (value) => ({
      valid: /^[\d\s\-+()]{7,}$/.test(value),
      message: "Please enter a valid phone number"
    }));
    this.customValidators.set("minLength", (value, length) => ({
      valid: value.length >= length,
      message: `Must be at least ${length} characters`
    }));
    this.customValidators.set("maxLength", (value, length) => ({
      valid: value.length <= length,
      message: `Must be no more than ${length} characters`
    }));
    this.customValidators.set("pattern", (value, pattern) => ({
      valid: new RegExp(pattern).test(value),
      message: "Please match the requested format"
    }));
  }
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
        const result = validator(field.value, ruleValue);
        if (!result.valid) {
          isValid = false;
          errorMessage = field.getAttribute("data-error-message") || result.message;
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
class WebflowMultiStepForm {
  constructor(formElement) {
    if (!(formElement instanceof Element)) {
      throw new Error("A form element must be passed to the constructor");
    }
    this.form = formElement;
    this.stepManager = new StepManager(this.form);
    this.formMemory = new FormMemory(this.form);
    this.queryParams = new QueryParams(this.form);
    this.validator = new Validator(this.form);
    this.steps = Array.from(this.form.querySelectorAll("[data-form-step]"));
    this.nextButtons = Array.from(
      this.form.querySelectorAll('[data-form-navigation="next"]')
    );
    this.prevButtons = Array.from(
      this.form.querySelectorAll('[data-form-navigation="prev"]')
    );
    this.currentStepIndex = 0;
    this.init();
  }
  init() {
    this.validator.init();
    if (this.form.getAttribute("data-form-memory") !== "false") {
      this.formMemory.init();
    }
    this.queryParams.init();
    this.updateStepStates();
    this.nextButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        this.nextStep();
      });
    });
    this.prevButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        this.previousStep();
      });
    });
    this.updateNavigationState();
    this.form.addEventListener("submit", (e) => this.handleSubmit(e));
    this.setupEventListeners();
    this.setupKeyboardNavigation();
  }
  setupEventListeners() {
    this.form.addEventListener(
      "stepChange",
      () => this.updateNavigationState()
    );
    this.form.addEventListener("restoreStep", (e) => {
      this.goToStep(e.detail.step);
    });
    this.form.addEventListener("goToStep", (e) => {
      this.goToStep(e.detail.step);
    });
    if (this.form.getAttribute("data-form-memory") !== "false") {
      this.form.addEventListener("formProgressSaved", () => {
        this.showSavedFeedback();
      });
    }
  }
  setupKeyboardNavigation() {
    this.form.addEventListener("keydown", (e) => {
      if (this.form.getAttribute("data-keyboard-nav") !== "true") return;
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.nextStep();
      } else if (e.key === "Enter" && e.shiftKey) {
        e.preventDefault();
        this.previousStep();
      }
    });
  }
  updateStepStates() {
    this.steps.forEach((step, index) => {
      step.removeAttribute("data-form-step-active");
      step.removeAttribute("data-form-step-completed");
      step.removeAttribute("data-form-step-upcoming");
      if (index === this.currentStepIndex) {
        step.setAttribute("data-form-step-active", "");
        step.style.display = "block";
        const firstInput = step.querySelector("input, select, textarea");
        if (firstInput) firstInput.focus();
      } else if (index < this.currentStepIndex) {
        step.setAttribute("data-form-step-completed", "");
        step.style.display = "none";
      } else {
        step.setAttribute("data-form-step-upcoming", "");
        step.style.display = "none";
      }
    });
    this.form.setAttribute("data-form-step-index", this.currentStepIndex);
    this.form.setAttribute("data-form-step-count", this.steps.length);
    if (this.form.getAttribute("data-auto-scroll") !== "false") {
      this.form.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
  updateNavigationState() {
    this.prevButtons.forEach((button) => {
      button.removeAttribute("data-navigation-disabled");
      button.removeAttribute("data-navigation-hidden");
      if (this.currentStepIndex === 0) {
        button.setAttribute("data-navigation-disabled", "");
        button.disabled = true;
      } else {
        button.removeAttribute("data-navigation-disabled");
        button.disabled = false;
      }
    });
    this.nextButtons.forEach((button) => {
      button.removeAttribute("data-navigation-disabled");
      button.removeAttribute("data-navigation-hidden");
      button.removeAttribute("data-navigation-final");
      if (this.currentStepIndex === this.steps.length - 1) {
        button.setAttribute("data-navigation-disabled", "");
        button.disabled = true;
      } else if (this.currentStepIndex === this.steps.length - 2) {
        button.setAttribute("data-navigation-final", "");
        button.disabled = false;
      } else {
        button.removeAttribute("data-navigation-disabled");
        button.disabled = false;
      }
    });
  }
  nextStep() {
    const currentStep = this.steps[this.currentStepIndex];
    if (this.validator.validateStep(currentStep)) {
      if (this.currentStepIndex < this.steps.length - 1) {
        this.currentStepIndex++;
        this.updateStepStates();
        this.updateNavigationState();
        if (this.form.getAttribute("data-form-memory") !== "false") {
          this.formMemory.saveProgress();
        }
        this.form.dispatchEvent(
          new CustomEvent("stepComplete", {
            detail: { step: this.currentStepIndex - 1 }
          })
        );
      }
    }
  }
  previousStep() {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      this.updateStepStates();
      this.updateNavigationState();
      if (this.form.getAttribute("data-form-memory") !== "false") {
        this.formMemory.saveProgress();
      }
    }
  }
  goToStep(stepIndex) {
    if (stepIndex >= 0 && stepIndex < this.steps.length) {
      let canProceed = true;
      for (let i = 0; i < stepIndex; i++) {
        if (!this.validator.validateStep(this.steps[i])) {
          canProceed = false;
          this.currentStepIndex = i;
          break;
        }
      }
      if (canProceed) {
        this.currentStepIndex = stepIndex;
      }
      this.updateStepStates();
      this.updateNavigationState();
    }
  }
  handleSubmit(event) {
    if (this.currentStepIndex !== this.steps.length - 1 || !this.validator.validateAllSteps()) {
      event.preventDefault();
      alert("Please complete all required fields correctly before submitting.");
      return;
    }
    if (this.form.getAttribute("data-form-memory") !== "false") {
      this.formMemory.clearSavedProgress();
    }
    this.form.dispatchEvent(new CustomEvent("formValid"));
  }
  resetForm() {
    this.form.reset();
    this.validator.clearAllErrors();
    if (this.form.getAttribute("data-form-memory") !== "false") {
      this.formMemory.clearSavedProgress();
    }
    this.goToStep(0);
  }
  showSavedFeedback() {
    let saveIndicator = this.form.querySelector(".form-save-indicator");
    if (!saveIndicator) {
      saveIndicator = document.createElement("div");
      saveIndicator.className = "form-save-indicator";
      this.form.appendChild(saveIndicator);
    }
    saveIndicator.textContent = "Progress saved";
    saveIndicator.style.opacity = "1";
    setTimeout(() => {
      saveIndicator.style.opacity = "0";
    }, 2e3);
  }
  destroy() {
    if (this.form.getAttribute("data-form-memory") !== "false") {
      this.formMemory.destroy();
    }
    this.nextButtons.forEach((button) => {
      button.removeEventListener("click", this.nextStep);
    });
    this.prevButtons.forEach((button) => {
      button.removeEventListener("click", this.previousStep);
    });
    this.form.removeEventListener("submit", this.handleSubmit);
    this.validator.clearAllErrors();
  }
}
class MultiStepFormInitializer {
  static init() {
    const forms = document.querySelectorAll("[data-multi-step-form]");
    forms.forEach((form) => {
      if (!form.id) {
        form.id = `msf-${Math.random().toString(36).substr(2, 9)}`;
      }
      const multiStepForm = new WebflowMultiStepForm(form);
      form._multiStepForm = multiStepForm;
    });
  }
}
if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    () => MultiStepFormInitializer.init()
  );
} else {
  MultiStepFormInitializer.init();
}
window.WebflowMultiStepForm = {
  init: MultiStepFormInitializer.init,
  create: (form) => new WebflowMultiStepForm(form)
};
export {
  WebflowMultiStepForm,
  MultiStepFormInitializer as default
};
//# sourceMappingURL=webflow-multistep-form.esm.js.map
