import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 50"
      {...props}
    >
      <path fill="#8f993e" d="M0 0h200v20H0z" />
      <path fill="#2c3e50" d="M0 25h200v25H0z" />
      <text
        x="5"
        y="16"
        fontFamily="Arial, sans-serif"
        fontSize="20"
        fontWeight="bold"
        fill="white"
      >
        RETAIL
      </text>
      <text
        x="5"
        y="44"
        fontFamily="Arial, sans-serif"
        fontSize="20"
        fontWeight="bold"
        fill="white"
      >
        MANAGER
      </text>
      <circle cx="150" cy="10" r="8" fill="#8f993e" />
      <circle cx="170" cy="10" r="8" fill="#46a0ac" />
      <circle cx="160" cy="22" r="8" fill="#f0e68c" />
    </svg>
  );
}
