export const TOAST_EVENT = "milkcollect:toast";

export function showToast(message, type = "success") {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent(TOAST_EVENT, {
      detail: { message, type },
    })
  );
}
