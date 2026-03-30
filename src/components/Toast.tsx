"use client";

import styles from "./Toast.module.css";

export type ToastVariant = "error" | "loading" | "info";

type ToastProps = {
  message: string | null;
  /** Visual style variant. Defaults to "error" for backward compatibility. */
  variant?: ToastVariant;
};

export default function Toast({ message, variant = "error" }: ToastProps) {
  if (!message) return null;

  const variantClass =
    variant === "loading"
      ? styles.toastLoading
      : variant === "info"
        ? styles.toastInfo
        : styles.toastError;

  return (
    <div
      className={`${styles.toast} ${variantClass}`}
      role={variant === "loading" ? "status" : "alert"}
      aria-live={variant === "loading" ? "polite" : "assertive"}
    >
      {variant === "loading" && (
        <span className={styles.spinner} aria-hidden="true" />
      )}
      {message}
    </div>
  );
}
