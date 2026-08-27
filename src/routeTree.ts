import {
  createRootRoute,
  createRoute,
  redirect,
} from "@tanstack/react-router";

import { RootLayout } from "./routes/__root";
import { ClientesPage } from "./routes/clientes";
import { EquipamentosPage } from "./routes/equipamentos";
import { OrdensPage } from "./routes/ordens-servico";
import { ConsultaPage } from "./routes/consulta";
import { HistoricoPage } from "./routes/historico";

const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: "/clientes" });
  },
});

const clientesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/clientes",
  component: ClientesPage,
});

const equipamentosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/equipamentos",
  component: EquipamentosPage,
});

const ordensRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/ordens-servico",
  component: OrdensPage,
});

const consultaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/consulta",
  component: ConsultaPage,
});

const historicoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/historico",
  component: HistoricoPage,
});

export const routeTree = rootRoute.addChildren([
  indexRoute,
  clientesRoute,
  equipamentosRoute,
  ordensRoute,
  consultaRoute,
  historicoRoute,
]);
