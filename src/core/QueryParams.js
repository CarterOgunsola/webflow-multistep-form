// src/core/QueryParams.js
class QueryParams {
  constructor(form) {
    this.form = form;
  }

  init() {
    // Check for data-form-prefill attribute
    if (this.form.hasAttribute("data-form-prefill")) {
      this.prefillFromQueryParams();
    }

    // Check for specific step in URL
    const stepParam = this.getQueryParam("step");
    if (stepParam) {
      this.form.dispatchEvent(
        new CustomEvent("goToStep", {
          detail: { step: parseInt(stepParam, 10) - 1 },
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

        // Dispatch change event to trigger any dependent logic
        field.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });
  }
}

export default QueryParams;
