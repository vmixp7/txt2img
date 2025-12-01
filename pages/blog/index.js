import Head from "next/head";
import Navbar from "components/navbar";
import BlogCard from "components/blog-card";
import { getAllPosts } from "data/blog-posts";

export default function BlogIndex({ posts }) {
  return (
    <div>
      <Head>
        <title>Blog - AI美女生成</title>
        <meta name="description" content="AI美女生成官方部落格，分享使用教學、技術解析和最新動態" />
      </Head>

      <Navbar />

      <main className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              AI美女生成 Blog
            </h1>
            <p className="text-xl text-gray-600">
              探索 AI 圖片生成的無限可能
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>

          {posts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">目前沒有文章</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export async function getStaticProps() {
  const posts = getAllPosts();
  return {
    props: {
      posts,
    },
  };
}
