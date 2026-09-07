import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import { PrintPDFPage } from "./PrintPDFPage"
import "./index.css"

// Check if we're on the print-pdf page
const isPrintPage = window.location.pathname === "/print-pdf"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {isPrintPage ? <PrintPDFPage /> : <App />}
  </React.StrictMode>,
)
