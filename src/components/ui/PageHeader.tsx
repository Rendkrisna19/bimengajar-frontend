import Link from 'next/link';

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
    <section className="bg-primary text-white pt-32 pb-24 md:pt-40 md:pb-32 relative overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 relative z-10 text-center">
        {/* Breadcrumbs */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-blue-200 mb-6 font-medium">
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <span key={index} className="flex items-center gap-2">
                {index > 0 && <span className="text-[10px]">&gt;</span>}
                {isLast || !item.href ? (
                  <span className={isLast ? "text-white" : ""}>{item.label}</span>
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
        <h1 className="text-3xl md:text-5xl font-extrabold mb-5 tracking-tight drop-shadow-sm">{title}</h1>
        
        {/* Description */}
        {description && (
          <p className="text-blue-100/90 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
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
      
      {/* Background Elements & Scattered Motif Songket */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 opacity-[0.07]"></div>
        <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-white rounded-full blur-[120px] translate-x-1/3 translate-y-1/3 opacity-[0.07]"></div>
        
        {/* Texture Motif Background */}
        <div 
          className="absolute inset-0 w-full h-full opacity-15 bg-no-repeat bg-center bg-cover"
          style={{ backgroundImage: 'url(/images/element/1.png)' }}
        ></div>
      </div>
    </section>
  );
}
