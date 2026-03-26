"use client";

import styles from "./Toast.module.css";

type ToastProps = {
  message: string | null;
};

export default function Toast({ message }: ToastProps) {
  if (!message) return null;

  return (
    <div className={styles.toast} role="alert" aria-live="assertive">
      {message}
    </div>
  );
}
