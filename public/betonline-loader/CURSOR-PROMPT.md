Integrate the supplied BetOnline loading animation into this project.

First read README.md and inspect the project framework and existing loading states. Use betonline-loader.js as the animation source; preserve the exact SVG logo, B-first motion, continuous masked fill, thin tapered red swoosh, large star particles, timing and grey #262626 base. The background is transparent. Do not recreate it as a GIF or redesign the animation.

For React/Next.js, copy the JS into public/betonline-loader.js and adapt BetOnlineLoader.tsx to the existing component conventions. For other frameworks, load the JS once and use <betonline-loader duration="2400">. Start at 320px width, responsive to the container.

Replace the existing brand loading indicator where appropriate. Tie visibility to the real loading state; do not add artificial loading delays. Preserve existing page layout and behavior. Verify mount/unmount cleanup, reduced motion, mobile sizes, multiple instances, and no console errors. Follow the project's CSP/script policy. Show the integrated result and summarize changed files. Do not deploy.
