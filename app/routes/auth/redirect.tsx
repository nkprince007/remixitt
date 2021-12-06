import { type LoaderFunction, redirect } from "remix";
import { authorize, redditCookie } from "~/reddit";
import invariant from "tiny-invariant";

export let loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  invariant(code, "code is required");

  const data = await authorize(code);
  return redirect("/", {
    headers: { "Set-Cookie": await redditCookie.serialize(data) },
  });
};

export default function AuthRedirect() {
  return (
    <pre>Redirecting...</pre>
  )
}
