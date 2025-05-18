import { useAuth } from "@/hooks/useAuth";
import { Link } from "@tanstack/react-router";

export default function Header() {
  const user = useAuth.use.user();
  const logout = useAuth.use.logout();

  return (
    <div className="navbar bg-base-100 shadow-sm">
      <div className="flex-1">
        <Link to="/" className="btn btn-ghost text-xl">
          MChess
        </Link>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search"
          className="input input-bordered w-24 md:w-auto"
        />
        {user != null && (
          <div className="dropdown dropdown-end">
            <button
              type="button"
              tabIndex={0}
              className="btn btn-ghost btn-circle avatar"
            >
              <div className="w-10 rounded-full">
                <img
                  alt="Tailwind CSS Navbar component"
                  src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                />
              </div>
            </button>
            <ul
              // biome-ignore lint/a11y/noNoninteractiveTabindex: <explanation>
              tabIndex={0}
              className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
            >
              <li>
                <Link
                  to="/user/$userId"
                  params={{
                    userId: user.userId,
                  }}
                  className="justify-between"
                >
                  Profile
                </Link>
                {/* <a href="/" className="justify-between"> */}
                {/*   Profile */}
                {/* </a> */}
              </li>
              <li>
                <a>Settings</a>
              </li>
              <li>
                <button type="button" onClick={() => logout()}>
                  Logout
                </button>
              </li>
            </ul>
          </div>
        )}

        {user == null && (
          <Link to="/login" className="btn btn-ghost">
            Login
          </Link>
        )}
      </div>
    </div>
  );
}
