import Link from 'next/link';
import Image from 'next/image';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string | React.ReactNode;
  description?: string;
  breadcrumbs: BreadcrumbItem[];
  children?: React.ReactNode;
}

export default function PageHeader({ title, description, breadcrumbs, children }: PageHeaderProps) {
  return (
    <section className="bg-primary text-white pt-32 pb-24 md:pt-40 md:pb-32 relative overflow-hidden border-t-4 border-b-4 border-[#fbbf24]">
      {/* Background Image /images/header.jpg with 20% Opacity over Primary Blue */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image
          src="/images/header.jpg"
          alt="Header Background"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-20 mix-blend-overlay"
          unoptimized
        />
      </div>

      <div className="max-w-[1200px] mx-auto px-4 md:px-8 relative z-10 text-center">
        {/* Breadcrumbs */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-blue-200 mb-6 font-medium">
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <span key={index} className="flex items-center gap-2">
                {index > 0 && <span className="text-[10px]">&gt;</span>}
                {isLast || !item.href ? (
                  <span className={isLast ? "text-white font-semibold" : ""}>{item.label}</span>
                ) : (
                  <Link href={item.href} className="hover:text-white transition-colors">
                    {item.label}
                  </Link>
                )}
              </span>
            );
          })}
        </div>
        
        {/* Title */}
        <h1 className="text-3xl md:text-5xl font-extrabold mb-5 tracking-tight drop-shadow-md">{title}</h1>
        
        {/* Description */}
        {description && (
          <p className="text-blue-100/95 max-w-2xl mx-auto text-base md:text-lg leading-relaxed font-medium drop-shadow-sm">
            {description}
          </p>
        )}

        {/* Optional Custom Subviews/Tabs */}
        {children && (
          <div className="mt-8">
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
