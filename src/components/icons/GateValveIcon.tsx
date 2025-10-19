interface GateValveIconProps {
  className?: string;
}

const GateValveIcon = ({ className }: GateValveIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Left triangle */}
      <path d="M3 12 L12 6 L12 18 Z" />
      {/* Right triangle */}
      <path d="M21 12 L12 6 L12 18 Z" />
      {/* Vertical stem */}
      <line x1="12" y1="6" x2="12" y2="2" />
      {/* Horizontal top handle */}
      <line x1="9" y1="2" x2="15" y2="2" />
    </svg>
  );
};

export default GateValveIcon;
