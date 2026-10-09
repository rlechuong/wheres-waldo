import { Link, useRouteError, isRouteErrorResponse } from "react-router";
import styles from "./ErrorPage.module.css";

const ErrorPage = () => {
  const error = useRouteError();

  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : "Something went wrong.";

  return (
    <section className={styles.errorPage}>
      <h1>{message}</h1>
      <p>Sorry, that didn't work as expected.</p>
      <Link to="/" className="button-link">
        All scenes
      </Link>
    </section>
  );
};

export default ErrorPage;
