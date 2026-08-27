import { Layout } from "@/components/Layout";
import { StatusBadge } from "@/components/StatusBadge";
import {
  Search,
  ClipboardList,
  Clock,
  CheckCircle2,
  Wrench,
  User,
  Monitor,
  Calendar,
  DollarSign,
  Hash,
  Trash2,
} from "lucide-react";
import { useState } from "react";

const fotoEquipamento: Record<string, string> = {
  "Dell Inspiron 15 3511": "/fotos/Dell Inspiron 15 3511.webp",
  "Samsung Galaxy A54": "/fotos/Samsung Galaxy A54.webp",
  "HP LaserJet M404": "/fotos/HP LaserJet M404.webp",
  "Positivo Master D3400": "/fotos/Positivo Master D3400.webp",
  "iPad 9ª Geração": "/fotos/Apple iPad 9ª Geração.webp",
  "PlayStation 5": "/fotos/Sony PlayStation 5.webp",
  "iphone 16 pro max": "/fotos/iphone 16 pro max.webp",
  "Sony PlayStation 5": "/fotos/Sony PlayStation 5.webp",
};

// Parse DD/MM/YYYY to a Date for sorting (older = higher priority in queue)
const parseDate = (dateStr: string): Date => {
  if (!dateStr || dateStr === "-") return new Date(9999, 0, 1);
  const parts = dateStr.split("/");
  if (parts.length === 3) {
    return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
  }
  return new Date(9999, 0, 1);
};

const ordensIniciais = [
  {
    id: "static-1",
    numero: "OS-2026-0142",
    cliente: "Maria Silva",
    equipamento: "Dell Inspiron 15 3511",
    tipo: "Notebook",
    servico: "Troca de placa-mãe",
    tecnico: "Rafael M.",
    abertura: "20/08/2026",
    hora: "09:14",
    previsao: "28/08/2026",
    valor: "R$ 680,00",
    status: "Em reparo",
  },
  {
    id: "static-2",
    numero: "OS-2026-0143",
    cliente: "Fernanda Lima",
    equipamento: "iPad 9ª Geração",
    tipo: "Tablet",
    servico: "Troca de bateria",
    tecnico: "Carlos T.",
    abertura: "19/08/2026",
    hora: "10:00",
    previsao: "25/08/2026",
    valor: "R$ 350,00",
    status: "Pronto",
  },
  {
    id: "static-3",
    numero: "OS-2026-0144",
    cliente: "João Pereira",
    equipamento: "Samsung Galaxy A54",
    tipo: "Smartphone",
    servico: "Troca de tela",
    tecnico: "Rafael M.",
    abertura: "22/08/2026",
    hora: "08:30",
    previsao: "27/08/2026",
    valor: "R$ 420,00",
    status: "Aguardando peça",
  },
  {
    id: "static-4",
    numero: "OS-2026-0145",
    cliente: "Roberto Alves",
    equipamento: "PlayStation 5",
    tipo: "Console",
    servico: "Troca de HDMI",
    tecnico: "Carlos T.",
    abertura: "23/08/2026",
    hora: "10:00",
    previsao: "29/08/2026",
    valor: "R$ 290,00",
    status: "Em reparo",
  },
  {
    id: "static-5",
    numero: "OS-2026-0147",
    cliente: "Pedro Mendes",
    equipamento: "iphone 16 pro max",
    tipo: "Smartphone",
    servico: "Troca de microfone",
    tecnico: "Rafael M.",
    abertura: "20/08/2026",
    hora: "08:00",
    previsao: "27/08/2026",
    valor: "R$ 250,00",
    status: "Pronto",
  },
  {
    id: "static-6",
    numero: "OS-2026-0150",
    cliente: "Carlos Souza",
    equipamento: "Positivo Master D3400",
    tipo: "Desktop",
    servico: "Limpeza interna e troca de pasta térmica",
    tecnico: "Rafael M.",
    abertura: "22/08/2026",
    hora: "13:00",
    previsao: "29/08/2026",
    valor: "R$ 160,00",
    status: "Em reparo",
  },
];

export function OrdensPage() {
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("Todos os status");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const carregarOrdens = () => {
    let ordensLocais: any[] = [];
    try {
      const salvo = localStorage.getItem("sos_clientes");
      if (salvo) {
        const clientesStr = JSON.parse(salvo);
        ordensLocais = clientesStr
          .filter((c: any) => c.os)  // all clients with an OS
          .map((c: any) => ({
            id: `local-${c.id}`,
            clienteId: c.id,
            numero: c.os.numero,
            cliente: c.nome,
            equipamento: `${c.os.marca} ${c.os.modelo}`.trim(),
            tipo: c.os.tipoAparel,
            servico: c.os.servico,
            tecnico: c.os.tecnico,
            abertura: c.os.dataEntrada,
            hora: c.os.horaEntrada || "-",
            previsao: c.os.dataRetirada || "-",
            valor: c.os.valor,
            status: c.os.statusOS,
            fotoLocal: c.os.fotoEquipamento,
            dataEntradaDate: parseDate(c.os.dataEntrada),
          }));
      }
    } catch {}

    // Sort iniciais with a parsed date too
    const iniciaisComData = ordensIniciais.map((o) => ({
      ...o,
      dataEntradaDate: parseDate(o.abertura),
    }));

    // Merge: locals first + iniciais, then sort ALL by entry date ascending (oldest first = highest priority)
    const mesclado = [...ordensLocais, ...iniciaisComData].sort(
      (a, b) => a.dataEntradaDate.getTime() - b.dataEntradaDate.getTime()
    );

    return mesclado;
  };

  const excluirOS = (os: any) => {
    if (!os.clienteId) {
      setConfirmDelete(null);
      return; // can't delete static entries
    }
    try {
      const salvo = localStorage.getItem("sos_clientes");
      if (salvo) {
        const clientes = JSON.parse(salvo);
        const novos = clientes.filter((c: any) => c.id !== os.clienteId);
        localStorage.setItem("sos_clientes", JSON.stringify(novos));
      }
    } catch {}
    setConfirmDelete(null);
    window.location.reload();
  };

  const ordens = carregarOrdens();

  // Active = not Entregue; separate them
  const ordensAtivas = ordens.filter(o => o.status !== "Entregue");
  const ordensEntregues = ordens.filter(o => o.status === "Entregue");

  const filtrarLista = (lista: any[]) =>
    lista.filter((os) => {
      const matchBusca =
        os.numero.toLowerCase().includes(busca.toLowerCase()) ||
        os.cliente.toLowerCase().includes(busca.toLowerCase()) ||
        os.equipamento.toLowerCase().includes(busca.toLowerCase());
      const matchStatus =
        filtroStatus === "Todos os status" || os.status === filtroStatus;
      return matchBusca && matchStatus;
    });

  const ativasFiltradas = filtrarLista(ordensAtivas);
  const entreguesFiltradas = filtrarLista(ordensEntregues);
  const todasFiltradas = filtrarLista(ordens);

  const stats = [
    { label: "OS abertas", valor: ordensAtivas.length, icon: ClipboardList, cor: "bg-info text-info-foreground" },
    { label: "Em reparo", valor: ordens.filter(o => o.status === "Em reparo").length, icon: Wrench, cor: "bg-warning text-warning-foreground" },
    { label: "Aguardando peça", valor: ordens.filter(o => o.status === "Aguardando peça").length, icon: Clock, cor: "bg-secondary text-secondary-foreground" },
    { label: "Concluídas/Entregues", valor: ordens.filter(o => o.status === "Concluído" || o.status === "Pronto" || o.status === "Entregue").length, icon: CheckCircle2, cor: "bg-success text-success-foreground" },
  ];

  const renderCard = (os: any, posicao: number) => (
    <div
      key={os.numero + os.id}
      className="group relative flex items-stretch gap-0 rounded-xl border border-border bg-card shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md hover:border-primary/30"
    >
      {/* Posição na fila */}
      <div className="flex flex-col items-center justify-center bg-muted/60 px-4 py-4 min-w-[64px] border-r border-border">
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Fila</span>
        <span className="text-2xl font-black text-primary leading-none">#{posicao}</span>
      </div>

      {/* Foto */}
      <div className="flex flex-col items-center justify-center px-3 py-3 min-w-[90px] max-w-[90px] border-r border-border bg-muted/30">
        {os.fotoLocal || fotoEquipamento[os.equipamento] ? (
          <img
            src={os.fotoLocal || fotoEquipamento[os.equipamento]}
            alt={os.equipamento}
            className="w-16 h-16 object-contain rounded-lg"
          />
        ) : (
          <span className="text-3xl">🔧</span>
        )}
        <span className="text-[10px] text-muted-foreground font-medium text-center leading-tight mt-1">{os.tipo}</span>
      </div>

      {/* Info principal */}
      <div className="flex flex-1 flex-wrap items-center gap-x-6 gap-y-2 px-5 py-4">
        <div className="min-w-[180px]">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Hash className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs font-semibold text-primary">{os.numero}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">{os.cliente}</span>
          </div>
        </div>

        <div className="min-w-[180px]">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium mb-0.5">Equipamento</p>
          <div className="flex items-center gap-1.5">
            <Monitor className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-sm text-foreground font-medium">{os.equipamento}</span>
          </div>
        </div>

        <div className="min-w-[180px]">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium mb-0.5">Serviço</p>
          <div className="flex items-center gap-1.5">
            <Wrench className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-sm text-foreground">{os.servico}</span>
          </div>
        </div>

        <div className="min-w-[140px]">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium mb-0.5">Entrada</p>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-sm text-foreground font-medium">{os.abertura}</span>
            <span className="text-xs bg-muted text-muted-foreground rounded px-1.5 py-0.5 font-mono">{os.hora}</span>
          </div>
        </div>

        <div className="min-w-[100px]">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium mb-0.5">Técnico</p>
          <span className="text-sm text-foreground">{os.tecnico}</span>
        </div>

        <div className="min-w-[90px]">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium mb-0.5">Valor</p>
          <div className="flex items-center gap-1">
            <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">{os.valor}</span>
          </div>
        </div>
      </div>

      {/* Status + lixeira */}
      <div className="flex flex-col items-center justify-center px-5 py-4 border-l border-border min-w-[140px] gap-3">
        <StatusBadge status={os.status} />
        <p className="text-[10px] text-muted-foreground">Previsão: {os.previsao}</p>
        {os.clienteId && (
          <button
            onClick={() => setConfirmDelete(os.id)}
            className="mt-1 p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all"
            title="Excluir OS"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Modal de confirmação de delete */}
      {confirmDelete === os.id && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/90 backdrop-blur-sm rounded-xl">
          <div className="bg-card border border-border rounded-xl p-5 shadow-lg text-center max-w-xs mx-4">
            <Trash2 className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-foreground mb-1">Excluir esta OS?</p>
            <p className="text-xs text-muted-foreground mb-4">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 rounded-lg border border-border py-2 text-sm text-foreground hover:bg-muted transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => excluirOS(os)}
                className="flex-1 rounded-lg bg-red-500 py-2 text-sm font-semibold text-white hover:bg-red-600 transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Fila de Serviços</h2>
            <p className="text-sm text-muted-foreground">
              Ordenadas por data de entrada (mais antigas primeiro) — {ordensAtivas.length} ativas
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="flex items-center gap-3 rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.cor}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{s.valor}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card px-5 py-4 shadow-sm">
          <div className="relative flex-1 min-w-52 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por número, cliente, equipamento..."
              className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option>Todos os status</option>
            <option>Aguardando</option>
            <option>Em análise</option>
            <option>Em reparo</option>
            <option>Aguardando peça</option>
            <option>Concluído</option>
            <option>Pronto</option>
            <option>Entregue</option>
          </select>
        </div>

        {/* Fila ativa */}
        <div className="space-y-3">
          {ativasFiltradas.length === 0 && filtroStatus !== "Entregue" && (
            <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border border-border bg-card">
              <ClipboardList className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm font-medium text-foreground">Nenhuma OS ativa encontrada</p>
              <p className="text-xs text-muted-foreground mt-1">Tente ajustar os filtros de busca.</p>
            </div>
          )}
          {ativasFiltradas.map((os, idx) => renderCard(os, idx + 1))}
        </div>

        {/* Seção de Entregues */}
        {(entreguesFiltradas.length > 0 || filtroStatus === "Entregue") && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs font-semibold uppercase tracking-widest text-emerald-600 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                ✓ Entregues ao Cliente
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>
            {entreguesFiltradas.map((os, idx) => renderCard(os, idx + 1))}
          </div>
        )}
      </div>
    </Layout>
  );
}
