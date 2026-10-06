import { Outlet, Link } from "react-router";
import styles from "./Layout.module.css";

const Layout = () => {
  return (
    <>
      <header className={styles.header}>
        <Link to="/" className={styles.title}>
          Where's Waldo
        </Link>
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
};

export default Layout;
