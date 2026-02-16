import { ArrowRight } from "lucide-react";

const SHOWCASE_ITEMS = [
  {
    id: 1,
    before: "/placeholder-before-1.jpg",
    after: "/placeholder-after-1.jpg",
    title: "The Iron Guardian",
  },
  {
    id: 2,
    before: "/placeholder-before-2.jpg",
    after: "/placeholder-after-2.jpg",
    title: "Thunder Warrior",
  },
  {
    id: 3,
    before: "/placeholder-before-3.jpg",
    after: "/placeholder-after-3.jpg",
    title: "Shadow Defender",
  },
];

export function BeforeAfterShowcase() {
  return (
    <div className="w-full py-20 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            See the{" "}
            <span className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
              Transformation
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Watch ordinary photos transform into extraordinary superhero avatars
            with the power of AI
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {SHOWCASE_ITEMS.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-lg overflow-hidden border border-border hover:shadow-2xl transition-all"
            >
              <div className="grid grid-cols-2 gap-1">
                {/* Before */}
                <div className="aspect-square relative bg-muted">
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center p-4">
                      <p className="text-sm font-medium mb-2">Regular Photo</p>
                      <div className="w-16 h-16 rounded-full bg-border mx-auto"></div>
                    </div>
                  </div>
                  <div className="absolute top-2 left-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
                    Before
                  </div>
                </div>

                {/* After */}
                <div className="aspect-square relative bg-gradient-to-br from-red-500/20 via-orange-500/20 to-yellow-500/20">
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center p-4">
                      <p className="text-sm font-medium mb-2">Superhero</p>
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 mx-auto"></div>
                    </div>
                  </div>
                  <div className="absolute top-2 left-2 px-2 py-1 bg-primary text-primary-foreground text-xs rounded">
                    After
                  </div>
                </div>
              </div>

              <div className="p-4 bg-card">
                <p className="font-semibold text-center">{item.title}</p>
              </div>

              {/* Hover Arrow */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-primary text-primary-foreground rounded-full p-3">
                  <ArrowRight className="h-6 w-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            * These are placeholder examples. Real transformations coming soon!
          </p>
        </div>
      </div>
    </div>
  );
}
