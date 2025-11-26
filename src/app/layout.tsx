import { DM_Sans } from "next/font/google";
import "./globals.css";
import { ServicesProvider } from "@/contexts/ServicesContext";
import { AuthProvider } from "@/contexts/AuthContext";
import QueryProvider from "@/providers/QueryProvider";
import { Toaster } from "react-hot-toast";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";

const font = DM_Sans({ subsets: ["latin"] });

export const metadata = {
  title: "Backadmin - Lusio Cidadania",
  description: "Gestao de pedidos de cidadania",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-PT">
      <body className={`${font.className} antialiased`}>
        <QueryProvider>
          <AuthProvider>
            <ServicesProvider>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: "hsl(var(--card))",
                    color: "hsl(var(--card-foreground))",
                    border: "1px solid hsl(var(--border))",
                  },
                  success: {
                    style: {
                      background: "hsl(142.1 76.2% 36.3%)",
                      color: "white",
                    },
                  },
                  error: {
                    style: {
                      background: "hsl(var(--destructive))",
                      color: "hsl(var(--destructive-foreground))",
                    },
                  },
                }}
              />
              <SidebarProvider>
                <AppSidebar />
                <main className="flex-1 flex flex-col min-h-screen w-full">
                  {children}
                </main>
              </SidebarProvider>
            </ServicesProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
