import { Zap, Users, Shield, Heart } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold">About AIVenger</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Unleashing the hero within everyone through the power of artificial
            intelligence
          </p>
        </div>

        {/* Mission Section */}
        <div className="border-t pt-12">
          <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            At AIVenger, we believe everyone has an inner hero waiting to be
            unleashed. Our mission is to empower people to see themselves as the
            heroes they truly are by transforming ordinary photos into
            extraordinary superhero avatars using cutting-edge AI technology.
          </p>
        </div>

        {/* What We Do Section */}
        <div className="border-t pt-12">
          <h2 className="text-3xl font-bold mb-6">What We Do</h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            AIVenger is an AI-powered platform that transforms your photos into
            stunning superhero avatars. Whether it's yourself, friends, family,
            or even your pets, we help you create unique superhero versions that
            capture your personality and spirit.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 border rounded-lg">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered</h3>
              <p className="text-muted-foreground">
                Leveraging advanced artificial intelligence to create unique,
                high-quality superhero transformations.
              </p>
            </div>

            <div className="p-6 border rounded-lg">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">For Everyone</h3>
              <p className="text-muted-foreground">
                Accessible to everyone, from casual users to content creators
                looking for unique avatars.
              </p>
            </div>

            <div className="p-6 border rounded-lg">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-500 to-red-500 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Privacy First</h3>
              <p className="text-muted-foreground">
                Your images are stored locally in your browser. We respect your
                privacy and never share your data.
              </p>
            </div>

            <div className="p-6 border rounded-lg">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 flex items-center justify-center mb-4">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Made with Passion</h3>
              <p className="text-muted-foreground">
                Built by a team passionate about combining creativity, technology,
                and fun.
              </p>
            </div>
          </div>
        </div>

        {/* Technology Section */}
        <div className="border-t pt-12">
          <h2 className="text-3xl font-bold mb-6">Our Technology</h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-6">
            AIVenger is built on modern web technologies and powered by advanced
            AI models:
          </p>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold">•</span>
              <span>
                <strong>Next.js 16:</strong> Modern React framework for fast,
                scalable web applications
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold">•</span>
              <span>
                <strong>OpenRouter AI:</strong> Access to 100+ cutting-edge AI
                models for avatar generation
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold">•</span>
              <span>
                <strong>Vercel AI SDK:</strong> Seamless integration with AI
                services for real-time generation
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold">•</span>
              <span>
                <strong>PostgreSQL:</strong> Robust database for user accounts
                and data management
              </span>
            </li>
          </ul>
        </div>

        {/* Team Section */}
        <div className="border-t pt-12">
          <h2 className="text-3xl font-bold mb-6">Our Team</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            AIVenger is created by a passionate team of developers, designers, and
            AI enthusiasts who believe in the power of creativity and technology
            to bring joy to people's lives. We're constantly working to improve
            the platform and add new features to make your superhero
            transformations even more amazing.
          </p>
        </div>

        {/* CTA Section */}
        <div className="border-t pt-12">
          <div className="bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">
              Ready to Unleash Your Inner Hero?
            </h2>
            <p className="text-muted-foreground mb-6">
              Join thousands of users creating amazing superhero avatars with
              AIVenger.
            </p>
            <a
              href="/register"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity font-medium"
            >
              Get Started Free
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
