import type { SVGProps } from 'react';

export function LinkLinearIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      {...props}
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 15l6-6"></path>
        <path d="M11 6l.463-.536a5 5 0 0 1 7.071 7.072L18 13"></path>
        <path d="M13 18l-.397.534a5.07 5.07 0 0 1-7.127 0a4.97 4.97 0 0 1 0-7.071L6 11"></path>
      </g>
    </svg>
  );
}
