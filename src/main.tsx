import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import ChessGame from "./routes/chessGame";
import ChooseTimeFormat from "./routes/chooseTimeFormat";
import CompletedChessGame from "./routes/completedChessGame";
import DemoTanstackQuery from "./routes/demo.tanstack-query";
import LoginPage from "./routes/login";
import OnlineChessGame from "./routes/onlineChessGame.tsx";
import SignupPage from "./routes/signup";
import UserProfile from "./routes/userProfile";

import Header from "./components/Header";

import TanstackQueryLayout from "./integrations/tanstack-query/layout";

import * as TanstackQuery from "./integrations/tanstack-query/root-provider";

import "./styles.css";
import reportWebVitals from "./reportWebVitals.ts";

import { Toaster } from "react-hot-toast";
import App from "./App.tsx";
import { useAuth } from "./hooks/useAuth.ts";
import { refreshAuthToken } from "./lib/apiClient.ts";
import { accessTokenToUser } from "./lib/authService.ts";

function Layout() {
  return (
    <>
      <Header />
      <Outlet />
      <TanStackRouterDevtools />

      <TanstackQueryLayout />
    </>
  );
}

const rootRoute = createRootRoute({
  component: () => <Layout />,
  beforeLoad: async () => {
    if (useAuth.getState().user != null) return;

    try {
      const res = await refreshAuthToken();
      const user = accessTokenToUser(res.accessToken);
      useAuth.getState().setUser(user);
    } catch (e) {
      console.error("Failed to refresh token:", e);
    }

    return null;
  },
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: App,
});

const authenticatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "authenticated",
  beforeLoad: async ({ location }) => {
    const user = useAuth.getState().user;
    if (!user) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      });
    }

    return { user };
  },
  component: Outlet,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  DemoTanstackQuery(rootRoute),
  ChooseTimeFormat(rootRoute),
  LoginPage(rootRoute),
  SignupPage(rootRoute),

  authenticatedRoute.addChildren([
    ChessGame(authenticatedRoute),
    UserProfile(authenticatedRoute),
    OnlineChessGame(authenticatedRoute),
    CompletedChessGame(authenticatedRoute),
  ]),
]);

export const router = createRouter({
  routeTree,
  context: {
    ...TanstackQuery.getContext(),
  },
  defaultPreload: "intent",
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("app");
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <TanstackQuery.Provider>
        <Toaster />
        <RouterProvider router={router} />
      </TanstackQuery.Provider>
    </StrictMode>,
  );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
