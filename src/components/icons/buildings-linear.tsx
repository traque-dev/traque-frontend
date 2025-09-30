import type { SVGProps } from 'react';

export function BuildingsLinear(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      {...props}
    >
      <g fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" d="M22 22H2"></path>
        <path d="M21 22V6c0-1.886 0-2.828-.586-3.414S18.886 2 17 2h-2c-1.886 0-2.828 0-3.414.586c-.472.471-.564 1.174-.582 2.414"></path>
        <path d="M15 22V9c0-1.886 0-2.828-.586-3.414S12.886 5 11 5H7c-1.886 0-2.828 0-3.414.586S3 7.114 3 9v13"></path>
        <path strokeLinecap="round" d="M9 22v-3M6 8h6m-6 3h6m-6 3h6"></path>
      </g>
    </svg>
  );
}
