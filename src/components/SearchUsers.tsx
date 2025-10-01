import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@/lib/types";
import axiosClient from "@/lib/apiClient";
import { Link } from "@tanstack/react-router";

function useDebounceValue<T>(value: T, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function SearchUsers() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounceValue(search);

  const hasQuery = !!debouncedSearch && debouncedSearch.length > 1;

  const { data: hits = [], isFetching } = useQuery({
    queryKey: ["searchUsers", debouncedSearch],
    queryFn: async () => {
      const res = await axiosClient.get<User[]>("/user/search", {
        params: {
          q: debouncedSearch,
        },
      });
      if (res.data == null) {
        return [];
      }

      return res.data;
    },
    enabled: hasQuery,
    staleTime: Infinity,
  });

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Search Input */}
      <div className="relative">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          type="text"
          placeholder="Search users..."
          className="input input-bordered w-full"
        />
        {/* Clear & State Indicators */}
        <div className="absolute inset-y-0 right-0 flex items-center gap-2 pr-3">
          {isFetching && (
            <span className="loading loading-spinner loading-xs text-primary" />
          )}
          {debouncedSearch && (
            <button
              id="clear"
              type="button"
              className="btn btn-circle btn-sm btn-ghost"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 cursor-pointer text-red-500 drop-shadow hover:text-red-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Results dropdown (absolute, floating) */}
      {hasQuery && (
        <div className="absolute top-full left-0 w-full mt-1 z-50">
          <div className="card card-compact shadow-lg bg-base-200">
            <div className="flex justify-between items-center px-3 pt-2">
              <div className="text-xs opacity-60">
                {isFetching
                  ? "Searching..."
                  : `${hits.length} hit${hits.length === 1 ? "" : "s"}`}
              </div>
            </div>
            <div className="card-body p-2 overflow-auto max-h-96">
              {isFetching ? (
                <span className="loading loading-dots loading-md mx-auto my-10" />
              ) : hits.length === 0 ? (
                <p className="text-center opacity-70 py-6">
                  No users found for “{debouncedSearch}”
                </p>
              ) : (
                <menu className="menu-compact bg-base-200 rounded-box">
                  {hits.map((u: User) => (
                    <Link
                      key={u.id}
                      onClick={() => {
                        setSearch("");
                      }}
                      to={`/user/$userId`}
                      params={{
                        userId: u.id,
                      }}
                    >
                      <li>
                        <article className="flex gap-4 items-center px-3 py-2">
                          <div className="avatar">
                            <div className="w-10 rounded-full ring ring-secondary ring-offset-base-100 ring-offset-2">
                              <span className="flex justify-center items-center w-full h-full text-xl font-bold bg-neutral text-neutral-content">
                                {u.first_name[0].toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm">{`${u.first_name} ${u.last_name}`}</h4>
                            <p className="text-xs opacity-70">{u.email}</p>
                          </div>
                        </article>
                      </li>
                    </Link>
                  ))}
                </menu>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
