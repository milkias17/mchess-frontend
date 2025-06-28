import { StrictMode, Suspense } from "react";
import ReactDOM from "react-dom/client";
import {
	Outlet,
	RouterProvider,
	createRootRoute,
	createRoute,
	createRouter,
	redirect,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import DemoTanstackQuery from "./routes/demo.tanstack-query";
import ChessGame from "./routes/chessGame";
import ChooseTimeFormat from "./routes/chooseTimeFormat";
import LoginPage from "./routes/login";
import SignupPage from "./routes/signup";
import UserProfile from "./routes/userProfile";

import Header from "./components/Header";

import TanstackQueryLayout from "./integrations/tanstack-query/layout";

import * as TanstackQuery from "./integrations/tanstack-query/root-provider";

import "./styles.css";
import reportWebVitals from "./reportWebVitals.ts";

import App from "./App.tsx";
import { useAuth } from "./hooks/useAuth.ts";
import Loading from "./components/Loading.tsx";

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
				<RouterProvider router={router} />
			</TanstackQuery.Provider>
		</StrictMode>,
	);
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
