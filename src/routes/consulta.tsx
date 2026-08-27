import { useState } from "react";
import { Layout } from "@/components/Layout";
import { StatusBadge } from "@/components/StatusBadge";
import { Search, PackageSearch } from "lucide-react";
import { ordensDeServico, clientes } from "@/lib/dados";

export function ConsultaPage() {
  const [busca, setBusca] = useState("");
  const [consultou, setConsultou] = useState(false);
  const [resultado, setResultado] = useState<any>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!busca.trim()) return;

    const termo = busca.toLowerCase().trim();
    const termoNumeros = termo.replace(/\D/g, "");

    // 1. Carregar clientes novos salvos
    let clientesLocais = clientes;
    try {
      const salvo = localStorage.getItem("sos_clientes");
      if (salvo) clientesLocais = JSON.parse(salvo);
    } catch {}

    // 2. Converter os clientes que tem OS pro formato que a página espera
    const ordensLocais = clientesLocais
      .filter((c: any) => c.os)
      .map((c: any) => {
        const isEntregue = c.os.statusOS === "Entregue";
        const isConcluido = c.os.statusOS === "Concluído" || isEntregue;
        const isAndamento = c.os.statusOS !== "Aguardando" && !isConcluido;
        return {
          numero: c.os.numero,
          codigoCliente: c.codigo,
          cliente: c.nome,
          telefone: c.telefone,
          equipamento: `${c.os.marca} ${c.os.modelo}`.trim(),
          servico: c.os.servico || "Análise e orçamento",
          status: c.os.statusOS,
          previsao: c.os.dataRetirada || "A definir",
          valor: c.os.valor || "A definir",
          tecnico: c.os.tecnico || "A definir",
          fotoLocal: c.os.fotoEquipamento,
          etapas: [
            { label: "Equipamento recebido", data: c.os.dataEntrada, feito: true, atual: c.os.statusOS === "Aguardando" },
            { label: "Análise técnica", data: "-", feito: isAndamento || isConcluido, atual: c.os.statusOS === "Em análise" },
            { label: "Reparo em andamento", data: "-", feito: c.os.statusOS === "Em reparo" || isConcluido, atual: c.os.statusOS === "Em reparo" },
            { label: "Pronto para retirada", data: c.os.dataRetirada || "-", feito: isConcluido, atual: c.os.statusOS === "Concluído" },
            { 
              label: "Entregue ao cliente", 
              data: isEntregue ? `${c.os.dataRetirada || "-"} ${c.os.horaRetirada || ""}`.trim() : "-", 
              feito: isEntregue, 
              atual: false 
            },
          ]
        };
      });

    // 3. Juntar com as ordens base (sem duplicar as base)
    const ordensCombinadas = [
      ...ordensLocais,
      ...ordensDeServico.filter(osBase => !ordensLocais.find((no: any) => no.numero === osBase.numero))
    ];

    // Busca nas ordens
    let osEncontrada = ordensCombinadas.find(
      (os) =>
        os.numero.toLowerCase() === termo ||
        os.codigoCliente.toLowerCase() === termo ||
        (termoNumeros && os.telefone.replace(/\D/g, "") === termoNumeros)
    );

    // Se não achou a OS, busca pelo nome do cliente e pega a OS dele
    if (!osEncontrada) {
      const clienteAchado = clientesLocais.find((c: any) =>
        c.nome.toLowerCase().includes(termo)
      );
      if (clienteAchado) {
        osEncontrada = ordensCombinadas.find(
          (os) => os.codigoCliente === clienteAchado.codigo
        );
      }
    }

    setResultado(osEncontrada ?? null);
    setConsultou(true);
  };

  return (
    <Layout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <PackageSearch className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground">Consulta de Ordem de Serviço</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Digite o número da OS, código do cliente, nome ou telefone para acompanhar o reparo.
          </p>
        </div>

        <form className="flex gap-2" onSubmit={handleSearch}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={busca}
              onChange={(e) => { setBusca(e.target.value); setConsultou(false); }}
              placeholder="Ex.: Fernanda Lima, CLI-0016, OS-2026-0143 ou (68) 95555-7890"
              className="w-full rounded-lg border border-input bg-card py-3 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Consultar
          </button>
        </form>

        {consultou && !resultado && (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
            Nenhuma Ordem de Serviço encontrada para <span className="font-medium text-foreground">"{busca}"</span>. Verifique se digitou corretamente.
          </div>
        )}

        {consultou && resultado && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Ordem de Serviço</p>
                  <p className="text-xl font-bold text-primary">{resultado.numero}</p>
                </div>
                <StatusBadge status={resultado.status} />
              </div>

              <div className="mt-5 grid gap-4 border-t border-border pt-5 sm:grid-cols-2">
                {/* Foto do equipamento */}
                <div className="sm:col-span-2 mb-2 overflow-hidden rounded-xl border border-border bg-background">
                  <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden bg-white/5 p-4">
                    <img
                      src={resultado.fotoLocal || `/fotos/${resultado.equipamento}.webp`}
                      alt={resultado.equipamento}
                      className="h-full w-full object-contain drop-shadow-lg transition-transform duration-500 hover:scale-105"
                      onError={(e) => {
                        if (!resultado.fotoLocal) {
                          e.currentTarget.style.display = "none";
                          e.currentTarget.nextElementSibling?.classList.remove("hidden");
                          e.currentTarget.nextElementSibling?.classList.add("flex");
                        }
                      }}
                    />
                    <div className="hidden h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground/40">
                      <span className="text-sm font-medium">Sem foto</span>
                    </div>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-xs text-muted-foreground">Equipamento em Manutenção</p>
                    <p className="text-lg font-bold text-foreground">{resultado.equipamento}</p>
                  </div>
                </div>

                {[
                  ["Cliente",              `${resultado.cliente} (Código: ${resultado.codigoCliente})`],
                  ["Serviço",              resultado.servico],
                  ["Técnico responsável",  resultado.tecnico],
                  ["Previsão de entrega",  resultado.previsao],
                  ["Valor do serviço",     resultado.valor],
                ].map(([label, valor]) => (
                  <div key={label}>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="mt-0.5 text-sm font-medium text-foreground">{valor}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                  Andamento do Reparo
                </h3>
                {/* progresso geral */}
                <span className="text-xs font-semibold text-primary">
                  {resultado.etapas.filter(e => e.feito).length}/{resultado.etapas.length} etapas
                </span>
              </div>

              {/* Barra de progresso global */}
              <div className="mb-8 h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-primary transition-all duration-700"
                  style={{
                    width: `${Math.round(
                      (resultado.etapas.filter(e => e.feito).length / resultado.etapas.length) * 100
                    )}%`,
                  }}
                />
              </div>

              <ol className="space-y-0">
                {resultado.etapas.map((etapa, i) => {
                  const isLast = i === resultado.etapas.length - 1;
                  const nextFeito = resultado.etapas[i + 1]?.feito;

                  // Cores da linha conectora
                  const lineColor = etapa.feito && nextFeito
                    ? "bg-emerald-400"
                    : etapa.feito
                    ? "bg-gradient-to-b from-emerald-400 to-border"
                    : "bg-border";

                  return (
                    <li key={etapa.label} className="relative flex gap-5 pb-7 last:pb-0">
                      {/* Linha conectora */}
                      {!isLast && (
                        <span
                          className={`absolute left-[17px] top-9 h-full w-0.5 ${lineColor} transition-all duration-500`}
                        />
                      )}

                      {/* Ícone da etapa */}
                      <div className="relative z-10 shrink-0">
                        {etapa.atual ? (
                          /* Etapa atual: anel pulsando */
                          <span className="relative flex h-9 w-9 items-center justify-center">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-30" />
                            <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/30">
                              <svg className="h-4 w-4 animate-spin text-white [animation-duration:2s]" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                              </svg>
                            </span>
                          </span>
                        ) : etapa.feito ? (
                          /* Etapa concluída: verde com check */
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 shadow-md shadow-emerald-400/30">
                            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                        ) : (
                          /* Etapa pendente: círculo vazio */
                          <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-border bg-muted">
                            <span className="h-2 w-2 rounded-full bg-border" />
                          </span>
                        )}
                      </div>

                      {/* Texto da etapa */}
                      <div className="flex flex-1 flex-col justify-center min-h-[36px]">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className={`text-sm font-semibold leading-tight ${
                            etapa.feito
                              ? "text-foreground"
                              : etapa.atual
                              ? "text-primary"
                              : "text-muted-foreground/60"
                          }`}>
                            {etapa.label}
                          </p>

                          {/* Badge de estado */}
                          {etapa.atual && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary ring-1 ring-primary/20">
                              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                              em andamento
                            </span>
                          )}
                          {etapa.feito && !etapa.atual && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 ring-1 ring-emerald-400/20">
                              ✓ concluído
                            </span>
                          )}
                          {!etapa.feito && !etapa.atual && (
                            <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground/50">
                              pendente
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">{etapa.data}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
