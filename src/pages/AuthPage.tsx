import { FormEvent, useState } from "react";
import { LockKeyhole, LogIn, Mail, UserPlus, ArrowLeft, KeyRound } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../lib/api";
import { useI18n } from "../i18n";

type AuthMode = "login" | "register" | "forgot" | "reset";

export default function AuthPage() {
  const { t } = useI18n();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const isRegistering = mode === "register";
  const isForgot = mode === "forgot";
  const isReset = mode === "reset";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (isRegistering) {
        await register({ name, email, password });
      } else if (isForgot) {
        const result = await authApi.forgotPassword(email);
        setSuccess(result.message);
        if (result.token) {
          setResetToken(result.token);
          setMode("reset");
        }
      } else if (isReset) {
        await authApi.resetPassword(resetToken, password);
        setSuccess("Password reset successful! You can now login.");
        setTimeout(() => setMode("login"), 2000);
      } else {
        await login({ email, password });
      }
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light via-background to-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-2xl font-bold text-white">C</span>
          </div>
          <h1 className="text-2xl font-bold text-on-surface">CaliGuide</h1>
          <p className="text-sm text-on-surface-variant mt-1">California Immigration Guide</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-outline-variant/50">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-on-surface">
              {isRegistering
                ? t('auth.createAccount')
                : isForgot
                ? t('auth.forgotPasswordTitle')
                : isReset
                ? t('auth.resetPassword')
                : t('auth.welcomeBack')}
            </h2>
            <p className="text-sm text-on-surface-variant mt-1">
              {isRegistering
                ? t('auth.registerDesc')
                : isForgot
                ? t('auth.forgotPasswordDesc')
                : isReset
                ? t('auth.resetPasswordDesc')
                : t('auth.loginDesc')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Login/Register Toggle */}
            {!isForgot && !isReset && (
              <div className="flex bg-surface-variant rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => { setMode("login"); setError(""); }}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                    !isRegistering
                      ? "bg-white text-primary shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {t('auth.login')}
                </button>
                <button
                  type="button"
                  onClick={() => { setMode("register"); setError(""); }}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                    isRegistering
                      ? "bg-white text-primary shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {t('auth.register')}
                </button>
              </div>
            )}

            {/* Name field */}
            {isRegistering && (
              <div>
                <label className="text-xs font-medium text-on-surface-variant">{t('auth.name')}</label>
                <div className="mt-1 flex items-center gap-2 border border-outline-variant rounded-lg px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                  <UserPlus size={16} className="text-on-surface-variant" />
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="w-full py-2.5 bg-transparent outline-none text-sm"
                    placeholder="Elena Rodriguez"
                  />
                </div>
              </div>
            )}

            {/* Email field */}
            <div>
              <label className="text-xs font-medium text-on-surface-variant">{t('auth.email')}</label>
              <div className="mt-1 flex items-center gap-2 border border-outline-variant rounded-lg px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                <Mail size={16} className="text-on-surface-variant" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full py-2.5 bg-transparent outline-none text-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password field */}
            {(mode === "login" || mode === "register" || isReset) && (
              <div>
                <label className="text-xs font-medium text-on-surface-variant">
                  {isReset ? t('auth.newPassword') : t('auth.password')}
                </label>
                <div className="mt-1 flex items-center gap-2 border border-outline-variant rounded-lg px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                  <LockKeyhole size={16} className="text-on-surface-variant" />
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full py-2.5 bg-transparent outline-none text-sm"
                    placeholder={isReset ? "New password" : "At least 6 characters"}
                  />
                </div>
              </div>
            )}

            {/* Reset token field */}
            {isReset && (
              <div>
                <label className="text-xs font-medium text-on-surface-variant">{t('auth.resetToken')}</label>
                <div className="mt-1 flex items-center gap-2 border border-outline-variant rounded-lg px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                  <KeyRound size={16} className="text-on-surface-variant" />
                  <input
                    value={resetToken}
                    onChange={(event) => setResetToken(event.target.value)}
                    className="w-full py-2.5 bg-transparent outline-none text-sm"
                    placeholder={t('auth.resetTokenPlaceholder')}
                  />
                </div>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="bg-error-container text-error text-sm font-medium px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Success message */}
            {success && (
              <div className="bg-success-container text-success text-sm font-medium px-4 py-3 rounded-lg">
                {success}
              </div>
            )}

            {/* Submit button */}
            <button
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2 btn-press"
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {isRegistering
                ? t('auth.createAccountBtn')
                : isForgot
                ? t('auth.sendResetLink')
                : isReset
                ? t('auth.resetPassword')
                : t('auth.login')}
            </button>

            {/* Forgot password link */}
            <div className="text-center">
              {mode === "login" && (
                <button
                  type="button"
                  onClick={() => { setMode("forgot"); setError(""); setSuccess(""); }}
                  className="text-sm text-primary font-medium hover:underline"
                >
                  {t('auth.forgotPassword')}
                </button>
              )}
              {(isForgot || isReset) && (
                <button
                  type="button"
                  onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
                  className="flex items-center justify-center gap-1 text-sm text-primary font-medium hover:underline mx-auto"
                >
                  <ArrowLeft size={14} />
                  {t('auth.backToLogin')}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
