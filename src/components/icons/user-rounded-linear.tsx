import type { SVGProps } from 'react';

export function UserRoundedLinear(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      {...props}
    >
      <g fill="none" stroke="currentColor" strokeWidth={2}>
        <circle cx={12} cy={6} r={4}></circle>
        <ellipse cx={12} cy={17} rx={7} ry={4}></ellipse>
      </g>
    </svg>
  );
}
