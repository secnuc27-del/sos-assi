const statusStyles: Record<string, string> = {
  "Aguardando": "bg-muted text-muted-foreground",
  "Em análise": "bg-info text-info-foreground",
  "Em reparo": "bg-warning text-warning-foreground",
  "Aguardando peça": "bg-warning text-warning-foreground",
  "Concluído": "bg-success text-success-foreground",
  "Entregue": "bg-secondary text-secondary-foreground",
  "Ativo": "bg-success text-success-foreground",
  "Inativo": "bg-muted text-muted-foreground",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[status] ?? "bg-muted text-muted-foreground"}`}
    >
      {status}
    </span>
  );
}
