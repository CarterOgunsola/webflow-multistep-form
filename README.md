# Webflow Multi-Step Form

A professional, lightweight multi-step form enhancement tool specifically designed for Webflow projects. Transform your single-page forms into intuitive, step-by-step experiences with built-in validation, progress saving, and smooth transitions.

---

## Features

- 🚀 **Easy Integration** - Simple drop-in solution for Webflow
- 📱 **Fully Responsive** - Works seamlessly on all devices
- 🌍 **International Support** - Unicode and locale-aware validation
- ✨ **Progressive Enhancement** - Enhances existing Webflow forms
- 💾 **Form Memory** - Automatically saves progress
- ✅ **Comprehensive Validation** - Smart, flexible field validation
- 🎯 **Query Parameter Support** - Pre-fill forms via URL parameters
- 🔄 **Step Navigation** - Intuitive next/previous navigation
- 📋 **Progress Tracking** - Visual and customizable progress indicators
- ⌨️ **Keyboard Navigation** - Enhanced accessibility
- 🌐 **Localization Ready** - Customizable messages and formats

---

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

---

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

---

## Progress Indicators

The library supports both **default** and **custom** progress indicators to visually track user progress through the form.

### Default Progress Indicators

To enable default progress indicators:

1. Add a container with `data-form="progress"` inside your form.
2. Add individual indicators with `data-form="progress-indicator"`. Ensure the number of indicators matches the number of steps.

```html
<div data-form="progress">
  <div data-form="progress-indicator"></div>
  <div data-form="progress-indicator"></div>
  <div data-form="progress-indicator"></div>
</div>
```

### Custom Progress Indicators

If you prefer fully customizable indicators:

1. Add `data-form="custom-progress-indicator"` to each custom indicator.
2. You do not need the `data-form="progress"` container when using custom indicators.

```html
<div>
  <span data-form="custom-progress-indicator">Step 1</span>
  <span data-form="custom-progress-indicator">Step 2</span>
  <span data-form="custom-progress-indicator">Step 3</span>
</div>
```

**Note**: The library will automatically synchronize these indicators with the current step.

---

## Comprehensive Form Example

```html
<form data-multi-step-form data-form-memory="true" data-keyboard-nav="true">
  <!-- Progress Indicators -->
  <div data-form="progress">
    <div data-form="progress-indicator"></div>
    <div data-form="progress-indicator"></div>
    <div data-form="progress-indicator"></div>
  </div>

  <!-- Step 1 -->
  <div data-form-step>
    <input
      type="text"
      name="fullName"
      data-validate="required"
      placeholder="Full Name"
    />
    <button data-form-navigation="next">Next</button>
  </div>

  <!-- Step 2 -->
  <div data-form-step>
    <input
      type="email"
      name="email"
      data-validate="required email"
      placeholder="Email Address"
    />
    <button data-form-navigation="prev">Back</button>
    <button data-form-navigation="next">Next</button>
  </div>

  <!-- Step 3 -->
  <div data-form-step>
    <textarea
      name="comments"
      data-validate="maxLength:500"
      placeholder="Comments"
    ></textarea>
    <button data-form-navigation="prev">Back</button>
    <button type="submit">Submit</button>
  </div>
</form>
```

---

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

---

## Configuration Options

### Form Attributes

- `data-multi-step-form` - Activates functionality
- `data-form-memory="false"` - Disables progress saving
- `data-keyboard-nav="true"` - Enables keyboard navigation
- `data-auto-scroll="false"` - Disables auto-scroll
- `data-form-prefill="true"` - Enables URL prefilling

### Custom Localization

```javascript
const form = document.querySelector("[data-multi-step-form]");
const validator = form._multiStepForm.validator;

validator.setMessages({
  required: "This field is required",
  email: "Please enter a valid email address",
});
validator.setLocale("en");
```

---

## Styling

```css
/* Step Visibility */
[data-form-step] {
  display: none;
}

[data-form-step-active] {
  display: block !important;
}

/* Progress Indicators */
[data-form="progress-indicator"].completed {
  background-color: #4caf50;
}

[data-form="progress-indicator"].current {
  background-color: #2196f3;
}
```

---

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- iOS Safari (latest)
- Android Chrome (latest)

---

## Contributing

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## License

MIT

---

## Support

For issues and feature requests, please [open an issue](https://github.com/CarterOgunsola/webflow-multistep-form/issues) on GitHub.

---

Built with ❤️ for the Webflow community by Carter Ogunsola.

---

### What’s New

- Added support for custom progress indicators.
- Improved accessibility with keyboard navigation.
- Enhanced localization options.
