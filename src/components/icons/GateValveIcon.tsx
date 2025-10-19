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
      {/* Gate valve symbol - two triangles forming bowtie shape */}
      <path d="M4 12 L12 4 L12 20 L4 12 Z" />
      <path d="M20 12 L12 4 L12 20 L20 12 Z" />
      {/* Stem line on top */}
      <line x1="12" y1="4" x2="12" y2="1" />
    </svg>
  );
};

export default GateValveIcon;
