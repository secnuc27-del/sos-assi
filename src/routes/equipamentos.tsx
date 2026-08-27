import { Layout } from "@/components/Layout";
import { Search, Smartphone, Laptop, Monitor, Printer, Tablet, Gamepad2, Edit2, X, History, Clock, CheckCircle2 } from "lucide-react";
import { equipamentos as equipamentosIniciais } from "@/lib/dados";
import { useState, useEffect } from "react";

const tipoIcon: Record<string, typeof Smartphone> = {
  Smartphone,
  Notebook: Laptop,
  Desktop: Monitor,
  Impressora: Printer,
  Tablet,
  Console: Gamepad2,
};

const statusColor: Record<string, string> = {
  "Aguardando":       "bg-slate-500/10 text-slate-500 border-slate-500/20",
  "Em análise":       "bg-purple-500/10 text-purple-600 border-purple-500/20",
  "Em manutenção":    "bg-amber-500/10 text-amber-600 border-amber-500/20",
  "Em reparo":        "bg-amber-500/10 text-amber-600 border-amber-500/20",
  "Aguardando peça":  "bg-red-500/10 text-red-600 border-red-500/20",
  "Concluído":        "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  "Pronto":           "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  "Entregue":         "bg-blue-500/10 text-blue-600 border-blue-500/20",
  "Na fila":          "bg-slate-500/10 text-slate-500 border-slate-500/20",
};

export function EquipamentosPage() {
  const [busca, setBusca] = useState("");
  const [locais, setLocais] = useState<any[]>([]);
  const [staticEdits, setStaticEdits] = useState<Record<string, any>>({});
  const [editando, setEditando] = useState<any>(null);

  const carregar = () => {
    try {
      const salvo = localStorage.getItem("sos_clientes");
      if (salvo) setLocais(JSON.parse(salvo));
      const staticSalvo = localStorage.getItem("sos_eq_static_edits");
      if (staticSalvo) setStaticEdits(JSON.parse(staticSalvo));
    } catch {}
  };

  useEffect(() => {
    carregar();
    // Recarrega quando o usuário volta pra esta aba/página
    window.addEventListener("focus", carregar);
    window.addEventListener("storage", carregar);
    return () => {
      window.removeEventListener("focus", carregar);
      window.removeEventListener("storage", carregar);
    };
  }, []);

  const salvarEdicao = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!editando) { setEditando(null); return; }

    if (editando.clientId) {
      // Local equipment - update sos_clientes
      try {
        const salvo = localStorage.getItem("sos_clientes");
        if (salvo) {
          const todos = JSON.parse(salvo);
          const novos = todos.map((c: any) => {
            if (c.id === editando.clientId && c.os) {
              return {
                ...c,
                os: {
                  ...c.os,
                  statusOS: editando.status,
                  defeito: editando.defeito,
                  servico: editando.servico,
                  valor: editando.valor,
                  tecnico: editando.tecnico,
                  dataRetirada: editando.dataRetirada,
                  horaRetirada: editando.horaRetirada,
                }
              };
            }
            return c;
          });
          localStorage.setItem("sos_clientes", JSON.stringify(novos));
        }
      } catch {}
    } else {
      // Static equipment - save edits to sos_eq_static_edits
      try {
        const staticSalvo = localStorage.getItem("sos_eq_static_edits");
        const atual: Record<string, any> = staticSalvo ? JSON.parse(staticSalvo) : {};
        const novosEdits = {
          ...atual,
          [editando.id]: {
            status: editando.status,
            defeito: editando.defeito,
            servico: editando.servico,
            valor: editando.valor,
            tecnico: editando.tecnico,
            dataRetirada: editando.dataRetirada,
            horaRetirada: editando.horaRetirada,
          }
        };
        localStorage.setItem("sos_eq_static_edits", JSON.stringify(novosEdits));
      } catch {}
    }

    // Re-read everything from localStorage to keep UI in sync
    carregar();
    setEditando(null);
  };

  const eqLocais = locais
    .filter((c: any) => c.os)  // all clients with an OS
    .map((c: any) => ({
      id: `EQ-${c.id}`,
      tipo: c.os.tipoAparel,
      marca: c.os.marca,
      modelo: c.os.modelo,
      serial: c.os.serial || "Não informado",
      cliente: c.nome,
      codigoCliente: c.codigo,
      status: c.os.statusOS,
      defeito: c.os.defeito,
      servico: c.os.servico,
      valor: c.os.valor,
      tecnico: c.os.tecnico,
      dataEntrada: c.os.dataEntrada,
      dataRetirada: c.os.dataRetirada,
      horaRetirada: c.os.horaRetirada,
      fotoLocal: c.os.fotoEquipamento,
      clientId: c.id,
      numeroOS: c.os.numero,
    }));

  // Apply static edits on top of static data
  const eqIniciais = equipamentosIniciais.map(e => {
    const edit = staticEdits[e.id];
    return {
      ...e,
      ...(edit || {}),
      dataEntrada: undefined,
      fotoLocal: undefined,
      clientId: undefined,
      numeroOS: undefined,
    };
  });

  // Ativos = not Entregue
  const ativos = [
    ...eqLocais.filter(e => e.status !== "Entregue"),
    ...eqIniciais.filter((e: any) => e.status !== "Entregue"),
  ];

  // Histórico = Entregue (local + static)
  const historico = [
    ...eqLocais.filter(e => e.status === "Entregue"),
    ...eqIniciais.filter((e: any) => e.status === "Entregue"),
  ];

  const filtrar = (lista: any[]) =>
    lista.filter((eq) =>
      `${eq.marca} ${eq.modelo}`.toLowerCase().includes(busca.toLowerCase()) ||
      (eq.serial || "").toLowerCase().includes(busca.toLowerCase()) ||
      (eq.cliente || "").toLowerCase().includes(busca.toLowerCase()) ||
      (eq.id || "").toLowerCase().includes(busca.toLowerCase())
    );

  const ativosFiltrados = filtrar(ativos);
  const historicoFiltrado = filtrar(historico);

  const inputCls = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring";

  const maskDate = (val: string) => {
    let v = val.replace(/\D/g, "");
    if (v.length > 8) v = v.slice(0, 8);
    if (v.length > 4) return `${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4)}`;
    if (v.length > 2) return `${v.slice(0, 2)}/${v.slice(2)}`;
    return v;
  };

  const maskTime = (val: string) => {
    let v = val.replace(/\D/g, "");
    if (v.length > 4) v = v.slice(0, 4);
    if (v.length > 2) return `${v.slice(0, 2)}:${v.slice(2)}`;
    return v;
  };

  const renderCard = (eq: any) => {
    const Icon = tipoIcon[eq.tipo] ?? Monitor;
    return (
      <div key={eq.id} className="rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md relative group">
        <button
            onClick={() => setEditando(eq)}
            className="absolute top-4 right-4 z-10 p-2 bg-background/80 backdrop-blur-sm border border-border rounded-lg text-muted-foreground hover:text-primary hover:border-primary transition-all opacity-0 group-hover:opacity-100 shadow-sm"
            title="Editar informações"
          >
            <Edit2 className="h-4 w-4" />
          </button>

        <div className="mb-4 aspect-video w-full overflow-hidden rounded-lg bg-white/5 relative flex items-center justify-center p-2">
          {eq.fotoLocal || eq.marca ? (
            <img
              src={eq.fotoLocal || `/fotos/${eq.marca} ${eq.modelo}.webp`}
              alt={`${eq.marca} ${eq.modelo}`}
              className="absolute inset-0 h-full w-full object-contain transition-transform duration-500 group-hover:scale-105 drop-shadow-md"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                e.currentTarget.nextElementSibling?.classList.remove("hidden");
                e.currentTarget.nextElementSibling?.classList.add("flex");
              }}
            />
          ) : null}
          <div className="hidden flex-col items-center justify-center gap-2 text-muted-foreground/50 h-full w-full">
            <Icon className="h-10 w-10" />
            <span className="text-xs font-medium">Sem foto</span>
          </div>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <p className="font-semibold text-foreground line-clamp-1" title={`${eq.marca} ${eq.modelo}`}>
              {eq.marca} {eq.modelo}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">S/N: {eq.serial}</p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span className="shrink-0 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
              {eq.id}
            </span>
            <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${statusColor[eq.status] || statusColor["Na fila"]}`}>
              {eq.status}
            </span>
          </div>
        </div>

        <div className="mt-4 space-y-1.5 border-t border-border pt-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cliente</span>
            <span className="font-medium text-foreground">{eq.cliente}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Defeito relatado</span>
            <span className="font-medium text-foreground">{eq.defeito}</span>
          </div>
          {eq.dataEntrada && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Entrada</span>
              <span className="font-medium text-foreground">{eq.dataEntrada}</span>
            </div>
          )}
          {eq.status === "Entregue" && eq.dataRetirada && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Entregue em</span>
              <span className="font-medium text-emerald-600">
                {eq.dataRetirada} {eq.horaRetirada ? `às ${eq.horaRetirada}` : ""}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Equipamentos</h2>
            <p className="text-sm text-muted-foreground">Equipamentos em manutenção — {ativos.length} no total.</p>
          </div>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por modelo, serial, cliente ou código..."
            className="w-full rounded-lg border border-input bg-card py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {ativosFiltrados.map(renderCard)}
          {ativosFiltrados.length === 0 && (
            <div className="sm:col-span-2 xl:col-span-3 rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
              Nenhum equipamento ativo encontrado.
            </div>
          )}
        </div>
      </div>

      {/* Modal de edição */}
      {editando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card shadow-lg flex flex-col max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border px-5 py-4 sticky top-0 bg-card z-10">
              <div>
                <h3 className="font-semibold text-foreground">Editar Equipamento / OS</h3>
                <p className="text-xs text-muted-foreground">{editando.marca} {editando.modelo} — {editando.cliente}</p>
              </div>
              <button onClick={() => setEditando(null)} className="rounded-md p-1 text-muted-foreground hover:bg-muted transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={salvarEdicao} className="p-5 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</label>
                <select value={editando.status} onChange={e => setEditando({...editando, status: e.target.value})} className={inputCls}>
                  {["Aguardando", "Em análise", "Em reparo", "Aguardando peça", "Concluído", "Entregue"].map(s => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Serviço a realizar</label>
                <input type="text" value={editando.servico || ""} onChange={e => setEditando({...editando, servico: e.target.value})} className={inputCls} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Defeito</label>
                <textarea value={editando.defeito || ""} onChange={e => setEditando({...editando, defeito: e.target.value})} className={`${inputCls} resize-none`} rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Técnico</label>
                  <input type="text" value={editando.tecnico || ""} onChange={e => setEditando({...editando, tecnico: e.target.value})} className={inputCls} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Valor</label>
                  <input type="text" value={editando.valor || ""} onChange={e => setEditando({...editando, valor: e.target.value})} className={inputCls} placeholder="R$ 0,00" />
                </div>
              </div>

              <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">📦 Devolução / Entrega ao cliente</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">Data</label>
                    <input type="text" value={editando.dataRetirada || ""} onChange={e => setEditando({...editando, dataRetirada: maskDate(e.target.value)})} className={inputCls} placeholder="DD/MM/AAAA" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">Hora</label>
                    <input type="text" value={editando.horaRetirada || ""} onChange={e => setEditando({...editando, horaRetirada: maskTime(e.target.value)})} className={inputCls} placeholder="HH:MM" />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button type="submit" className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm">
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
