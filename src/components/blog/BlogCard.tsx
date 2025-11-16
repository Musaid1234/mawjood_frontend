import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { ArrowRight } from 'lucide-react';
import { Blog } from '@/services/blog.service';

interface BlogCardProps {
  blog: Blog;
}

function stripHtml(html: string, maxLen: number = 140) {
  const text = html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  return text.length > maxLen ? `${text.slice(0, maxLen)}...` : text;
}

export function isBlogVisibleNow(blog: Blog): boolean {
  const now = new Date();
  const anyBlog: any = blog as any;

  const meta =
    anyBlog.tags && typeof anyBlog.tags === 'object' && !Array.isArray(anyBlog.tags)
      ? anyBlog.tags
      : {};

  const rawStatus = (anyBlog.status as 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | undefined) ??
    (blog.published ? 'PUBLISHED' : 'DRAFT');

  let status: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' = 'DRAFT';
  if (typeof meta.status === 'string') {
    const upper = (meta.status as string).toUpperCase();
    if (upper === 'DRAFT' || upper === 'PUBLISHED' || upper === 'SCHEDULED') {
      status = upper;
    } else {
      status = rawStatus || 'DRAFT';
    }
  } else {
    status = rawStatus || 'DRAFT';
  }

  if (status === 'DRAFT') {
    return false;
  }

  if (status === 'SCHEDULED') {
    const schedStr: string | undefined = (anyBlog.scheduledAt as string) ?? (meta.scheduledAt as string | undefined);
    if (!schedStr) return false;
    const schedDate = new Date(schedStr);
    if (isNaN(schedDate.getTime())) return false;
    return schedDate <= now;
  }

  return true;
}

export default function BlogCard({ blog }: BlogCardProps) {
  return (
    <article className="group rounded-2xl overflow-hidden border border-gray-200 bg-white hover:shadow-lg transition-shadow h-[500px] flex flex-col">
      {/* Image */}
      <div className="relative h-56 flex-shrink-0">
        <Link href={`/blog/${blog.slug}`}>
          <Image
            src={
              blog.image ||
              'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=1200&q=80'
            }
            alt={blog.title}
            fill
            unoptimized
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 33vw"
          />
        </Link>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        <div className="text-xs text-gray-500 flex items-center gap-2 mb-2">
          <span>{format(new Date(blog.createdAt), 'MMM d, yyyy')}</span>
        </div>

        {blog.categories && blog.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {blog.categories.slice(0, 3).map((category) => (
              <Link
                key={category.id}
                href={`/blog/category/${category.slug}`}
                className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors"
              >
                {category.name}
              </Link>
            ))}
          </div>
        )}

        <Link
          href={`/blog/${blog.slug}`}
          className="text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors line-clamp-2 mb-3"
        >
          {blog.title}
        </Link>

        <p className="text-sm text-gray-600 line-clamp-3 flex-1">
          {stripHtml(blog.content)}
        </p>

        <Link
          href={`/blog/${blog.slug}`}
          className="mt-4 inline-flex items-center gap-2 text-primary font-medium hover:underline self-start"
        >
          Read More
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </article>
  );
}

