import { useAuth } from "@/hooks/useAuth";
import apiClient from "@/lib/apiClient";
import { useMutation } from "@tanstack/react-query";
import {
  type AnyRoute,
  Link,
  createRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { useState } from "react";
import { accessTokenToUser } from "@/lib/authService";
import type { AxiosError } from "axios";

type LoginResp = {
  access_token: string;
};

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const setUser = useAuth.use.setUser();
  const navigate = useNavigate();

  const { redirect } = useSearch({
    from: "/login",
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post<LoginResp>("/auth/login", {
        username,
        password,
      });
      return res.data;
    },
    onSuccess: (data) => {
      const user = accessTokenToUser(data.access_token);
      setUser(user);
      setUsername("");
      setPassword("");
      setError("");
      navigate({
        to: redirect ?? "/",
      });
    },
    onError: (err: AxiosError) => {
      console.error(err);
      const status = err.code;
      if (status == "401") {
        setError("Incorrect username or password");
      } else if (status == "404") {
        setError("User not found");
      } else {
        setError("Something went wrong. Try again or contact the admin");
      }
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutate();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-200 p-4">
      <div className="card w-full max-w-sm shadow-xl bg-base-100">
        <div className="card-body">
          <h2 className="card-title text-center block mb-6">Welcome Back!</h2>

          {error && <p className="text-center text-error">{error}</p>}

          <form onSubmit={handleSubmit}>
            <div className="form-control">
              <label htmlFor="username" className="label mb-2">
                <span className="label-text">Username</span>
              </label>
              <input
                name="username"
                type="text"
                placeholder="Enter your username"
                className="input input-bordered"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="form-control mt-4">
              <label htmlFor="password" className="label mb-2">
                <span className="label-text">Password</span>
              </label>
              <input
                name="password"
                type="password"
                placeholder="Enter your password"
                className="input input-bordered"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Link
                to="/login"
                search={{
                  redirect: null,
                }}
                className="label-text-alt link link-hover inline-block mt-2"
              >
                Forgot password?
              </Link>
            </div>

            <div className="mt-6 justify-self-center">
              <button type="submit" className="btn btn-primary">
                {isPending && (
                  <span className="loading loading-spinner loading-xs"></span>
                )}
                Login
              </button>
            </div>
          </form>

          <p className="text-center text-sm mt-6">
            Don't have an account?{" "}
            <a href="/signup" className="link link-hover text-primary">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default (parentRoute: AnyRoute) =>
  createRoute({
    path: "/login",
    component: Login,
    getParentRoute: () => parentRoute,
    validateSearch: (search) => {
      const redirectUrl = search?.redirect as string | undefined;
      return {
        redirect: redirectUrl ?? null,
      };
    },
  });
