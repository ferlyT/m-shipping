# Design System Documentation: Logistics & Finance Editorial

## 1. Overview & Creative North Star
This design system is built to transform the utility-heavy world of logistics and finance into a high-end editorial experience. We are moving away from the "industrial warehouse" aesthetic and toward **"The Kinetic Prism."**

The North Star of this system is the intersection of high-tech precision and organic light. We achieve this by breaking the rigid, expected grid through **intentional asymmetry** and **Bento-style layouts** that prioritize data hierarchy over uniform columns. By utilizing layered glassmorphism and mesh gradients, we create a UI that feels like a physical, high-end dashboard carved from obsidian and light. 

The goal is a "Digital Concierge"—authoritative, premium, and breathable.

---

### 2. Colors: Tonal Depth & Luminous Accents
Our palette moves beyond simple backgrounds. We use a deep, charcoal foundation to allow our primary "gold" and "cyan" accents to act as light sources.

*   **Primary (`#ffe2aa` to `#fbc02d`):** Used for primary actions and "Urgent/Active" logistics status.
*   **Secondary/Tertiary (`#bbc8d0` / `#c8eaff`):** Used for technical data, secondary filters, and financial metrics.
*   **Surface Foundation (`#131313`):** The "Obsidian" base. All depth is built on top of this.

#### The "No-Line" Rule
Standard 1px solid borders for sectioning are strictly prohibited. Boundaries must be defined through:
1.  **Background Shifts:** Placing a `surface-container-low` (`#1b1b1b`) card on a `surface` (`#131313`) background.
2.  **Tonal Transitions:** Using subtle value changes between adjacent Bento cells to imply separation.

#### The "Glass & Gradient" Rule
To achieve a premium "high-tech" feel, all floating elements or high-level containers must use Glassmorphism.
*   **Execution:** Apply a semi-transparent `surface-variant` (`#353535` at 60% opacity) with a `backdrop-filter: blur(24px)`.
*   **Signature Textures:** For main CTAs or "Shipment Delivered" hero states, use a mesh gradient transitioning from `primary` to `primary-container`.

---

### 3. Typography: The Technical Editorial
We utilize **Inter** to provide a Swiss-inspired, high-tech corporate feel. The hierarchy is designed to make complex logistics data (tracking numbers, timestamps, currency) feel legible and prestigious.

*   **Display Scale (`display-lg` 3.5rem):** Used exclusively for hero data points—total portfolio value or "Days in Transit."
*   **Headline & Title:** Used for Bento cell headers. Use `headline-sm` (1.5rem) for card titles to maintain a bold, editorial presence.
*   **Technical Labels (`label-md` 0.75rem):** For tracking IDs and metadata. These should be treated with slightly wider letter spacing (0.05em) to enhance the "corporate-tech" aesthetic.
*   **The Contrast Principle:** Pair a `display-sm` metric with a `label-sm` subtitle directly beneath it. The extreme jump in scale creates an intentional, professional tension.

---

### 4. Elevation & Depth: Tonal Layering
In this design system, elevation is not about "height" from the page, but "clarity" through the glass.

*   **The Layering Principle:** Depth is achieved by stacking `surface-container` tiers. A `surface-container-highest` (`#353535`) element represents the most interactive or "top" layer, while `surface-container-lowest` (`#0e0e0e`) is used for recessed areas like search bars or input fields.
*   **The "Ghost Border" & Glow:** For our Bento cards, use a "Ghost Border." This is a 1px border using the `outline-variant` (`#4f4633`) at **15% opacity**. On active states, increase this to 40% and add a subtle 2px outer "glow" using the `surface-tint`.
*   **Ambient Shadows:** Traditional black drop shadows are forbidden. Use extra-diffused shadows (Blur: 40px, Spread: -5px) at 6% opacity using a tinted version of `on-background`. It should feel like an ambient occlusion, not a shadow.

---

### 5. Components: The Bento Toolkit

#### Cards & Bento Cells
*   **Corner Radius:** Consistently use the `md` scale (**24px / 1.5rem**) for all main containers.
*   **Spacing:** Forbid divider lines. Use vertical white space and background shifts to separate content. 
*   **The "Deep Recess":** For input fields or tracking search bars, use `surface-container-lowest` with an inner shadow to create a "carved" look in the glass.

#### Buttons
*   **Primary:** High-contrast gradient (`primary` to `primary-container`). Typography is `on-primary` (`#402d00`). Radius: `full`.
*   **Secondary/Glass:** `surface-variant` at 20% opacity with a 20px blur. This allows the background mesh gradients to peek through the button.

#### Selection & Status (Chips & Checkboxes)
*   **Logistics Status:** Use `primary-container` for "In Transit" and `tertiary-container` for "Delivered." 
*   **Chips:** 40px height, `full` radius. Use a `ghost-border` for unselected states and a solid `primary-fixed` for selected states.

#### Data Visualizations (Finance Specific)
*   **Line Charts:** Use `tertiary` (`#c8eaff`) with a soft glow effect. The area under the curve should be a fading gradient of the same color, transitioning to 0% opacity.

---

### 6. Do’s and Don’ts

#### Do:
*   **Do** use asymmetrical Bento layouts. One cell should be 2x the width of its neighbor to create visual interest.
*   **Do** use `backdrop-filter: blur` on all overlays.
*   **Do** prioritize `primary` (`#ffe2aa`) for the most important data point on the screen.
*   **Do** use large, bold typography for currency and tracking numbers.

#### Don’t:
*   **Don't** use 100% opaque black or white borders.
*   **Don't** use "Standard" Material shadows. Stick to ambient, tinted blurs.
*   **Don't** overcrowd Bento cells. If a card has more than 3 types of information, it needs to be split or enlarged.
*   **Don't** use sharp corners. The 24px (`md`) radius is the signature of this design system’s friendliness and premium feel.