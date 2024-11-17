# Webflow Multi-Step Form

A professional, lightweight multi-step form enhancement tool specifically designed for Webflow projects. Transform your single-page forms into intuitive, step-by-step experiences with built-in validation, progress saving, and smooth transitions.

## Installation

### CDN Installation

You can include this library directly in your Webflow project using our CDN. Choose the version that best suits your needs:

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

### Version History

- v1.0.2 - Added comprehensive documentation
- v1.0.1 - Initial distribution files
- v1.0.0 - Initial release

## Features

- 🚀 **Easy Integration** - Simple drop-in solution for Webflow
- 📱 **Fully Responsive** - Works seamlessly on all devices
- ✨ **Progressive Enhancement** - Enhances existing Webflow forms
- 💾 **Form Memory** - Automatically saves progress
- ✅ **Built-in Validation** - Comprehensive field validation
- 🎯 **Query Parameter Support** - Pre-fill forms via URL parameters
- 🔄 **Step Navigation** - Intuitive next/previous navigation
- 📋 **Progress Tracking** - Visual progress indicators
- ⌨️ **Keyboard Navigation** - Enhanced accessibility

## Quick Start

Add this script to your Webflow project settings under "Custom Code" (before `</body>` tag):

```html
<script src="https://cdn.jsdelivr.net/gh/CarterOgunsola/webflow-multistep-form@latest/dist/multistep-form.min.js"></script>
```

Then, structure your form like this:

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

## Detailed Example

Here's a complete form example with all features:

```html
<form data-multi-step-form data-form-memory="true">
  <!-- Progress Indicator -->
  <div class="form-progress">
    <div class="progress-step" data-step="0"></div>
    <div class="progress-step" data-step="1"></div>
    <div class="progress-step" data-step="2"></div>
  </div>

  <!-- Step 1: Personal Info -->
  <div data-form-step>
    <input
      type="text"
      name="fullName"
      data-validate="required minLength:2"
      data-error-message="Please enter your full name"
      placeholder="Full Name"
    />
    <button data-form-navigation="next">Continue</button>
  </div>

  <!-- Step 2: Contact -->
  <div data-form-step>
    <input
      type="email"
      name="email"
      data-validate="required email"
      data-param="email"
      placeholder="Email"
    />
    <button data-form-navigation="prev">Back</button>
    <button data-form-navigation="next">Continue</button>
  </div>

  <!-- Step 3: Additional Info -->
  <div data-form-step>
    <textarea
      name="message"
      data-validate="required"
      placeholder="Your message"
    ></textarea>
    <button data-form-navigation="prev">Back</button>
    <button type="submit">Submit</button>
  </div>
</form>
```

## Configuration Options

### Form Attributes

- `data-multi-step-form` - Initializes multi-step functionality
- `data-form-memory="false"` - Disables progress saving
- `data-keyboard-nav="true"` - Enables keyboard navigation
- `data-auto-scroll="false"` - Disables auto-scroll on step change

### Field Validation

Available validators:

- `required` - Field must not be empty
- `email` - Must be valid email format
- `phone` - Must be valid phone number
- `minLength:n` - Minimum length requirement
- `maxLength:n` - Maximum length requirement
- `pattern:regex` - Custom regex pattern

Example:

```html
<input
  type="text"
  data-validate="required minLength:3"
  data-error-message="Custom error message"
/>
```

### Query Parameters

Pre-fill fields using URL parameters:

```html
<input type="text" name="username" data-param="user" />
<!-- Will be filled from: example.com?user=john -->
```

### Progress Saving

Form progress is automatically saved unless disabled. To disable:

```html
<form data-multi-step-form data-form-memory="false"></form>
```

## Events

Listen for form events:

```javascript
const form = document.querySelector("[data-multi-step-form]");

form.addEventListener("stepChange", (e) => {
  console.log("Step changed:", e.detail);
});

form.addEventListener("formProgressSaved", () => {
  console.log("Progress saved");
});

form.addEventListener("formValid", () => {
  console.log("Form is valid");
});
```

## Styling

Add these styles to customize the appearance:

```css
/* Hide inactive steps */
[data-form-step] {
  display: none;
}

/* Show active step */
[data-form-step-active] {
  display: block !important;
}

/* Error states */
[data-invalid] {
  border-color: #ff4b4b !important;
}

.form-error-message {
  color: #ff4b4b;
  font-size: 14px;
  margin-top: 4px;
}
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- iOS Safari
- Android Chrome

## Contributing

Issues and pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

MIT

## Support

For issues and feature requests, please [open an issue](https://github.com/CarterOgunsola/webflow-multistep-form/issues) on GitHub.

---

Built with ❤️ for the Webflow community
