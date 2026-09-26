import { useEffect, useState } from "react";

import { TOAST_EVENT } from "../utils/toast";

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    function handleToast(event) {
      const { message, type = "success" } = event.detail || {};

      if (!message) return;

      const id = Date.now() + Math.random();
      setToasts((current) => [...current, { id, message, type }]);

      window.setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
      }, 3000);
    }

    window.addEventListener(TOAST_EVENT, handleToast);
    return () => window.removeEventListener(TOAST_EVENT, handleToast);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: "fixed",
      top: 20,
      right: 20,
      zIndex: 9999,
      display: "flex",
      flexDirection: "column",
      gap: 10,
    }}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          style={{
            minWidth: 260,
            maxWidth: 360,
            padding: "12px 16px",
            borderRadius: 12,
            background: toast.type === "error" ? "#b92d2d" : "#1e7a4b",
            color: "#fff",
            boxShadow: "0 10px 24px rgba(0,0,0,0.14)",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
