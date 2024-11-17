// src/core/WebflowMultiStepForm.js
import StepManager from "./StepManager.js";
import FormMemory from "./FormMemory.js";
import QueryParams from "./QueryParams.js";
import Validator from "./Validator.js";

class WebflowMultiStepForm {
  constructor(formElement) {
    if (!(formElement instanceof Element)) {
      throw new Error("A form element must be passed to the constructor");
    }

    this.form = formElement;

    // Initialize core modules
    this.stepManager = new StepManager(this.form);
    this.formMemory = new FormMemory(this.form);
    this.queryParams = new QueryParams(this.form);
    this.validator = new Validator(this.form);

    // Initialize properties scoped to this specific form instance
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
    // Initialize validator
    this.validator.init();

    // Initialize form memory if not disabled
    if (this.form.getAttribute("data-form-memory") !== "false") {
      this.formMemory.init();
    }

    // Initialize query parameters
    this.queryParams.init();

    // Set initial step states
    this.updateStepStates();

    // Add event listeners to navigation buttons
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

    // Update navigation state
    this.updateNavigationState();

    // Prevent form submission until last step and validation passes
    this.form.addEventListener("submit", (e) => this.handleSubmit(e));

    // Listen for events
    this.setupEventListeners();

    // Add keyboard navigation
    this.setupKeyboardNavigation();
  }

  setupEventListeners() {
    // Listen for step changes to update navigation
    this.form.addEventListener("stepChange", () =>
      this.updateNavigationState()
    );

    // Listen for form memory restore events
    this.form.addEventListener("restoreStep", (e) => {
      this.goToStep(e.detail.step);
    });

    // Listen for goToStep events from query params
    this.form.addEventListener("goToStep", (e) => {
      this.goToStep(e.detail.step);
    });

    // Listen for form progress events
    if (this.form.getAttribute("data-form-memory") !== "false") {
      this.form.addEventListener("formProgressSaved", () => {
        this.showSavedFeedback();
      });
    }
  }

  setupKeyboardNavigation() {
    this.form.addEventListener("keydown", (e) => {
      // Only handle keyboard navigation if enabled
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
      // Remove all possible states first
      step.removeAttribute("data-form-step-active");
      step.removeAttribute("data-form-step-completed");
      step.removeAttribute("data-form-step-upcoming");

      // Set appropriate state
      if (index === this.currentStepIndex) {
        step.setAttribute("data-form-step-active", "");
        step.style.display = "block";
        // Focus first field in step
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

    // Update form state
    this.form.setAttribute("data-form-step-index", this.currentStepIndex);
    this.form.setAttribute("data-form-step-count", this.steps.length);

    // Scroll to top of form
    if (this.form.getAttribute("data-auto-scroll") !== "false") {
      this.form.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  updateNavigationState() {
    // Update previous buttons
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

    // Update next buttons
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

    // Validate current step before proceeding
    if (this.validator.validateStep(currentStep)) {
      if (this.currentStepIndex < this.steps.length - 1) {
        this.currentStepIndex++;
        this.updateStepStates();
        this.updateNavigationState();

        // Save progress if enabled
        if (this.form.getAttribute("data-form-memory") !== "false") {
          this.formMemory.saveProgress();
        }

        // Dispatch step complete event
        this.form.dispatchEvent(
          new CustomEvent("stepComplete", {
            detail: { step: this.currentStepIndex - 1 },
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

      // Save progress if enabled
      if (this.form.getAttribute("data-form-memory") !== "false") {
        this.formMemory.saveProgress();
      }
    }
  }

  goToStep(stepIndex) {
    if (stepIndex >= 0 && stepIndex < this.steps.length) {
      // Validate all steps before the target step
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
    // Validate all steps before submission
    if (
      this.currentStepIndex !== this.steps.length - 1 ||
      !this.validator.validateAllSteps()
    ) {
      event.preventDefault();
      alert("Please complete all required fields correctly before submitting.");
      return;
    }

    // Clear saved progress if form memory is enabled
    if (this.form.getAttribute("data-form-memory") !== "false") {
      this.formMemory.clearSavedProgress();
    }

    // Dispatch form valid event
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
    }, 2000);
  }

  destroy() {
    // Cleanup form memory
    if (this.form.getAttribute("data-form-memory") !== "false") {
      this.formMemory.destroy();
    }

    // Remove navigation listeners
    this.nextButtons.forEach((button) => {
      button.removeEventListener("click", this.nextStep);
    });

    this.prevButtons.forEach((button) => {
      button.removeEventListener("click", this.previousStep);
    });

    // Remove form listeners
    this.form.removeEventListener("submit", this.handleSubmit);

    // Clear any remaining error states
    this.validator.clearAllErrors();
  }
}

export default WebflowMultiStepForm;
