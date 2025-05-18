import { useAuth, type User } from "@/hooks/useAuth";
import { jwtDecode } from "jwt-decode";
import apiClient from "@/lib/apiClient";
import { useMutation } from "@tanstack/react-query";
import {
  type RootRoute,
  createRoute,
  useNavigate,
} from "@tanstack/react-router";
import { useState } from "react";
import { accessTokenToUser } from "@/lib/authService";

type LoginResp = {
  access_token: string;
};

type DecodedAccessToken = {
  email: string;
  exp: number;
  first_name: string;
  last_name: string;
  sub: string;
};

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const setUser = useAuth.use.setUser();
  const navigate = useNavigate();

  const { mutate, isPending, isError } = useMutation({
    mutationFn: async () => {
      // const res = await localFetch<LoginResp>("/auth/login", {
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   method: "POST",
      //   body: JSON.stringify({ username, password }),
      // });
      const res = await apiClient.post<LoginResp>("/auth/login", {
        username,
        password,
      });
      console.log(res.data);
      return res.data;
    },
    onSuccess: (data) => {
      const user = accessTokenToUser(data.access_token);
      setUser(user);
      navigate({
        to: "/",
      });
    },
    onError: (err) => {
      console.error(err);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Attempting login with:", { username, password });
    mutate();
    // Example: Redirect on successful login
    // router.navigate('/');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-200 p-4">
      <div className="card w-full max-w-sm shadow-xl bg-base-100">
        <div className="card-body">
          <h2 className="card-title text-center block mb-6">Welcome Back!</h2>

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

            {/* Password Input */}
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
              <a
                href="#"
                className="label-text-alt link link-hover inline-block mt-2"
              >
                Forgot password?
              </a>
            </div>

            <div className="mt-6 justify-self-center">
              <button type="submit" className="btn btn-primary">
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

export default (parentRoute: RootRoute) =>
  createRoute({
    path: "/login",
    component: Login,
    getParentRoute: () => parentRoute,
  });
