// src/core/StepManager.js
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
          isLastStep: !this.hasNext(),
        },
      })
    );
  }
}

export default StepManager;
