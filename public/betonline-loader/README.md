# BetOnline full-logo loading animation

Latest approved direction: trace the B first, flow through the full wordmark, return underneath as a thin swoosh, with stars only. Default loop: 2.4 seconds. Base #262626; original red/white logo; transparent component background.

## Preview
Double-click preview.html. Keep betonline-loader.js beside it. The dark background belongs to the preview page only.

## Add to Cursor
Copy this folder into your project, open CURSOR-PROMPT.md, and paste its contents into Cursor chat with this folder attached as context.

## React / Next.js
Copy betonline-loader.js to public/betonline-loader.js. Copy BetOnlineLoader.tsx into your components directory. Import and render:

```tsx
import BetOnlineLoader from "./components/BetOnlineLoader";
<BetOnlineLoader width={320} duration={2400} />
```

For a base-path deployment, set src to the correct public script URL. Render only while the app is loading. The wrapper is a client component and reserves layout space.

## Plain HTML
```html
<script src="/betonline-loader.js" defer></script>
<betonline-loader duration="2400" style="--loader-width:320px"></betonline-loader>
```

Call element.pause() and element.play() after customElements.whenDefined('betonline-loader') if controls are needed. Duration is read when the element mounts. The React wrapper remounts when duration changes.

## Implementation
Dependency-free SVG + requestAnimationFrame. Shadow DOM isolates SVG IDs for multiple instances. Stops when hidden/offscreen; removes observers/listeners on disconnect. Reduced-motion preference shows the static logo. Host background remains transparent.

## Validation
JavaScript syntax checked. Browser rendering and React integration still need verification in your project; no browser runtime validation is claimed. This package contains the latest full-logo animation, not the earlier B-only GIF or code ZIP.
