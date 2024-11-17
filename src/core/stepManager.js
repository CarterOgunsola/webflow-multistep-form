class StepManager {
  constructor(form) {
    this.form = form;
    this.steps = Array.from(this.form.querySelectorAll("[data-form-step]"));
    this.currentStepIndex = 0;
    this.totalSteps = this.steps.length;

    // Optional: Select progress indicators if they exist
    this.progressIndicators = Array.from(
      this.form.querySelectorAll('[data-form="progress-indicator"]')
    );
    this.customProgressIndicators = Array.from(
      this.form.querySelectorAll('[data-form="custom-progress-indicator"]')
    );
  }

  // Getters for current state
  getCurrentStep() {
    return this.steps[this.currentStepIndex];
  }

  getCurrentStepIndex() {
    return this.currentStepIndex;
  }

  getTotalSteps() {
    return this.totalSteps;
  }

  // Navigate to a specific step
  goToStep(index) {
    if (index >= 0 && index < this.totalSteps) {
      this.currentStepIndex = index;
      this.updateStepStates();
      this.updateProgressIndicators();
      return true;
    }
    return false;
  }

  // Navigate forward
  next() {
    return this.goToStep(this.currentStepIndex + 1);
  }

  // Navigate backward
  previous() {
    return this.goToStep(this.currentStepIndex - 1);
  }

  // Update visual state of steps
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

    // Update progress indicators
    this.updateProgressIndicators();

    this.form.dispatchEvent(
      new CustomEvent("stepChange", {
        detail: {
          currentStep: this.currentStepIndex,
          totalSteps: this.totalSteps,
          isFirstStep: !this.hasPrevious(),
          isLastStep: !this.hasNext(),
        },
      })
    );
  }

  // Update progress indicators
  updateProgressIndicators() {
    // Default progress indicators
    this.progressIndicators.forEach((indicator, index) => {
      indicator.classList.remove("current", "completed");
      if (index < this.currentStepIndex) {
        indicator.classList.add("completed");
      } else if (index === this.currentStepIndex) {
        indicator.classList.add("current");
      }
    });

    // Custom progress indicators
    this.customProgressIndicators.forEach((indicator, index) => {
      indicator.classList.remove("current", "completed");
      if (index < this.currentStepIndex) {
        indicator.classList.add("completed");
      } else if (index === this.currentStepIndex) {
        indicator.classList.add("current");
      }
    });
  }

  // Determine navigation possibilities
  hasNext() {
    return this.currentStepIndex < this.totalSteps - 1;
  }

  hasPrevious() {
    return this.currentStepIndex > 0;
  }
}

export default StepManager;
