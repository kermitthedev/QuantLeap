import { useEffect } from "react";
import toast from "react-hot-toast";

interface KeyboardShortcuts {
  onCalculate?: () => void;
  onToggleCallPut?: () => void;
  onIncreaseSpot?: () => void;
  onDecreaseSpot?: () => void;
  onExport?: () => void;
  onSave?: () => void;
  onReset?: () => void;
}

export default function useKeyboardShortcuts(shortcuts: KeyboardShortcuts) {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Spacebar - Calculate
      if (e.code === "Space") {
        e.preventDefault();
        shortcuts.onCalculate?.();
        toast.success("Calculating...", { duration: 1000 });
      }

      // C/P - Toggle Call/Put
      if (e.key === "c" || e.key === "C") {
        e.preventDefault();
        shortcuts.onToggleCallPut?.();
        toast("Switched to Call", { icon: "📈", duration: 1000 });
      }
      if (e.key === "p" || e.key === "P") {
        e.preventDefault();
        shortcuts.onToggleCallPut?.();
        toast("Switched to Put", { icon: "📉", duration: 1000 });
      }

      // Arrow Up/Down - Adjust Spot Price
      if (e.key === "ArrowUp") {
        e.preventDefault();
        shortcuts.onIncreaseSpot?.();
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        shortcuts.onDecreaseSpot?.();
      }

      // Ctrl/Cmd + E - Export
      if ((e.ctrlKey || e.metaKey) && e.key === "e") {
        e.preventDefault();
        shortcuts.onExport?.();
        toast.success("Exporting data...", { duration: 1000 });
      }

      // Ctrl/Cmd + S - Save
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        shortcuts.onSave?.();
        toast.success("Position saved!", { duration: 1000 });
      }

      // R - Reset
      if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        shortcuts.onReset?.();
        toast("Parameters reset", { icon: "🔄", duration: 1000 });
      }

      // ? - Show help
      if (e.key === "?") {
        e.preventDefault();
        toast(
          `Keyboard Shortcuts:
          
Space - Calculate
C/P - Toggle Call/Put
↑/↓ - Adjust Spot
Ctrl+E - Export
Ctrl+S - Save
R - Reset`,
          { duration: 5000, style: { whiteSpace: "pre-line" } }
        );
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [shortcuts]);
}
