interface ViewToggleProps {
  view: "map" | "list";
  onViewChange: (view: "map" | "list") => void;
}

const ViewToggle = ({ view, onViewChange }: ViewToggleProps) => {
  return (
    <div className="flex items-center justify-center gap-0 bg-muted rounded-full p-1 w-fit mx-auto">
      <button
        onClick={() => onViewChange("map")}
        className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
          view === "map"
            ? "bg-foreground text-background"
            : "bg-transparent text-muted-foreground"
        }`}
      >
        Map
      </button>
      <button
        onClick={() => onViewChange("list")}
        className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
          view === "list"
            ? "bg-foreground text-background"
            : "bg-transparent text-muted-foreground"
        }`}
      >
        List
      </button>
    </div>
  );
};

export default ViewToggle;
