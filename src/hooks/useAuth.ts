import axiosClient from "@/lib/apiClient";
import { router } from "@/main";
import { create, type StoreApi, type UseBoundStore } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type WithSelectors<S> = S extends { getState: () => infer T }
  ? S & { use: { [K in keyof T]: () => T[K] } }
  : never;

const createSelectors = <S extends UseBoundStore<StoreApi<object>>>(
  _store: S,
) => {
  const store = _store as WithSelectors<typeof _store>;
  store.use = {};
  for (const k of Object.keys(store.getState())) {
    (store.use as any)[k] = () => store((s) => s[k as keyof typeof s]);
  }

  return store;
};

export type User = {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  token: string;
};

type Actions = {
  setUser: (user: User) => void;
  logout: (navigate?: boolean) => Promise<void>;
};

type State = {
  user: User | null;
};

const useAuthBase = create<State & Actions>()(
  persist(
    (set, get) => {
      return {
        user: null,
        setUser: (user) => {
          set({ user });
        },
        logout: async (navigate = false) => {
          const user = get().user;
          if (!user) return;
          await axiosClient.post("/auth/logout", {
            user_id: user.userId,
          });
          set({ user: null });
          if (navigate) {
            router.navigate({
              to: "/login",
              search: {
                redirect: null,
              },
            });
          }
        },
      };
    },
    {
      name: "user-storage",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => {
        if (!state.user) return { user: null };
        const { token, ...userWithoutToken } = state.user;
        return { user: userWithoutToken };
      },
    },
  ),
);

export const useAuth = createSelectors(useAuthBase);
