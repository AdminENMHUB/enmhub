// next.config.mjs
/** @type {import('next').NextConfig} */
const config = {
  typedRoutes: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdsdnueugkfbzbdgsyvi.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
  },
  // If you ever proxy uploads through Next APIs (we're not here), increase this:
  // api: { bodyParser: { sizeLimit: "100mb" } },
};

export default config;
