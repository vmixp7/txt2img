import Head from "next/head";
import Link from "next/link";
import { ArrowLeft as ArrowLeftIcon } from "lucide-react";
import Navbar from "components/navbar";
import { getPostBySlug, getAllPosts } from "data/blog-posts";

export default function BlogPost({ post }) {
  if (!post) {
    return (
      <div>
        <Head>
          <title>文章未找到 - AI美女生成</title>
        </Head>
        <Navbar />
        <main className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">文章未找到</h1>
            <Link href="/blog">
              <a className="text-blue-600 hover:text-blue-800">返回 Blog 列表</a>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div>
      <Head>
        <title>{post.title} - AI美女生成 Blog</title>
        <meta name="description" content={post.excerpt} />
      </Head>

      <Navbar />

      <main className="min-h-screen bg-gray-50 py-12">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
            {/* 返回按鈕 */}
            <div className="mb-6">
              <Link href="/blog">
                <a className="inline-flex items-center text-blue-600 hover:text-blue-800">
                  <ArrowLeftIcon className="w-4 h-4 mr-2" />
                  返回 Blog 列表
                </a>
              </Link>
            </div>

            {/* 文章標題 */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {post.title}
            </h1>

            {/* 文章資訊 */}
            <div className="flex items-center text-gray-600 mb-8 pb-8 border-b">
              <span className="mr-4">{post.date}</span>
              <span>•</span>
              <span className="ml-4">{post.author}</span>
            </div>

            {/* 文章內容 */}
            <div className="prose prose-lg max-w-none">
              {post.content.split('\n').map((paragraph, index) => {
                // 處理標題
                if (paragraph.startsWith('# ')) {
                  return (
                    <h1 key={index} className="text-3xl font-bold mt-8 mb-4">
                      {paragraph.replace('# ', '')}
                    </h1>
                  );
                }
                if (paragraph.startsWith('## ')) {
                  return (
                    <h2 key={index} className="text-2xl font-bold mt-6 mb-3">
                      {paragraph.replace('## ', '')}
                    </h2>
                  );
                }
                if (paragraph.startsWith('### ')) {
                  return (
                    <h3 key={index} className="text-xl font-bold mt-4 mb-2">
                      {paragraph.replace('### ', '')}
                    </h3>
                  );
                }

                // 處理列表項
                if (paragraph.startsWith('- ')) {
                  return (
                    <li key={index} className="ml-6 mb-2">
                      {paragraph.replace('- ', '')}
                    </li>
                  );
                }

                // 處理數字列表
                if (/^\d+\./.test(paragraph)) {
                  return (
                    <li key={index} className="ml-6 mb-2 list-decimal">
                      {paragraph.replace(/^\d+\.\s*/, '')}
                    </li>
                  );
                }

                // 處理粗體
                const boldText = paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

                // 普通段落
                if (paragraph.trim()) {
                  return (
                    <p
                      key={index}
                      className="mb-4 text-gray-700 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: boldText }}
                    />
                  );
                }

                return null;
              })}
            </div>

            {/* 分隔線 */}
            <div className="mt-12 pt-8 border-t">
              <Link href="/blog">
                <a className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors">
                  <ArrowLeftIcon className="w-4 h-4 mr-2" />
                  返回 Blog 列表
                </a>
              </Link>
            </div>
          </div>
        </article>
      </main>
    </div>
  );
}

export async function getStaticPaths() {
  const posts = getAllPosts();
  const paths = posts.map((post) => ({
    params: { slug: post.slug },
  }));

  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const post = getPostBySlug(params.slug);
  return {
    props: {
      post,
    },
  };
}
