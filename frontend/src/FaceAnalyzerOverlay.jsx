import React from "react";

export default function FaceAnalyzerOverlay({ isAnalyzing }) {
  if (!isAnalyzing) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center rounded-lg bg-gradient-to-br from-black/70 via-gray-900/60 to-black/70 backdrop-blur-md">
      {/* Glow de fundo */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-cyan-500/20 via-fuchsia-500/10 to-purple-500/20 blur-3xl" />
      </div>

      {/* Card principal */}
      <div className="relative mx-4 w-[22rem] max-w-[90vw] rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-cyan-500/10 ring-1 ring-white/5">
        {/* Barra superior com status */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_15px_2px_rgba(16,185,129,0.6)]" />
            <span className="text-xs font-medium uppercase tracking-wider text-emerald-300/90">Analisando</span>
          </div>
          <div className="text-xs font-mono text-cyan-200/80">AI Vision</div>
        </div>

        {/* Área do scanner */}
        <div className="relative mx-auto h-64 w-64 select-none rounded-xl bg-black/40 backdrop-blur-sm">
          {/* Gradiente de borda animado */}
          <div className="pointer-events-none absolute -inset-0.5 rounded-xl bg-[radial-gradient(circle_at_30%_30%,rgba(34,211,238,0.5),transparent_35%),radial-gradient(circle_at_70%_70%,rgba(168,85,247,0.4),transparent_35%)] blur" />

          {/* Moldura com cantos destacados */}
          <div className="absolute inset-0 rounded-xl border border-cyan-400/30" />
          <div className="absolute inset-0">
            {/* Cantos */}
            <span className="absolute left-2 top-2 h-5 w-5 border-l-2 border-t-2 border-cyan-300/70" />
            <span className="absolute right-2 top-2 h-5 w-5 border-r-2 border-t-2 border-cyan-300/70" />
            <span className="absolute bottom-2 left-2 h-5 w-5 border-b-2 border-l-2 border-cyan-300/70" />
            <span className="absolute bottom-2 right-2 h-5 w-5 border-b-2 border-r-2 border-cyan-300/70" />
          </div>

          {/* Linha de varredura existente */}
          <div className="scan-line" />

          {/* Texto de status dentro */}
          <div className="absolute bottom-3 left-0 right-0 mx-auto w-[90%] text-center">
            <div className="text-sm font-mono tracking-wide text-cyan-200/90">Analisando rosto...</div>
            <div className="mt-1 flex items-center justify-center gap-1">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-300 [animation-delay:-0.2s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-fuchsia-300" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-purple-300 [animation-delay:0.2s]" />
            </div>
          </div>
        </div>

        {/* Rodapé com dicas ou rótulos */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-xs text-white/70">
            <span className="bg-gradient-to-r from-cyan-400 to-fuchsia-400 bg-clip-text font-semibold text-transparent">Dica</span>
            <span className="ml-2">Mantenha o rosto centralizado e bem iluminado</span>
          </div>
          <div className="hidden gap-2 md:flex">
            <span className="rounded-full bg-cyan-400/10 px-2 py-1 text-[10px] font-medium text-cyan-200 ring-1 ring-cyan-300/30">Detecção</span>
            <span className="rounded-full bg-fuchsia-400/10 px-2 py-1 text-[10px] font-medium text-fuchsia-200 ring-1 ring-fuchsia-300/30">Análise</span>
            <span className="rounded-full bg-purple-400/10 px-2 py-1 text-[10px] font-medium text-purple-200 ring-1 ring-purple-300/30">Confiabilidade</span>
          </div>
        </div>
      </div>
    </div>
  );
}
