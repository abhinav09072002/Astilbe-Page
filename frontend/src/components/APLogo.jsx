import React from 'react'
import logoSrc from '../assets/logo.png'

/**
 * APLogo — uses the real logo.png file.
 * 
 * Props:
 *   size      – pixel size (default 60)
 *   inverted  – when true, applies a CSS invert filter so the logo
 *               appears white-on-black on dark backgrounds,
 *               and black-on-white on light backgrounds.
 *               The original logo is black-on-white, so:
 *                 inverted=false  →  shows as-is  (black square, white bg section)
 *                 inverted=true   →  CSS invert   (white square, dark bg section)
 */
export default function APLogo({ size = 60, inverted = false, className = '' }) {
  return (
    <img
      src={logoSrc}
      alt="AP Newsletter"
      width={size}
      height={size}
      className={className}
      style={{
        display: 'block',
        width: size,
        height: size,
        objectFit: 'contain',
        filter: inverted ? 'invert(1)' : 'none',
        transition: 'filter .3s',
      }}
    />
  )
}
