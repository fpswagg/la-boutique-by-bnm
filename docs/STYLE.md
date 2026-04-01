# 🎨 Black & White Minimalist Showcase — Design System

## 🧭 Vision

Create a premium, minimalist showcase website built around strong typography, high contrast, and clean layout structure.

The goal is **not just black & white**, but a **contrast-driven visual identity**:

* Bold vs thin
* Rigid vs fluid
* Large vs small
* Tight vs spaced

---

## 🎯 Typography System

### 1. Primary Display Font (Hero Titles)

**Style:**

* Bold
* Wide / Extended
* Sans-serif
* Geometric and modern

**Recommended Fonts:**

* Monument Extended
* Clash Display
* Anton
* Bebas Neue
* Satoshi (Black)

**Usage:**

* Hero titles
* Section headers
* Key statements

**Example CSS:**

```css
font-family: "Clash Display", sans-serif;
font-weight: 800;
font-size: clamp(3rem, 10vw, 10rem);
letter-spacing: -0.02em;
```

---

### 2. Secondary Script Font (Accent / Overlay)

**Style:**

* Elegant
* Cursive / Script
* Thin with contrast

**Recommended Fonts:**

* Playfair Display Italic
* Great Vibes
* Allura

**Usage:**

* Overlay words on titles
* Branding accents
* Highlighted keywords

**Example CSS:**

```css
font-family: "Playfair Display", serif;
font-style: italic;
font-size: 0.4em;
position: absolute;
```

---

### 3. UI / Body Font

**Style:**

* Clean
* Minimal
* Highly readable

**Recommended Fonts:**

* Inter
* Satoshi
* Helvetica / system-ui

**Usage:**

* Paragraphs
* Navigation
* Buttons

**Example CSS:**

```css
font-family: "Inter", sans-serif;
letter-spacing: 0.05em;
```

---

## 🎨 Color System

### Core Colors

* Primary: `#000000`
* Secondary: `#FFFFFF`

### Soft Variations

* Soft Black: `#0A0A0A`
* Light Gray: `#F5F5F5`

### Optional Accent (use sparingly)

* Beige / Off-white
* Subtle gold tone

---

## 🧱 Layout Principles

### Structure

* Full-screen sections
* Strong grid alignment
* Large whitespace

### Spacing Rules

* Avoid clutter
* Prioritize breathing room
* Use margin/padding generously

### Alignment

* Either strictly centered
* Or strictly grid-based

---

## 🧩 Core Sections

### 1. Hero Section

* Massive typography
* Minimal text
* Optional script overlay

**Example:**

```text
CREATIVE
   studio
```

---

### 2. Showcase / Projects

* Grid layout
* Black & white images
* Hover effects:

  * Zoom
  * Fade

---

### 3. About Section

* Clean paragraph
* Strong heading
* Optional script accent word

---

## ✨ Motion & Interactions

Minimal design requires subtle motion to feel alive.

### Required Animations

* Fade-in on scroll (opacity + translateY)
* Smooth transitions

### Hover Effects

* Underline animations
* Image zoom
* Opacity changes

### Optional Advanced

* Custom cursor
* Parallax text (very subtle)
* Scroll-based typography scaling

---

## ⚠️ Design Rules (Important)

### Avoid

* Too many fonts (max 2–3)
* Overcrowded layouts
* Pure black everywhere (use soft black)
* Flat static pages without motion

### Enforce

* Strong hierarchy
* Clear spacing
* Consistent typography usage

---

## 🔥 Advanced Enhancements (Optional)

* Variable fonts
* Text masking effects
* Custom ligatures
* Scroll-triggered animations

---

## 🧠 Implementation Notes for Developers & AI

* Always respect typography hierarchy
* Do not introduce new fonts without validation
* Maintain spacing consistency
* Keep animations subtle and performant
* Prioritize readability and clarity

---

## ✅ Summary

This design system is based on:

* Strong typography
* High contrast
* Minimal structure
* Subtle motion

The result should feel:

* Premium
* Modern
* Clean
* Intentional
