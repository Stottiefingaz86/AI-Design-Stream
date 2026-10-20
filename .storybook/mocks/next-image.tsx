import type { ImgHTMLAttributes } from 'react';

/** Studio / Storybook stand-in for next/image. */
export default function Image({ src, alt, ...props }: ImgHTMLAttributes<HTMLImageElement> & { src: string }) {
  return <img src={src} alt={alt ?? ''} {...props} />;
}
