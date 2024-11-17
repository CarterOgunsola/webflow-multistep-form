// // src/index.js
// import WebflowMultiStepForm from "./core/WebflowMultiStepForm.js";

// class MultiStepFormInitializer {
//   static init() {
//     // Find all forms with the multi-step attribute
//     const forms = document.querySelectorAll("[data-multi-step-form]");

//     forms.forEach((form) => {
//       // Ensure unique ID for form memory
//       if (!form.id) {
//         form.id = `msf-${Math.random().toString(36).substr(2, 9)}`;
//       }

//       // Initialize the form
//       const multiStepForm = new WebflowMultiStepForm(form);

//       // Store instance in form element for potential external access
//       form._multiStepForm = multiStepForm;
//     });
//   }
// }

// // Auto-initialize when DOM is ready
// if (document.readyState === "loading") {
//   document.addEventListener("DOMContentLoaded", () =>
//     MultiStepFormInitializer.init()
//   );
// } else {
//   MultiStepFormInitializer.init();
// }

// // Expose to global scope for manual initialization if needed
// window.WebflowMultiStepForm = {
//   init: MultiStepFormInitializer.init,
//   create: (form) => new WebflowMultiStepForm(form),
// };

import WebflowMultiStepForm from "./WebflowMultiStepForm.js";

class MultiStepFormInitializer {
  static init() {
    // Find all forms with the multi-step attribute
    const forms = document.querySelectorAll("[data-multi-step-form]");

    forms.forEach((form) => {
      // Ensure unique ID for form memory
      if (!form.id) {
        form.id = `msf-${Math.random().toString(36).substr(2, 9)}`;
      }

      // Initialize the form
      const multiStepForm = new WebflowMultiStepForm(form);

      // Store instance in form element for potential external access
      form._multiStepForm = multiStepForm;
    });
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () =>
    MultiStepFormInitializer.init()
  );
} else {
  MultiStepFormInitializer.init();
}

// Export the class and expose global scope
export default MultiStepFormInitializer;
export { WebflowMultiStepForm };
window.WebflowMultiStepForm = {
  init: MultiStepFormInitializer.init,
  create: (form) => new WebflowMultiStepForm(form),
};
