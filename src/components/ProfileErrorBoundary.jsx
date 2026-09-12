import { Component } from "react";

/** Zachytí pád profilu — místo prázdné bílé plochy ukáže zprávu a možnost zkusit znovu. */
export default class ProfileErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("ProfileErrorBoundary", error, info?.componentStack);
  }

  render() {
    if (this.state.error) {
      const message = this.state.error?.message || "Neznámá chyba";
      return (
        <div className="px-4 py-8 space-y-3">
          <p className="text-sm font-bold text-stone-900">Profil se nepodařilo zobrazit</p>
          <p className="text-xs text-stone-500 leading-relaxed">
            Zkus to znovu. Když problém zůstane, obnov stránku.
          </p>
          <p className="text-[10px] text-stone-400 break-words font-mono">{message}</p>
          <button
            type="button"
            onClick={() => this.setState({ error: null })}
            className="w-full py-2.5 rounded-xl text-sm font-semibold bg-[#1B4D3E] text-white"
          >
            Zkusit znovu
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
