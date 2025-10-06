import Link from "next/link";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <nav className="container">
        <ul>
          <li>
            <strong>Tom's schedule</strong>
          </li>
        </ul>
        <ul>
          <li>
            <Link href="/">
              <span role="img" aria-label="Home">
                🏠
              </span>
            </Link>
          </li>
        </ul>
      </nav>
      {children}
    </>
  );
}
