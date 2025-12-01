import Link from "next/link";

export default function BlogCard({ post }) {
  return (
    <Link href={`/blog/${post.slug}`}>
      <a className="block bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
        <div className="h-48 bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
          <span className="text-white text-6xl">📝</span>
        </div>
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 hover:text-blue-600">
            {post.title}
          </h2>
          <p className="text-gray-600 text-sm mb-4">
            {post.date} • {post.author}
          </p>
          <p className="text-gray-700 line-clamp-3">
            {post.excerpt}
          </p>
          <div className="mt-4">
            <span className="text-blue-600 font-semibold hover:text-blue-800">
              閱讀更多 →
            </span>
          </div>
        </div>
      </a>
    </Link>
  );
}
