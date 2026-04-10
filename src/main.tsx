import { createRoot } from "react-dom/client";
import "./globals.css";
import "./i18n/i18n"; // Initialize i18n
import { App } from "./app/app";
import { Analytics } from "@vercel/analytics/react";

createRoot(document.getElementById("root")!).render(
    // <StrictMode>
    <>
        <App />
        <Analytics />
    </>
    // </StrictMode>,
);