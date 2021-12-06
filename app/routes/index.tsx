import moment from "moment";
import React from "react";
import {
  type MetaFunction,
  type LoaderFunction,
  Form,
  redirect,
  useTransition,
  useLoaderData,
  useNavigate
} from "remix";
import {
  checkLoggedIn,
  getAuthData,
  getLoginUrl,
  getPosts,
  redditCookie,
  refreshToken,
  type RedditPost
} from "~/reddit";
import { decode } from "html-entities";
import Loading from "~/components/loader";

type IndexData = {
  loginUrl: string;
  isLoggedIn: boolean;
  posts: any[];
}

export let meta: MetaFunction = () => {
  return {
    title: "Remixitt - A remix app",
    description: "A barebones reddit client"
  };
};

export let loader: LoaderFunction = async ({ request }) => {
  const loginUrl = getLoginUrl();
  const isLoggedIn = await checkLoggedIn(request);
  let posts: RedditPost[] = [];

  try {
    const url = new URL(request.url);
    const after = url.searchParams.get("after") || null;
    posts = await getPosts(request, after);
  } catch (e) {
    const authData = await getAuthData(request);
    const refToken = authData?.refresh_token;
    if (refToken) {
      const newAuthData = await refreshToken(refToken);
      return redirect("/", {
        headers: { "Set-Cookie": await redditCookie.serialize(newAuthData) },
      });
    }
  }

  return { loginUrl, isLoggedIn, posts };
};

export const PostImage = ({ post }: { post: RedditPost }) => {
  let thumbnail: string | null = /*post.preview?.images?.[0]?.source.url ||*/ post.thumbnail;
  if (thumbnail === 'self' || thumbnail === 'default' || thumbnail === 'image' || thumbnail === 'nsfw') {
    thumbnail = null;
  }

  return (
    thumbnail ?
      (
        <div className="w-full md:w-2/5 h-80">
          <img
            className="object-center object-cover w-full h-full"
            src={thumbnail}
            alt="photo" />
        </div>
      ) : <React.Fragment />
  );
}

export function Post({ post }: { post: RedditPost }) {
  const imagePost = !Boolean(post.selftext);
  const postHtml = decode(post.selftext_html);

  return (
    <div className="w-full bg-gray-700 rounded-lg shadow-lg overflow-hidden flex flex-col md:flex-row">
      <PostImage post={post} />
      <div className='w-full text-left p-6 md:p-4 space-y-2'>
        <p className="text-xl text-gray-700 font-bold">
          <a href={post.url} target="_blank" className="text-highlight underline">
            {decode(post.title)}
          </a>
        </p>
        <p className="text-secondary font-normal">
          <a className="font-bold" href={`https://reddit.com/r/${post.subreddit}`}>
            r/{post.subreddit}
          </a>
          &nbsp;<span>•</span>&nbsp;
          Posted by <a
            href={`https://reddit.com/u/${post.author_fullname}`}>
            u/{post.author_fullname}
          </a>
          &nbsp;<span>•</span>&nbsp;
          about {moment.unix(post.created_utc).fromNow()}
        </p>
        {!imagePost && (
          <article
            className="prose"
            dangerouslySetInnerHTML={{ __html: postHtml }}
          />
        )}
      </div>
    </div>
  );
}

export function NavigationButtons() {
  const navigate = useNavigate();
  const goBack = () => navigate(-1);

  return (
    <div className="text-center space-x-4">
      <button onClick={goBack} className="inline-block text-sm px-4 py-2 leading-none border rounded text-primary border-white hover:border-transparent hover:bg-green-700">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" />
        </svg>
      </button>
      <button type="submit" className="inline-block text-sm px-4 py-2 leading-none border rounded text-primary border-white hover:border-transparent hover:bg-green-700">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" />
        </svg>
      </button>
    </div>
  );
}

export function Posts() {
  let { posts } = useLoaderData<IndexData>();
  let transition = useTransition();
  const lastId = posts[posts.length - 1]?.id;

  return (
    transition.state !== 'idle' ? (
      <Loading />
    ) : (
      <Form method="get">
        <div className="mt-8 mb-0">
          <NavigationButtons />
        </div>
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-4 py-12">
          <div className="grid grid-cols-1 gap-12">
            {posts.map(post => (
              <Post key={post.id} post={post} />
            ))}
          </div>
        </section >
        <input type="hidden" value={lastId} name="after" />
        <div className="mb-8 mt-0">
          <NavigationButtons />
        </div>
      </Form>
    )
  );
}

export function Welcome() {
  let { loginUrl } = useLoaderData<IndexData>();
  return (
    <div className="mx-2 text-center">
      <h1 className="text-primary font-extrabold text-4xl xs:text-5xl md:text-6xl">
        Welcome To Remixitt
      </h1>
      <h2 className="text-secondary font-extrabold text-3xl xs:text-4xl md:text-5xl leading-tight mt-4">
        A Simpler way to use Reddit
      </h2>
      <div className="inline-flex mt-12">
        <a href={loginUrl} className="p-2 my-5 mx-2 bg-green-300 hover:bg-green-500 font-bold text-white hover:text-primary rounded border-2 border-transparent hover:border-green-800 shadow-md transition duration-500 md:text-xl">
          Full speed ahead 🚀
        </a>
        <a href="https://reddit.com/" target="_blank" className="p-2 my-5 mx-2 bg-transparent border-2 bg-indigo-200 bg-opacity-75 hover:bg-opacity-100 border-indigo-700 rounded hover:border-indigo-800 font-bold text-indigo-800 shadow-md transition duration-500 md:text-lg">
          Take me to Reddit instead 😕
        </a>
      </div>
    </div>
  );
}

export default function Index() {
  let { isLoggedIn } = useLoaderData<IndexData>();

  return (
    <section className="flex-grow flex items-center justify-center bg-gray-800">
      {isLoggedIn ? <Posts /> : <Welcome />}
    </section>
  );
}
