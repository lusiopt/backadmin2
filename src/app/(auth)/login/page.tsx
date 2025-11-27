"use client";

/**
 * Página de Login - Backadmin Lusio
 * Integrada com API Real
 */

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useLogin } from "@/hooks/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';
  const isExpired = searchParams.get('expired') === 'true';

  const { mutate: login, isPending, error } = useLogin({ redirectUrl });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-lusioBlueLight via-white to-primaryLight p-4 animate-fadeIn">
      <div className="absolute inset-0 bg-[url('/backadmin2/lusio-logo.jpeg')] bg-center bg-no-repeat opacity-5 bg-contain"></div>

      <Card className="w-full max-w-md shadow-2xl border-none hover-lift animate-slideIn relative z-10">
        <CardHeader className="space-y-4 pb-8">
          <div className="flex justify-center mb-4">
            <div className="relative w-32 h-32">
              <Image
                src="/backadmin2/lusio-logo.jpeg"
                alt="Lusio Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-primary to-primaryHover bg-clip-text text-transparent">
            Lusio Backoffice
          </CardTitle>
          <CardDescription className="text-center text-base text-gray-600">
            Portal da Advogada - Gestão de Processos
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Mensagem de Sessão Expirada */}
            {isExpired && (
              <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 animate-fadeIn">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <p className="font-semibold text-amber-800 text-sm">Sessão Expirada</p>
                    <p className="text-amber-700 text-xs mt-1">
                      Sua sessão expirou ou o token é inválido. Por favor, faça login novamente.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold text-gray-700">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="admin@luzio.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isPending}
                className="h-12 border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primaryLight transition-all"
              />
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold text-gray-700">
                Senha
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isPending}
                  className="h-12 border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primaryLight transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  disabled={isPending}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Mensagem de Erro */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 animate-fadeIn">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <p className="font-semibold text-red-800 text-sm">Erro ao fazer login</p>
                    <p className="text-red-700 text-xs mt-1">
                      {(error as any)?.message || 'Email ou senha inválidos. Verifique suas credenciais.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Botão de Login */}
            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-12 bg-gradient-to-r from-primary to-primaryHover hover:from-primaryHover hover:to-primary text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="animate-pulse">Entrando...</span>
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Entrar
                </span>
              )}
            </Button>

            {/* Credenciais de Teste */}
            <div className="bg-primaryLight/30 rounded-lg p-4 border-2 border-primary/20">
              <p className="text-xs text-center text-primary font-semibold mb-2">
                🔐 Credenciais de Acesso (Staging)
              </p>
              <div className="space-y-1 text-xs text-gray-700">
                <p className="flex justify-between items-center">
                  <span className="font-medium">Email:</span>
                  <code className="bg-white px-2 py-1 rounded">admin@luzio.com</code>
                </p>
                <p className="flex justify-between items-center">
                  <span className="font-medium">Senha:</span>
                  <code className="bg-white px-2 py-1 rounded">admin123</code>
                </p>
              </div>
              <p className="text-xs text-center text-gray-600 mt-2">
                Ambiente de desenvolvimento conectado à API real
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-lusioBlueLight via-white to-primaryLight">
        <div className="animate-pulse text-primary">Carregando...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
