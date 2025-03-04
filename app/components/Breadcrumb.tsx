import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbProps {
  items: {
    label: string;
    href: string;
  }[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-500">
      {items.map((item, index) => (
        <div key={item.href} className="flex items-center">
          {index > 0 && (
            <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
          )}
          <Link
            href={item.href}
            className={`hover:text-gray-900 transition-colors ${
              index === items.length - 1
                ? 'text-gray-900 font-medium'
                : ''
            }`}
          >
            {item.label}
          </Link>
        </div>
      ))}
    </nav>
  );
} 