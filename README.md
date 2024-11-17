# Webflow Multi-Step Form

A professional, lightweight multi-step form enhancement tool specifically designed for Webflow projects. Transform your single-page forms into intuitive, step-by-step experiences with built-in validation, progress saving, and smooth transitions.

## Features

- 🚀 **Easy Integration** - Simple drop-in solution for Webflow
- 📱 **Fully Responsive** - Works seamlessly on all devices
- 🌍 **International Support** - Unicode and locale-aware validation
- ✨ **Progressive Enhancement** - Enhances existing Webflow forms
- 💾 **Form Memory** - Automatically saves progress
- ✅ **Comprehensive Validation** - Smart, flexible field validation
- 🎯 **Query Parameter Support** - Pre-fill forms via URL parameters
- 🔄 **Step Navigation** - Intuitive next/previous navigation
- 📋 **Progress Tracking** - Visual progress indicators
- ⌨️ **Keyboard Navigation** - Enhanced accessibility
- 🌐 **Localization Ready** - Customizable messages and formats

## Installation

### CDN Installation

Include this library directly in your Webflow project using our CDN:

#### Latest Version (Always up-to-date)

```html
<script src="https://cdn.jsdelivr.net/gh/CarterOgunsola/webflow-multistep-form@latest/dist/webflow-multistep-form.min.js"></script>
```

#### Specific Version (More stable)

```html
<script src="https://cdn.jsdelivr.net/gh/CarterOgunsola/webflow-multistep-form@v1.0.2/dist/webflow-multistep-form.min.js"></script>
```

### Version Information

- `@latest` - Always gets the newest version (may include breaking changes)
- `@v1.0.2` - Locks to a specific version (most stable)
- `@v1` - Gets the latest 1.x.x version (balance of stability and updates)

## Quick Start

Add to your Webflow project settings under "Custom Code" (before `</body>` tag):

```html
<script src="https://cdn.jsdelivr.net/gh/CarterOgunsola/webflow-multistep-form@latest/dist/multistep-form.min.js"></script>
```

Basic form structure:

```html
<form data-multi-step-form>
  <!-- Step 1 -->
  <div data-form-step>
    <input type="text" name="name" data-validate="required" />
    <button data-form-navigation="next">Next</button>
  </div>

  <!-- Step 2 -->
  <div data-form-step>
    <input type="email" name="email" data-validate="required email" />
    <button data-form-navigation="prev">Back</button>
    <button type="submit">Submit</button>
  </div>
</form>
```

## Comprehensive Form Example

```html
<form data-multi-step-form data-form-memory="true" data-keyboard-nav="true">
  <!-- Progress Indicator -->
  <div class="form-progress">
    <div class="progress-step" data-step="0"></div>
    <div class="progress-step" data-step="1"></div>
    <div class="progress-step" data-step="2"></div>
  </div>

  <!-- Step 1: Personal Details -->
  <div data-form-step>
    <div class="form-field">
      <label>Full Name</label>
      <input
        type="text"
        name="fullName"
        data-validate="required pattern:^[\p{L}\s]+$|u"
        data-error-message="Please enter your full name"
        placeholder="John Doe"
      />
    </div>

    <div class="form-field">
      <label>Phone Number</label>
      <input
        type="tel"
        name="phone"
        data-validate="phone"
        placeholder="+1 (234) 567-8900"
      />
    </div>

    <button data-form-navigation="next">Continue</button>
  </div>

  <!-- Step 2: Contact & Preferences -->
  <div data-form-step>
    <div class="form-field">
      <label>Email Address</label>
      <input
        type="email"
        name="email"
        data-validate="required email"
        data-param="email"
        placeholder="your@email.com"
      />
    </div>

    <div class="form-field">
      <label>Birth Date</label>
      <input
        type="text"
        name="birthDate"
        data-validate="date:DD/MM/YYYY"
        placeholder="31/12/1990"
      />
    </div>

    <button data-form-navigation="prev">Back</button>
    <button data-form-navigation="next">Continue</button>
  </div>

  <!-- Step 3: File Upload & Submission -->
  <div data-form-step>
    <div class="form-field">
      <label>Profile Picture</label>
      <input
        type="file"
        name="profile"
        data-validate="file:5,image/jpeg|image/png"
      />
    </div>

    <div class="form-field">
      <label>Additional Comments</label>
      <textarea
        name="comments"
        data-validate="maxLength:500"
        placeholder="Your message here..."
      ></textarea>
    </div>

    <button data-form-navigation="prev">Back</button>
    <button type="submit">Submit</button>
  </div>
</form>
```

## Validation Features

### Available Validators

- `required` - Field must not be empty (Unicode-aware)
- `email` - Email validation with international support
- `phone` - International phone number formats
- `minLength:n` - Minimum length (Unicode-aware)
- `maxLength:n` - Maximum length (Unicode-aware)
- `number:min,max` - Number with optional range
- `date:format` - Date with format specification
- `file:size,types` - File size and type validation
- `pattern:regex|flags` - Custom regex with flags

### Validation Examples

```html
<!-- International email -->
<input type="email" data-validate="email" placeholder="email@domain.com" />

<!-- International phone -->
<input type="tel" data-validate="phone" placeholder="+1 (234) 567-8900" />

<!-- Number with regional format -->
<input type="text" data-validate="number:0,1000" placeholder="1.234,56" />

<!-- Date with format -->
<input type="text" data-validate="date:DD/MM/YYYY" placeholder="31/12/2024" />

<!-- File upload -->
<input type="file" data-validate="file:5,image/jpeg|image/png" />

<!-- Unicode text -->
<input
  type="text"
  data-validate="pattern:^[\p{L}\s]+$|u"
  placeholder="Names in any language"
/>
```

## Configuration Options

### Form Attributes

- `data-multi-step-form` - Activates functionality
- `data-form-memory="false"` - Disables progress saving
- `data-keyboard-nav="true"` - Enables keyboard navigation
- `data-auto-scroll="false"` - Disables auto-scroll
- `data-form-prefill="true"` - Enables URL prefilling

### Localization

```javascript
const form = document.querySelector("[data-multi-step-form]");
const validator = form._multiStepForm.validator;

// Custom messages
validator.setMessages({
  required: "Este campo es obligatorio",
  email: "Por favor, introduce un email válido",
  phone: "Por favor, introduce un número válido",
});

// Set locale
validator.setLocale("es");
```

### Custom Validators

```javascript
validator.addValidator('customRule', (value, param) => ({
  valid: /* your validation logic */,
  message: "Custom error message"
}));
```

## Events

```javascript
const form = document.querySelector("[data-multi-step-form]");

// Step changes
form.addEventListener("stepChange", (e) => {
  console.log("Current step:", e.detail.currentStep);
  console.log("Total steps:", e.detail.totalSteps);
});

// Progress saving
form.addEventListener("formProgressSaved", () => {
  console.log("Progress saved");
});

// Validation success
form.addEventListener("formValid", () => {
  console.log("Form is valid");
});

// Progress restored
form.addEventListener("formProgressRestored", (e) => {
  console.log("Progress restored from:", e.detail.timestamp);
});
```

## Styling

Basic CSS for form states:

```css
/* Step visibility */
[data-form-step] {
  display: none;
}

[data-form-step-active] {
  display: block !important;
}

/* Progress indicators */
[data-form-step-completed] .progress-step {
  background-color: #4caf50;
}

[data-form-step-active] .progress-step {
  background-color: #2196f3;
}

/* Validation states */
[data-invalid] {
  border-color: #ff4b4b !important;
}

.form-error-message {
  color: #ff4b4b;
  font-size: 14px;
  margin-top: 4px;
}

/* Navigation states */
[data-navigation-disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}

[data-navigation-final] {
  background-color: #4caf50;
}

/* Save indicator */
.form-save-indicator {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  transition: opacity 0.3s;
}
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- iOS Safari (latest)
- Android Chrome (latest)

## Contributing

We welcome contributions! For major changes:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

MIT

## Support

For issues and feature requests, please [open an issue](https://github.com/CarterOgunsola/webflow-multistep-form/issues) on GitHub.

---

Built with ❤️ for the Webflow community by Carter Ogunsola
