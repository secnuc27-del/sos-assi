import { Layout } from "@/components/Layout";
import { StatusBadge } from "@/components/StatusBadge";
import {
  Plus, Search, Phone, Mail, Users, X, Camera, Upload,
  Wrench, CalendarDays, UserCheck, DollarSign, ClipboardList,
} from "lucide-react";
import { clientes as clientesIniciais } from "@/lib/dados";
import { useState, useRef, useEffect } from "react";

type OSVinculada = {
  numero: string;
  tipoAparel: string;
  marca: string;
  modelo: string;
  serial: string;
  fotoEquipamento: string;
  defeito: string;
  servico: string;
  tecnico: string;
  statusOS: string;
  dataEntrada: string;
  dataRetirada: string;
  valor: string;
};

type ClienteCompleto = {
  id: number;
  codigo: string;
  nome: string;
  telefone: string;
  email: string;
  cidade: string;
  equipamentos: number;
  status: string;
  os?: OSVinculada;
};

const STORAGE_KEY = "sos_clientes";

const carregarClientes = (): ClienteCompleto[] => {
  try {
    const salvo = localStorage.getItem(STORAGE_KEY);
    if (salvo) return JSON.parse(salvo);
  } catch {}
  return clientesIniciais as ClienteCompleto[];
};

const gerarCodigo = (lista: ClienteCompleto[]) => {
  const ultimo = lista.reduce((max, c) => {
    const num = parseInt(c.codigo.replace("CLI-", ""), 10);
    return isNaN(num) ? max : Math.max(num, max);
  }, 21);
  return `CLI-${String(ultimo + 1).padStart(4, "0")}`;
};

const gerarOS = (lista: ClienteCompleto[]) => {
  const ano = new Date().getFullYear();
  const total = lista.filter((c) => c.os).length + 151;
  return `OS-${ano}-${String(total).padStart(4, "0")}`;
};

const hoje = () => {
  const d = new Date();
  return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
};

const TIPOS = ["Smartphone", "Notebook", "Desktop", "Tablet", "Console", "Outro"];
const STATUS_OS = ["Aguardando", "Em análise", "Em reparo", "Aguardando peça", "Concluído", "Entregue"];
const TECNICOS = ["Rafael M.", "Beatriz L.", "Diego F.", "Carlos T."];

const MARCAS_POR_TIPO: Record<string, string[]> = {
  Smartphone: ["Apple", "Samsung", "Motorola", "Xiaomi", "LG", "Asus", "Realme", "Poco", "Outra"],
  Notebook: ["Dell", "HP", "Lenovo", "Acer", "Asus", "Apple", "Samsung", "LG", "Vaio", "Positivo", "Avell", "Outra"],
  Desktop: ["Dell", "HP", "Lenovo", "Apple", "Positivo", "Montado (Custom/Gamer)", "Outra"],
  Tablet: ["Apple (iPad)", "Samsung", "Lenovo", "Xiaomi", "Multilaser", "Outra"],
  Impressora: ["HP", "Epson", "Canon", "Brother", "Samsung", "Lexmark", "Outra"],
  Console: ["PlayStation", "Xbox", "Nintendo", "Outra"],
};

const MODELOS_APPLE = [
  "iPhone 11", "iPhone 11 Pro", "iPhone 11 Pro Max",
  "iPhone 12", "iPhone 12 Mini", "iPhone 12 Pro", "iPhone 12 Pro Max",
  "iPhone 13", "iPhone 13 Mini", "iPhone 13 Pro", "iPhone 13 Pro Max",
  "iPhone 14", "iPhone 14 Plus", "iPhone 14 Pro", "iPhone 14 Pro Max",
  "iPhone 15", "iPhone 15 Plus", "iPhone 15 Pro", "iPhone 15 Pro Max",
  "Outro"
];

const MODELOS_SAMSUNG = [
  "Galaxy S21", "Galaxy S22", "Galaxy S23", "Galaxy S24",
  "Galaxy A34", "Galaxy A54", "Galaxy M54",
  "Outro"
];

const maskDate = (val: string) => {
  let v = val.replace(/\D/g, "");
  if (v.length > 8) v = v.slice(0, 8);
  if (v.length > 4) return `${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4)}`;
  if (v.length > 2) return `${v.slice(0, 2)}/${v.slice(2)}`;
  return v;
};

const formVazio = () => ({
  nome: "", telefone: "", email: "", cidade: "",
  tipoAparel: "Smartphone", 
  marcaSelect: "", marcaDigitada: "",
  modeloSelect: "", modeloDigitado: "",
  fotoEquipamento: "", defeito: "",
  servico: "", tecnico: "", statusOS: "Aguardando",
  dataEntrada: hoje(), dataRetirada: "", valor: "",
});

export function ClientesPage() {
  const [clientes, setClientes] = useState<ClienteCompleto[]>(carregarClientes);
  const [busca, setBusca] = useState("");
  const [abrirModal, setAbrirModal] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(formVazio());
  const [erros, setErros] = useState<Record<string, string>>({});
  const fotoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(clientes));
    } catch {}
  }, [clientes]);

  const set = (key: string, val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const filtrados = clientes.filter(
    (c) =>
      c.nome.toLowerCase().includes(busca.toLowerCase()) ||
      c.codigo.toLowerCase().includes(busca.toLowerCase()) ||
      c.telefone.includes(busca)
  );

  const handleFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => set("fotoEquipamento", ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const avancar = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setErros({});
    setStep((s) => s + 1);
  };

  const handleSalvar = (ev: React.FormEvent) => {
    ev.preventDefault();
    
    const marcaFinal = form.marcaSelect === "Outra" || !form.marcaSelect ? form.marcaDigitada : form.marcaSelect;
    const modeloFinal = form.modeloSelect === "Outro" || !form.modeloSelect ? form.modeloDigitado : form.modeloSelect;

    const novo: ClienteCompleto = {
      id: Date.now(),
      codigo: gerarCodigo(clientes),
      nome: form.nome.trim() || "Cliente Sem Nome",
      telefone: form.telefone.trim() || "Sem telefone",
      email: form.email.trim(),
      cidade: form.cidade.trim(),
      equipamentos: 1,
      status: "Ativo",
      os: {
        numero: gerarOS(clientes),
        tipoAparel: form.tipoAparel,
        marca: marcaFinal.trim() || "Não informada",
        modelo: modeloFinal.trim() || "Não informado",
        serial: "", // Removido IMEI
        fotoEquipamento: form.fotoEquipamento,
        defeito: form.defeito.trim() || "Não relatado",
        servico: form.servico.trim() || "Análise",
        tecnico: form.tecnico,
        statusOS: form.statusOS,
        dataEntrada: form.dataEntrada,
        dataRetirada: form.dataRetirada,
        valor: form.valor.trim() || "A orçar",
      },
    };
    setClientes((prev) => {
      const atualizado = [novo, ...prev];
      return atualizado;
    });
    fechar();
  };

  const fechar = () => {
    setAbrirModal(false);
    setStep(1);
    setForm(formVazio());
    setErros({});
  };

  const inputCls = (campo?: string) =>
    `w-full rounded-lg border ${campo && erros[campo] ? "border-destructive" : "border-input"} bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring`;

  const steps = ["Cliente", "Equipamento", "Ordem de Serviço"];

  const marcasDisponiveis = MARCAS_POR_TIPO[form.tipoAparel] || ["Outra"];
  let modelosDisponiveis = ["Outro"];
  if (form.tipoAparel === "Smartphone") {
    if (form.marcaSelect === "Apple") modelosDisponiveis = MODELOS_APPLE;
    if (form.marcaSelect === "Samsung") modelosDisponiveis = MODELOS_SAMSUNG;
  }

  const marcaFinal = form.marcaSelect === "Outra" || !form.marcaSelect ? form.marcaDigitada : form.marcaSelect;
  const modeloFinal = form.modeloSelect === "Outro" || !form.modeloSelect ? form.modeloDigitado : form.modeloSelect;

  return (
    <Layout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Clientes</h2>
            <p className="text-sm text-muted-foreground">Gerencie os clientes cadastrados na assistência.</p>
          </div>
          <button
            onClick={() => setAbrirModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Novo Cliente
          </button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Clientes cadastrados", val: clientes.length, cor: "bg-accent text-accent-foreground" },
            { label: "Clientes ativos", val: clientes.filter((c) => c.status === "Ativo").length, cor: "bg-success text-success-foreground" },
            { label: "Novos este mês", val: 9, cor: "bg-info text-info-foreground" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.cor}`}>
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{s.val}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabela */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center gap-3 border-b border-border px-5 py-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por nome, código ou telefone..."
                className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Cliente</th>
                  <th className="px-5 py-3 font-medium">Contato</th>
                  <th className="px-5 py-3 font-medium">Cidade</th>
                  <th className="px-5 py-3 font-medium">Equipamento</th>
                  <th className="px-5 py-3 font-medium">Status / Datas</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
                          {c.nome.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{c.nome}</p>
                          <p className="text-xs text-muted-foreground">Cód: {c.codigo}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col gap-0.5 text-muted-foreground text-xs">
                        <span className="flex items-center gap-1.5"><Phone className="h-3 w-3" />{c.telefone}</span>
                        <span className="flex items-center gap-1.5"><Mail className="h-3 w-3" />{c.email}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground text-sm">{c.cidade || "—"}</td>
                    <td className="px-5 py-3.5">
                      {c.os ? (
                        <div className="flex items-center gap-2">
                          {c.os.fotoEquipamento ? (
                            <img
                              src={c.os.fotoEquipamento}
                              alt={c.os.modelo}
                              className="h-10 w-10 rounded-lg object-cover ring-1 ring-border shrink-0"
                            />
                          ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                              <Wrench className="h-4 w-4" />
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-semibold text-foreground">{c.os.marca} {c.os.modelo}</p>
                            <p className="text-[10px] text-muted-foreground">{c.os.tipoAparel}</p>
                            {c.os.defeito && <p className="text-[10px] text-muted-foreground italic truncate max-w-[140px]">{c.os.defeito}</p>}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">{c.equipamentos} equip.</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      {c.os ? (
                        <div className="space-y-0.5">
                          <StatusBadge status={c.os.statusOS} />
                          <p className="text-[10px] text-muted-foreground">📅 Entrada: {c.os.dataEntrada}</p>
                          {c.os.dataRetirada && (
                            <p className="text-[10px] text-muted-foreground">🔄 Retirada: {c.os.dataRetirada}</p>
                          )}
                          {c.os.tecnico && (
                            <p className="text-[10px] text-muted-foreground">👤 {c.os.tecnico}</p>
                          )}
                          {c.os.valor && (
                            <p className="text-[10px] font-semibold text-foreground">{c.os.valor}</p>
                          )}
                        </div>
                      ) : (
                        <StatusBadge status={c.status} />
                      )}
                    </td>
                  </tr>
                ))}
                {filtrados.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">
                      Nenhum cliente encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Modal 3 passos ── */}
      {abrirModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={fechar} />

          <div className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl flex flex-col max-h-[92vh]">

            {/* Cabeçalho */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4 shrink-0">
              <div>
                <h3 className="text-lg font-bold text-foreground">Novo Cliente + OS</h3>
                <p className="text-xs text-muted-foreground">
                  Passo {step} de {steps.length}: <span className="font-semibold text-primary">{steps[step - 1]}</span>
                </p>
              </div>
              <button onClick={fechar} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Indicador de steps */}
            <div className="flex items-center px-6 pt-4 pb-2 shrink-0">
              {steps.map((s, i) => (
                <div key={s} className="flex items-center flex-1 last:flex-none">
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${
                    i + 1 < step ? "bg-emerald-500 text-white" :
                    i + 1 === step ? "bg-primary text-white shadow-md shadow-primary/30" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {i + 1 < step ? "✓" : i + 1}
                  </div>
                  <span className={`ml-1.5 text-xs font-medium hidden sm:inline ${i + 1 === step ? "text-foreground" : "text-muted-foreground"}`}>
                    {s}
                  </span>
                  {i < steps.length - 1 && (
                    <div className={`mx-2 flex-1 h-0.5 rounded transition-all ${i + 1 < step ? "bg-emerald-400" : "bg-border"}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Conteúdo */}
            <form onSubmit={handleSalvar} className="flex flex-col flex-1 overflow-hidden">
              <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">

                {/* PASSO 1 — Cliente */}
                {step === 1 && (
                  <>
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold text-foreground">Dados do Cliente</span>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Nome completo <span className="text-destructive">*</span>
                      </label>
                      <input type="text" value={form.nome} onChange={(e) => set("nome", e.target.value)}
                        placeholder="Digite o nome do cliente" className={inputCls("nome")} autoFocus />
                      {erros.nome && <p className="mt-1 text-xs text-destructive">{erros.nome}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Telefone <span className="text-destructive">*</span>
                        </label>
                        <input type="tel" value={form.telefone} onChange={(e) => set("telefone", e.target.value)}
                          placeholder="Digite o número" className={inputCls("telefone")} />
                        {erros.telefone && <p className="mt-1 text-xs text-destructive">{erros.telefone}</p>}
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">E-mail</label>
                        <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
                          placeholder="Digite o email (opcional)" className={inputCls()} />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Cidade</label>
                      <input type="text" value={form.cidade} onChange={(e) => set("cidade", e.target.value)}
                        placeholder="Digite a cidade (opcional)" className={inputCls()} />
                    </div>
                  </>
                )}

                {/* PASSO 2 — Equipamento */}
                {step === 2 && (
                  <>
                    <div className="flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold text-foreground">Dados do Equipamento</span>
                    </div>

                    {/* Foto */}
                    <div className="flex flex-col items-center gap-2">
                      <div
                        onClick={() => fotoRef.current?.click()}
                        className="relative flex h-32 w-full max-w-xs cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-input bg-muted hover:border-primary hover:bg-accent transition-colors"
                      >
                        {form.fotoEquipamento ? (
                          <img src={form.fotoEquipamento} alt="Equipamento" className="h-full w-full object-contain p-2" />
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Camera className="h-8 w-8" />
                            <span className="text-xs font-medium">Clique para adicionar foto do aparelho</span>
                          </div>
                        )}
                      </div>
                      <button type="button" onClick={() => fotoRef.current?.click()}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors">
                        <Upload className="h-3.5 w-3.5" />
                        {form.fotoEquipamento ? "Trocar foto" : "Escolher da galeria / explorador"}
                      </button>
                      <input ref={fotoRef} type="file" accept="image/*" className="hidden" onChange={handleFoto} />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tipo de aparelho</label>
                      <select 
                        value={form.tipoAparel} 
                        onChange={(e) => {
                          set("tipoAparel", e.target.value);
                          set("marcaSelect", "");
                          set("modeloSelect", "");
                        }} 
                        className={inputCls()}
                      >
                        {TIPOS.map((t) => <option key={t}>{t}</option>)}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Marca</label>
                        <select 
                          value={form.marcaSelect} 
                          onChange={(e) => {
                            set("marcaSelect", e.target.value);
                            set("modeloSelect", "");
                          }} 
                          className={inputCls()}
                        >
                          <option value="" disabled>Selecione...</option>
                          {marcasDisponiveis.map(m => <option key={m}>{m}</option>)}
                        </select>
                        {(form.marcaSelect === "Outra" || marcasDisponiveis.length === 1) && (
                          <input type="text" value={form.marcaDigitada} onChange={(e) => set("marcaDigitada", e.target.value)}
                            placeholder="Digite a marca..." className={inputCls()} autoFocus />
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Modelo</label>
                        <select 
                          value={form.modeloSelect} 
                          onChange={(e) => set("modeloSelect", e.target.value)} 
                          className={inputCls()}
                        >
                          <option value="" disabled>Selecione...</option>
                          {modelosDisponiveis.map(m => <option key={m}>{m}</option>)}
                        </select>
                        {(form.modeloSelect === "Outro" || modelosDisponiveis.length === 1) && (
                          <input type="text" value={form.modeloDigitado} onChange={(e) => set("modeloDigitado", e.target.value)}
                            placeholder="Digite o modelo..." className={inputCls()} autoFocus />
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Defeito relatado</label>
                      <textarea value={form.defeito} onChange={(e) => set("defeito", e.target.value)}
                        rows={3} placeholder="Descreva o problema relatado pelo cliente..."
                        className={`${inputCls()} resize-none`} />
                    </div>
                  </>
                )}

                {/* PASSO 3 — Ordem de Serviço */}
                {step === 3 && (
                  <>
                    <div className="flex items-center gap-2">
                      <ClipboardList className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold text-foreground">Ordem de Serviço</span>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Serviço a realizar</label>
                      <input type="text" value={form.servico} onChange={(e) => set("servico", e.target.value)}
                        placeholder="Ex.: Troca de tela, limpeza interna..." className={inputCls()} autoFocus />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status da OS</label>
                        <select value={form.statusOS} onChange={(e) => set("statusOS", e.target.value)} className={inputCls()}>
                          {STATUS_OS.map((s) => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Técnico responsável</label>
                        <input type="text" value={form.tecnico} onChange={(e) => set("tecnico", e.target.value)}
                          placeholder="Digite o nome do técnico" className={inputCls()} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          <CalendarDays className="h-3 w-3" /> Data de entrada
                        </label>
                        <input type="text" value={form.dataEntrada} onChange={(e) => set("dataEntrada", maskDate(e.target.value))}
                          placeholder="DD/MM/AAAA" className={inputCls()} />
                      </div>
                      <div>
                        <label className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          <CalendarDays className="h-3 w-3" /> Previsão de retirada
                        </label>
                        <input type="text" value={form.dataRetirada} onChange={(e) => set("dataRetirada", maskDate(e.target.value))}
                          placeholder="DD/MM/AAAA" className={inputCls()} />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        <DollarSign className="h-3 w-3" /> Valor do serviço
                      </label>
                      <input type="text" value={form.valor} onChange={(e) => set("valor", e.target.value)}
                        placeholder="Ex.: R$ 250,00" className={inputCls()} />
                    </div>

                    {/* Resumo */}
                    <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-2">
                      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">📋 Resumo da entrada</p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                        {[
                          ["Cliente", form.nome],
                          ["Telefone", form.telefone],
                          ["Aparelho", `${marcaFinal} ${modeloFinal}`.trim() || "—"],
                          ["Tipo", form.tipoAparel],
                          ["Defeito", form.defeito || "—"],
                          ["Técnico", form.tecnico],
                          ["Entrada", form.dataEntrada],
                          ["Retirada", form.dataRetirada || "—"],
                          ["Status", form.statusOS],
                          ["Valor", form.valor || "—"],
                        ].map(([k, v]) => (
                          <div key={k}>
                            <span className="text-muted-foreground">{k}: </span>
                            <span className="font-medium text-foreground">{v}</span>
                          </div>
                        ))}
                      </div>
                      {form.fotoEquipamento && (
                        <img src={form.fotoEquipamento} alt="Equipamento"
                          className="mt-2 h-24 w-full object-contain rounded-lg bg-background border border-border" />
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Botões de navegação */}
              <div className="flex items-center justify-between border-t border-border px-6 py-4 shrink-0">
                <button
                  type="button"
                  onClick={step === 1 ? fechar : () => { setErros({}); setStep((s) => s - 1); }}
                  className="rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  {step === 1 ? "Cancelar" : "← Voltar"}
                </button>

                {step < 3 ? (
                  <button
                    type="button"
                    onClick={avancar}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
                  >
                    Próximo →
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors shadow-sm"
                  >
                    <Plus className="h-4 w-4" />
                    Cadastrar
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
