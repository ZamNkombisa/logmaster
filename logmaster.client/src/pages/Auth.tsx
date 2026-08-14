import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { login, register } from "../api/auth";
import type { Role } from "../types";

export function Auth() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<Role>("Driver");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login: setAuthUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const auth =
        mode === "login"
          ? await login({ email, password })
          : await register({
              email,
              password,
              fullName,
              role,
              licenseNumber: role === "Driver" ? licenseNumber : undefined,
            });

      setAuthUser(auth);
      navigate("/");
    } catch (err: any) {
      setError(
        err.response?.data?.message ??
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-graphite p-6 relative overflow-hidden">
      {/* Background layer */}
      {/* Background layer */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src="/assets/background.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover blur-sm scale-105"
        />
        <div className="absolute inset-0 bg-graphite/90" />
      </div>

      {/* Card sits above the background layer */}
      <div className="flex w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl relative z-10">
        <div
          className="hidden md:flex flex-1 flex-col justify-center bg-[#14161A] p-10"
          style={{ clipPath: "polygon(0 0, 92% 0, 78% 100%, 0% 100%)" }}
        >
          <div className="flex items-center gap-2 mb-6">
            <span className="text-lime text-xl">🚛</span>
            <span className="text-white font-lg">L O G M A S T E R</span>
          </div>
          <h1 className="text-2xl font-semibold text-white leading-tight mb-2">
            {mode === "login" ? (
              <>
                Welcome
                <br />
                back on the road.
              </>
            ) : (
              <>
                Join the
                <br />
                compliant fleet.
              </>
            )}
          </h1>
          <p className="text-sm text-gray-400 max-w-[220px]">
            {mode === "login"
              ? "Log in to pick up where your last shift left off."
              : "Create an account to start logging trips."}
          </p>
        </div>

        <div className="flex-1 bg-graphite-card p-8 md:p-12 flex flex-col justify-center">
          <p className="text-xs tracking-wide text-lime uppercase mb-1">
            {mode === "login" ? "Sign in" : "Create account"}
          </p>
          <h2 className="text-xl font-semibold text-white mb-6">
            {mode === "login"
              ? "Log in to your account"
              : "Register a new account"}
          </h2>

          {mode === "login" && (
            <div className="bg-graphite-input border border-lime/30 rounded-lg px-3 py-2.5 mb-4 text-xs text-gray-300 leading-relaxed">
              <p className="text-lime font-medium mb-1">
                Try it without signing up:
              </p>
              <p>Driver: driver@logmaster.com</p>
              <p>Dispatcher: dispatcher@logmaster.com</p>
              <p>Admin: admin@logmaster.com</p>
              <p className="mt-1 text-gray-500">
                Password for all: Password123!
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === "register" && (
              <Field
                label="Full name"
                value={fullName}
                onChange={setFullName}
                type="text"
                required
              />
            )}

            <Field
              label="Email"
              value={email}
              onChange={setEmail}
              type="email"
              required
            />
            <Field
              label="Password"
              value={password}
              onChange={setPassword}
              type="password"
              required
            />

            {mode === "register" && (
              <>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">
                    Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                    className="w-full bg-graphite-input border border-graphite-border rounded-lg px-3 py-2 text-sm text-white"
                  >
                    <option value="Driver">Driver</option>
                    <option value="Dispatcher">Dispatcher</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                {role === "Driver" && (
                  <Field
                    label="License number"
                    value={licenseNumber}
                    onChange={setLicenseNumber}
                    type="text"
                    required
                  />
                )}
              </>
            )}

            {error && (
              <p className="text-violation-text bg-violation-bg text-xs rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="bg-lime text-graphite font-semibold rounded-lg py-2.5 text-sm mt-2 disabled:opacity-60"
            >
              {loading
                ? "Please wait…"
                : mode === "login"
                  ? "Log in"
                  : "Sign up"}
            </button>

            <p className="text-xs text-gray-500 text-center mt-2">
              {mode === "login"
                ? "Don't have an account? "
                : "Already have an account? "}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "login" ? "register" : "login");
                  setError(null);
                }}
                className="text-lime hover:underline"
              >
                {mode === "login" ? "Sign up" : "Log in"}
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-xs text-gray-400 block mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full bg-graphite-input border border-graphite-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600"
      />
    </div>
  );
}
