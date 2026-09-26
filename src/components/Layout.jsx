import Sidebar from "./Sidebar";

export default function Layout({
  children,
  title,
  subtitle,
}) {
  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <header className="page-header">
          <div>
            <h1>{title}</h1>

            {subtitle && (
              <p>{subtitle}</p>
            )}
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}