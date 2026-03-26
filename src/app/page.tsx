import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>wörtl</h1>
      <p className={styles.subtitle}>Willkommen bei wörtl – das deutsche Wordle</p>
    </main>
  );
}
