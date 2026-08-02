import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router";

interface AppBackButtonProps {
  className?: string;
}

export function AppBackButton({ className }: AppBackButtonProps) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      className={`inline-flex items-center gap-1 px-4 py-3 text-sm ${className ?? ""}`}
      onClick={() => navigate(-1)}
    >
      <ChevronLeft aria-hidden="true" className="size-4" />
      戻る
    </button>
  );
}
