import { Layout } from "@/components/Layout";
import { History, Search, CheckCircle2, Calendar, User, Wrench, DollarSign, PackageCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { equipamentos as equipamentosIniciais } from "@/lib/dados";

export function HistoricoPage() {
  const [busca, setBusca] = useState("");
  const [historico, setHistorico] = useState<any[]>([]);

  const carregar = () => {
    try {
      // 1. Itens locais (cadastrados pelo usuário) com status Entregue
      const salvo = localStorage.getItem("sos_clientes");
      const clientesLocais: any[] = salvo ? JSON.parse(salvo) : [];
      const locaisEntregues = clientesLocais
        .filter((c: any) => c.os && c.os.statusOS === "Entregue")
        .map((c: any) => ({
          id: `EQ-${c.id}`,
          numero: c.os.numero,
          cliente: c.nome,
          telefone: c.telefone || "-",
          equipamento: `${c.os.marca} ${c.os.modelo}`.trim(),
          marca: c.os.marca,
          modelo: c.os.modelo,
          tipo: c.os.tipoAparel,
          servico: c.os.servico || "Análise",
          tecnico: c.os.tecnico || "-",
          dataEntrada: c.os.dataEntrada || "-",
          dataEntrega: c.os.dataRetirada || "-",
          horaEntrega: c.os.horaRetirada || "",
          valor: c.os.valor || "-",
          fotoLocal: c.os.fotoEquipamento,
        }));

      // 2. Itens estáticos que foram editados para Entregue via sos_eq_static_edits
      const staticSalvo = localStorage.getItem("sos_eq_static_edits");
      const staticEdits: Record<string, any> = staticSalvo ? JSON.parse(staticSalvo) : {};
      const staticEntregues = equipamentosIniciais
        .filter(e => staticEdits[e.id]?.status === "Entregue")
        .map(e => {
          const edit = staticEdits[e.id];
          return {
            id: e.id,
            numero: `OS-EST-${e.id}`,
            cliente: e.cliente,
            telefone: "-",
            equipamento: `${e.marca} ${e.modelo}`.trim(),
            marca: e.marca,
            modelo: e.modelo,
            tipo: e.tipo,
            servico: edit.servico || "-",
            tecnico: edit.tecnico || "-",
            dataEntrada: "-",
            dataEntrega: edit.dataRetirada || "-",
            horaEntrega: edit.horaRetirada || "",
            valor: edit.valor || "-",
            fotoLocal: undefined,
          };
        });

      setHistorico([...locaisEntregues, ...staticEntregues]);
    } catch { setHistorico([]); }
  };

  useEffect(() => {
    carregar();
    window.addEventListener("focus", carregar);
    window.addEventListener("storage", carregar);
    return () => {
      window.removeEventListener("focus", carregar);
      window.removeEventListener("storage", carregar);
    };
  }, []);

  const filtrado = historico.filter((h: any) =>
    h.numero.toLowerCase().includes(busca.toLowerCase()) ||
    h.cliente.toLowerCase().includes(busca.toLowerCase()) ||
    h.equipamento.toLowerCase().includes(busca.toLowerCase()) ||
    h.telefone.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Histórico de Entregas</h2>
            <p className="text-sm text-muted-foreground">
              Aparelhos já entregues ao cliente — {historico.length} no total.
            </p>
          </div>
          {historico.length > 0 && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-semibold text-emerald-700">{historico.length} entregues</span>
            </div>
          )}
        </div>

        {/* Busca */}
        {historico.length > 0 && (
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Buscar por OS, cliente, equipamento..."
              className="w-full rounded-lg border border-input bg-card py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        )}

        {/* Lista */}
        {historico.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 rounded-xl border border-border bg-card text-center">
            <PackageCheck className="h-14 w-14 text-muted-foreground/30 mb-4" />
            <p className="text-base font-semibold text-foreground">Nenhum aparelho entregue ainda</p>
            <p className="text-sm text-muted-foreground mt-1">
              Quando um aparelho for marcado como "Entregue", ele aparecerá aqui automaticamente.
            </p>
          </div>
        ) : filtrado.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
            Nenhum resultado para "{busca}".
          </div>
        ) : (
          <div className="space-y-3">
            {filtrado.map((h: any, i: number) => (
              <div key={h.numero + i} className="group rounded-xl border border-border bg-card overflow-hidden shadow-sm transition-all hover:shadow-md hover:border-emerald-500/30">
                <div className="flex items-stretch">
                  {/* Foto */}
                  <div className="w-20 shrink-0 bg-muted/30 flex items-center justify-center p-2 border-r border-border overflow-hidden">
                    {(h.fotoLocal || h.marca) ? (
                      <img
                        src={h.fotoLocal || `/fotos/${h.marca} ${h.modelo}.webp`}
                        alt={h.equipamento}
                        className="w-16 h-16 object-contain rounded-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          (e.currentTarget.nextElementSibling as HTMLElement)?.classList.remove("hidden");
                          (e.currentTarget.nextElementSibling as HTMLElement)?.classList.add("flex");
                        }}
                      />
                    ) : null}
                    <PackageCheck className="hidden h-8 w-8 text-muted-foreground/40" />
                  </div>

                  {/* Dados */}
                  <div className="flex flex-1 flex-wrap items-center gap-x-6 gap-y-3 px-6 py-4">
                    <div className="min-w-[170px]">
                      <p className="text-xs font-semibold text-primary">{h.numero}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        <p className="text-sm font-semibold text-foreground">{h.cliente}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{h.telefone}</p>
                    </div>

                    <div className="min-w-[170px]">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Equipamento</p>
                      <p className="text-sm font-medium text-foreground">{h.equipamento}</p>
                      <p className="text-xs text-muted-foreground">{h.tipo}</p>
                    </div>

                    <div className="min-w-[140px]">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Serviço</p>
                      <div className="flex items-center gap-1">
                        <Wrench className="h-3.5 w-3.5 text-muted-foreground" />
                        <p className="text-sm text-foreground">{h.servico}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">Téc: {h.tecnico}</p>
                    </div>

                    <div className="min-w-[130px]">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Entrada</p>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        <p className="text-sm text-foreground">{h.dataEntrada}</p>
                      </div>
                    </div>

                    <div className="min-w-[150px]">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Entregue em</p>
                      <p className="text-sm font-bold text-emerald-600">
                        {h.dataEntrega}
                        {h.horaEntrega ? ` às ${h.horaEntrega}` : ""}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Valor</p>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                        <p className="text-sm font-semibold text-foreground">{h.valor}</p>
                      </div>
                    </div>
                  </div>

                  {/* Check verde */}
                  <div className="flex flex-col items-center justify-center px-5 border-l border-border bg-emerald-500/5 min-w-[60px]">
                    <CheckCircle2 className="h-7 w-7 text-emerald-500" />
                    <p className="text-[9px] text-emerald-600 font-semibold mt-1 uppercase tracking-wide">Entregue</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
