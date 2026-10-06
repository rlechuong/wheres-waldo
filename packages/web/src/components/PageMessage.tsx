import type { ReactNode } from "react";
import styles from "./PageMessage.module.css";

const PageMessage = ({ children }: { children: ReactNode }) => (
  <section className={styles.message}>{children}</section>
);

export default PageMessage;
