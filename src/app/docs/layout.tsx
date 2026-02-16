import { DocsNav } from "@/components/docs-nav";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="sticky top-20">
            <DocsNav />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="prose prose-slate dark:prose-invert max-w-none">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
