import { Outlet, Link } from "react-router";

const Layout = () => {
  return (
    <div>
      <nav>
        <Link to="/">Home</Link>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
