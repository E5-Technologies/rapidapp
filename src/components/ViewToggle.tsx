interface ViewToggleProps {
  view: "map" | "list";
  onViewChange: (view: "map" | "list") => void;
}

const ViewToggle = ({ view, onViewChange }: ViewToggleProps) => {
  return (
    <div className="flex items-center justify-center gap-0 bg-primary rounded-full p-1 w-fit mx-auto">
      <button
        onClick={() => onViewChange("map")}
        className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
          view === "map"
            ? "bg-primary text-primary-foreground"
            : "bg-transparent text-primary-foreground"
        }`}
      >
        Map
      </button>
      <button
        onClick={() => onViewChange("list")}
        className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
          view === "list"
            ? "bg-card text-foreground"
            : "bg-transparent text-primary-foreground"
        }`}
      >
        List
      </button>
    </div>
  );
};

export default ViewToggle;
