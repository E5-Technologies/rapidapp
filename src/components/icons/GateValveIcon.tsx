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
      <path d="M4 12 L12 7 L12 17 Z" fill="none" />
      {/* Right triangle */}
      <path d="M20 12 L12 7 L12 17 Z" fill="none" />
      {/* Diagonal cross lines */}
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="12" y1="7" x2="4" y2="12" />
      <line x1="12" y1="7" x2="20" y2="12" />
      <line x1="12" y1="17" x2="4" y2="12" />
      <line x1="12" y1="17" x2="20" y2="12" />
      {/* Vertical stem */}
      <line x1="12" y1="7" x2="12" y2="3" />
      {/* Horizontal handle */}
      <line x1="9" y1="3" x2="15" y2="3" />
    </svg>
  );
};

export default GateValveIcon;
