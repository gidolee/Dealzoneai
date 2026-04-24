import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const links = [
  { to: "/deals", label: "Deal Stream" },
  { to: "/merchant", label: "Merchant Console" }
];

export default function Navbar(): JSX.Element {
  const navigate = useNavigate();
  const { session, clearSession } = useAuth();
  const user = session?.user;
  const initials =
    user?.fullName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") ?? "DZ";

  function logout(): void {
    clearSession();
    navigate("/login", { replace: true });
  }

  return (
    <header className="nav-shell">
      <div className="brand">
        <span className="brand-badge" aria-label="Dealzone logo">
          DZ
        </span>
        <div className="brand-copy">
          <strong>Dealzone</strong>
          <p>AI Promotion Platform</p>
        </div>
      </div>

      <nav className="nav-main">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="nav-account">
        <span className="nav-avatar">{initials}</span>
        <div className="nav-account-copy">
          <strong>{user?.fullName ?? "Dealzone Member"}</strong>
          <small>{user?.email}</small>
        </div>
        <span className="nav-role">{user?.role?.toLowerCase() ?? "member"}</span>
        <button type="button" className="nav-logout" onClick={logout}>
          Sign Out
        </button>
      </div>
    </header>
  );
}
