import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
  useLoaderData,
  type LinksFunction,
  type LoaderFunction,
} from "remix";

import tailwindStylesUrl from "~/styles/tailwind.css";
import globalStylesUrl from "~/styles/global.css";
import { checkLoggedIn, getLoginUrl } from "~/reddit";

type RootData = {
  loginUrl: string;
  isLoggedIn: boolean;
}

export let links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: tailwindStylesUrl },
    { rel: "stylesheet", href: globalStylesUrl },
  ];
};

export let loader: LoaderFunction = async ({ request }) => {
  const isLoggedIn = await checkLoggedIn(request);
  const loginUrl = getLoginUrl();
  return { loginUrl, isLoggedIn };
}

export default function App() {
  return (
    <Document>
      <Layout>
        <Outlet />
      </Layout>
    </Document>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);
  return (
    <Document title="Error!">
      <Layout>
        <div>
          <h1>There was an error</h1>
          <p>{error.message}</p>
          <hr />
          <p>
            Hey, developer, you should replace this with what you want your
            users to see.
          </p>
        </div>
      </Layout>
    </Document>
  );
}

export function CatchBoundary() {
  let caught = useCatch();

  let message;
  switch (caught.status) {
    case 401:
      message = (
        <p>
          Oops! Looks like you tried to visit a page that you do not have access
          to.
        </p>
      );
      break;
    case 404:
      message = (
        <p>Oops! Looks like you tried to visit a page that does not exist.</p>
      );
      break;

    default:
      throw new Error(caught.data || caught.statusText);
  }

  return (
    <Document title={`${caught.status} ${caught.statusText}`}>
      <Layout>
        <h1>
          {caught.status}: {caught.statusText}
        </h1>
        {message}
      </Layout>
    </Document>
  );
}

function Document({
  children,
  title
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        {title ? <title>{title}</title> : null}
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        {process.env.NODE_ENV === "development" && <LiveReload />}
      </body>
    </html>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  const { loginUrl, isLoggedIn } = useLoaderData<RootData>();

  return (
    <div className="app flex flex-col">
      <nav className="flex items-center justify-between flex-wrap bg-gray-900 p-6">
        <div className="flex items-center flex-shrink-0 text-primary mr-6">
          <span className="font-semibold text-xl tracking-tight">Remixitt</span>
        </div>
        <div className="w-full block flex-grow lg:flex lg:items-center lg:w-auto">
          <div className="text-sm lg:flex-grow">
            <p className="text-primary font-semibold">
              Built with <span className="font-normal">❤️</span> using&nbsp;
              <a target="_blank" className="text-secondary underline" href="https://remix.run/">Remix</a> &amp;&nbsp;
              <a target="_blank" className="text-secondary underline" href="https://tailwindcss.com/">tailwindcss</a>
            </p>
            {/* <a href="#responsive-header" className="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white mr-4">
                Home
              </a>
              <a href="#responsive-header" className="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white mr-4">
                Examples
              </a>
              <a href="#responsive-header" className="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white">
                Blog
              </a> */}
          </div>
          <div>
            {!isLoggedIn && (
              <a href={loginUrl} className="inline-block text-sm px-4 py-2 leading-none border rounded text-primary border-white hover:border-transparent hover:bg-green-700 mt-4 lg:mt-0">
                Login
              </a>
            )}
          </div>
        </div>
      </nav>
      <div className="flex flex-grow">
        {children}
      </div>
    </div>
  );
}
