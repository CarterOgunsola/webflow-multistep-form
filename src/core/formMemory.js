// src/core/FormMemory.js
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
    this.autoSaveInterval = setInterval(this.saveProgress, 30000);
    window.addEventListener("beforeunload", () => {
      this.saveProgress();
    });
  }

  handleInput(event) {
    if (event.target.type === "password") return;

    if (this.saveTimeout) clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => this.saveProgress(), 1000);
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
          currentStep: this.form.getAttribute("data-form-step-index") || 0,
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

      const MAX_AGE = 24 * 60 * 60 * 1000;
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
            detail: { step: parseInt(currentStep, 10) },
          })
        );
      }

      this.form.dispatchEvent(
        new CustomEvent("formProgressRestored", {
          detail: { timestamp },
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

export default FormMemory;
