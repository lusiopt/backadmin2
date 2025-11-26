import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Página não encontrada | Backadmin",
};

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-800">404</h1>
        <h2 className="mt-4 text-3xl font-semibold text-gray-700">
          Página não encontrada
        </h2>
        <p className="mt-2 text-gray-600">
          A página que procura não existe ou foi removida.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-md bg-primary px-6 py-3 text-white hover:bg-primary/90 transition-colors"
        >
          Voltar ao Dashboard
        </Link>
      </div>
    </div>
  );
}
