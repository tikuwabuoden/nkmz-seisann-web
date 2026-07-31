import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router";

export function AppBackButton() {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 px-4 py-3 text-sm"
      onClick={() => navigate(-1)}
    >
      <ChevronLeft aria-hidden="true" className="size-4" />
      戻る
    </button>
  );
}
