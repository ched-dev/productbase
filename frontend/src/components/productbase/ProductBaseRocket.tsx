import type { SVGProps } from "react";

interface ProductBaseRocketProps extends Omit<SVGProps<SVGSVGElement>, "stroke"> {
  size?: number | string;
  stroke?: number | string;
  fireColor?: string;
}

export default function ProductBaseRocket({
  size = 24,
  stroke = 2,
  color = "currentColor",
  fireColor = "goldenrod",
  ...props
}: ProductBaseRocketProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M7 14a6 6 0 0 0 -3 6a6 6 0 0 0 6 -3" stroke={fireColor} />
      <path d="M4 13a8 8 0 0 1 7 7a6 6 0 0 0 3 -5a9 9 0 0 0 6 -8a3 3 0 0 0 -3 -3a9 9 0 0 0 -8 6a6 6 0 0 0 -5 3" stroke={color} />
      <path d="M14 9a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" stroke={color} />
    </svg>
  );
}
