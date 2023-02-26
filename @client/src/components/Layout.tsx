export const Layout = ({
  breadcrumb,
  children,
  header,
  title,
  nav,
}: {
  children: React.ReactNode
  title: string
  header?: React.ReactNode
  breadcrumb?: React.ReactNode
  nav: { label: string; path: string }[]
}) => {
  return (
    <div className="drawer">
      <input id="nav-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        <div className="w-full navbar bg-base-300 sticky top-0 z-20">
          <div className="flex-none lg:hidden">
            <label htmlFor="nav-drawer" className="btn btn-square btn-ghost">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block w-6 h-6 stroke-current"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </label>
          </div>
          <div className="flex-1 px-2 mx-2 w-full z-20">
            <h2 className="pr-6 w-max whitespace-nowrap">{title}</h2>
            {header}
          </div>

          <div className="flex-none hidden lg:block">
            <ul className="menu menu-horizontal">
              {nav.map((x) => (
                <li key={x.label}>
                  <a href={x.path}>{x.label}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="pl-6 pt-6 z-0 relative">{breadcrumb}</div>
        <div className="p-6 z-0 relative">{children}</div>
      </div>
      <div className="drawer-side">
        <label htmlFor="nav-drawer" className="drawer-overlay"></label>
        <ul className="menu p-4 w-80 bg-base-100">
          {nav.map((x) => (
            <li key={x.label}>
              <a href={x.path}>{x.label}</a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
