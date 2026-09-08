export default function StatusBadge({ status }) {
  const s = (status || "draft").toLowerCase();

  const getStyle = () => {
    switch (s) {
      case "published":
        return "border-green-500/40 text-green-400";
      case "unpublished":
      case "contacted":
        return "border-yellow-500/40 text-yellow-400";
      case "qualified":
        return "border-emerald-500/40 text-emerald-400";
      case "closed":
        return "border-neutral-500/40 text-neutral-400";
      case "new":
        return "border-cyan-500/40 text-cyan-400";
      default:
        return "border-copper/30 text-copper";
    }
  };

  return (
    <span
      className={`text-[10px] tracking-[0.25em] uppercase px-3 py-1 border ${getStyle()}`}
    >
      {status}
    </span>
  );
}
