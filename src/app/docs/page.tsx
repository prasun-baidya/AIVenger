import Link from "next/link";
import { ArrowRight, Zap, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DocsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-4">Getting Started with AIVenger</h1>
        <p className="text-xl text-muted-foreground">
          Welcome to AIVenger! Transform yourself into a legendary superhero with the power of AI.
        </p>
      </div>

      <div className="border-t pt-8">
        <h2 className="text-2xl font-semibold mb-4">Quick Start Guide</h2>
        <p className="text-muted-foreground mb-6">
          Get started with AIVenger in just a few simple steps:
        </p>

        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
              1
            </div>
            <div>
              <h3 className="font-semibold mb-2">Create Your Account</h3>
              <p className="text-muted-foreground">
                Sign up for a free account to get started. No credit card required!
              </p>
              <Button asChild className="mt-3" size="sm">
                <Link href="/register">
                  Sign Up Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
              2
            </div>
            <div>
              <h3 className="font-semibold mb-2">Upload Your Photo</h3>
              <p className="text-muted-foreground">
                Upload a photo of yourself, friends, family, or even your pets. Our AI works with any photo!
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
              3
            </div>
            <div>
              <h3 className="font-semibold mb-2">Generate Your Superhero</h3>
              <p className="text-muted-foreground">
                Click the generate button and watch as AI transforms your photo into an epic superhero avatar!
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
              4
            </div>
            <div>
              <h3 className="font-semibold mb-2">Download & Share</h3>
              <p className="text-muted-foreground">
                Download your superhero transformation and share it with friends on social media!
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t pt-8">
        <h2 className="text-2xl font-semibold mb-4">System Requirements</h2>
        <div className="bg-muted/50 rounded-lg p-6">
          <ul className="space-y-2 text-muted-foreground">
            <li>• Modern web browser (Chrome, Firefox, Safari, Edge)</li>
            <li>• Stable internet connection</li>
            <li>• Image files: JPG, PNG, or WebP format</li>
            <li>• Maximum file size: 10MB</li>
            <li>• Recommended image resolution: 512x512 or higher</li>
          </ul>
        </div>
      </div>

      <div className="border-t pt-8">
        <h2 className="text-2xl font-semibold mb-4">Need More Help?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/docs/how-to-use"
            className="p-6 border rounded-lg hover:shadow-lg transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <ImageIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                  How to Use Guide
                </h3>
                <p className="text-sm text-muted-foreground">
                  Detailed walkthrough of the transformation process
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/docs/faq"
            className="p-6 border rounded-lg hover:shadow-lg transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                  FAQ
                </h3>
                <p className="text-sm text-muted-foreground">
                  Answers to common questions about AIVenger
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
