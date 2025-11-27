import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import "leaflet/dist/leaflet.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { MemberProvider } from "@/contexts/MemberContext";
import { MemberSyncProvider } from "@/components/MemberSyncProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { ImportProvider } from "@/contexts/ImportContext";
import "./i18n/config";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider>
      <ThemeProvider defaultTheme="light" storageKey="pdpi-ui-theme">
        <AuthProvider>
          <MemberSyncProvider>
            <MemberProvider>
              <ImportProvider>
                <App />
                <Toaster />
              </ImportProvider>
            </MemberProvider>
          </MemberSyncProvider>
        </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>
  </StrictMode>
);
