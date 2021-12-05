import { createCookie } from "remix";

const clientId = process.env.REDDIT_CLIENT_ID;
const clientSecret = process.env.REDDIT_CLIENT_SECRET;
const redirectUri = process.env.REDDIT_AUTH_REDIRECT_URI;
const userAgent = "Remixitt/0.1";

export type RedditPost = {
  preview: {
    enabled: boolean;
  },
  thumbnail: string;
  id: string;
  author: string;
  author_fullname: string;
  url: string;
  title: string;
  selftext: string;
  selftext_html: string;
  subreddit: string;
  created_utc: number;
};

export type RedditAuthData = {
  access_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
  expires_in: number;
}

export const redditCookie = createCookie("reddit_auth", { path: "/", secure: true });

const parameterize = (options: { [key: string]: string | undefined }) => Object.keys(options)
  .map(key => `${key}=${options[key]}`)
  .join("&");

export const getLoginUrl = () => {
  const options = {
    client_id: clientId,
    response_type: "code",
    state: "remixitt",
    redirect_uri: redirectUri,
    duration: "permanent",
    scope: "read",
  }
  const searchString = parameterize(options);
  const redditLoginUrl = "https://www.reddit.com/api/v1/authorize?" + searchString;
  return redditLoginUrl;
};

export const getAuthData = async (request: Request) => {
  const cookieHeader = request.headers.get("Cookie");
  const authData: RedditAuthData = (await redditCookie.parse(cookieHeader)) || {};
  return authData;
}


export const getAuthToken = async (request: Request): Promise<string> => {
  const authData = await getAuthData(request);
  return authData?.access_token;
}

export const checkLoggedIn = async (request: Request): Promise<boolean> => {
  return !!(await getAuthToken(request));
}

export const authorize = async (code: string): Promise<RedditAuthData> => {
  const url = "https://www.reddit.com/api/v1/access_token";
  const body = {
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
  }

  const token = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const result: RedditAuthData = (await fetch(url, {
    method: "post",
    headers: {
      Authorization: `Basic ${token}`,
      'User-Agent': userAgent,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: parameterize(body),
  }).then(res => res.json()));
  return result;
}

export const refreshToken = async (refreshToken: string): Promise<RedditAuthData> => {
  const result = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "post",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'User-Agent': userAgent,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: parameterize({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  }).then(res => res.json());
  return result;
}

export const getPosts = async (request: Request, after: string | null = null): Promise<RedditPost[]> => {
  const token = await getAuthToken(request);
  let url = `https://oauth.reddit.com/best?show=all`;
  if (after) {
    url += `&after=t3_${after}`;
  }

  const result = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`
    },
  }).then(res => res.json())
    .catch((e) => {
      const error = new Error('Failed to fetch home page: ' + e.message);
      throw error;
    });

  const posts: RedditPost[] = result?.data?.children
    .map((post: { data: any }) => post.data) || [];

  return posts;
}
