"use client";

import Link from "next/link";
import { Sparkles, Zap, Users, Shield, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>AI-Powered Avatar Creation</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
            <span className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
              Unleash Your Inner Hero
            </span>
            <br />
            <span className="text-foreground">with AI Avenger Avatars</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Create stunning, personalized superhero avatars powered by advanced AI. Transform yourself into the hero you were meant to be.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button asChild size="lg" className="text-lg px-8 py-6 w-full sm:w-auto">
              <Link href="/register">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg px-8 py-6 w-full sm:w-auto">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>

          {/* Social Proof */}
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-4">
            <div className="flex -space-x-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 border-2 border-background"
                />
              ))}
            </div>
            <span>Join thousands of heroes creating their avatars</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Why Choose AIVenger?
              </h2>
              <p className="text-xl text-muted-foreground">
                The most powerful AI avatar creation platform
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="group p-8 rounded-2xl border bg-card hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">AI-Powered Generation</h3>
                <p className="text-muted-foreground">
                  Advanced AI algorithms create unique, high-quality superhero avatars tailored to your preferences in seconds.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group p-8 rounded-2xl border bg-card hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Infinite Customization</h3>
                <p className="text-muted-foreground">
                  Choose from countless styles, powers, and characteristics to create an avatar that truly represents your hero identity.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group p-8 rounded-2xl border bg-card hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-red-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Your Data, Secure</h3>
                <p className="text-muted-foreground">
                  Enterprise-grade security ensures your creations and personal information are always protected and private.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="border-t">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Create Your Avatar in 3 Steps
              </h2>
              <p className="text-xl text-muted-foreground">
                From zero to hero in minutes
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="relative text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-2">Sign Up Free</h3>
                <p className="text-muted-foreground">
                  Create your account in seconds. No credit card required to start.
                </p>
                {/* Arrow */}
                <div className="hidden md:block absolute top-8 -right-4 text-muted-foreground">
                  <ArrowRight className="h-8 w-8" />
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-2">Customize Your Hero</h3>
                <p className="text-muted-foreground">
                  Choose your style, powers, and personality traits to define your avatar.
                </p>
                {/* Arrow */}
                <div className="hidden md:block absolute top-8 -right-4 text-muted-foreground">
                  <ArrowRight className="h-8 w-8" />
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500 to-red-500 flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-2">Generate & Download</h3>
                <p className="text-muted-foreground">
                  Watch AI create your perfect avatar. Download and use it anywhere.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold">
              Ready to Become a Hero?
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of users creating amazing AI-powered avatars. Start your hero journey today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="text-lg px-8 py-6 w-full sm:w-auto">
                <Link href="/register">
                  Create Your Avatar Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg px-8 py-6 w-full sm:w-auto">
                <Link href="/login">Already a Hero? Sign In</Link>
              </Button>
            </div>
            {/* Trust indicators */}
            <div className="flex items-center justify-center gap-6 pt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>Secure & Private</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-current" />
                <span>Free to Start</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>1000+ Happy Users</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
