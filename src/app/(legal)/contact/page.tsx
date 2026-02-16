"use client";

import { useState } from "react";
import { Mail, MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, just show a toast message
    toast.success(
      "Thanks for your message! We'll get back to you soon. (Note: This is a demo - no actual email is sent)"
    );
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-muted-foreground">
            Have a question or feedback? We'd love to hear from you!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Contact Form */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="What's this about?"
                  required
                />
              </div>

              <div>
                <Label htmlFor="message">Message</Label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us more..."
                  required
                  rows={6}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <Button type="submit" className="w-full" size="lg">
                <Send className="mr-2 h-4 w-4" />
                Send Message
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Note: This is a demo form. No actual email will be sent.
              </p>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <div className="border rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Email Support</h3>
                  <p className="text-muted-foreground text-sm mb-2">
                    For general inquiries and support
                  </p>
                  <a
                    href="mailto:support@aivenger.com"
                    className="text-primary hover:underline"
                  >
                    support@aivenger.com
                  </a>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">AI Chat Assistant</h3>
                  <p className="text-muted-foreground text-sm mb-2">
                    Get instant help with superhero style tips
                  </p>
                  <a
                    href="/chat"
                    className="text-primary hover:underline"
                  >
                    Open Chat →
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-6">
              <h3 className="font-semibold mb-3">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="/docs" className="text-muted-foreground hover:text-foreground">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="/docs/faq" className="text-muted-foreground hover:text-foreground">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="/docs/how-to-use" className="text-muted-foreground hover:text-foreground">
                    How to Use
                  </a>
                </li>
                <li>
                  <a href="/privacy" className="text-muted-foreground hover:text-foreground">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="/terms" className="text-muted-foreground hover:text-foreground">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10 rounded-lg p-6">
              <h3 className="font-semibold mb-2">Follow Us</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Stay updated with the latest features and news
              </p>
              <div className="flex gap-3">
                <a
                  href="#"
                  className="px-4 py-2 bg-background border rounded-md hover:bg-muted transition-colors text-sm"
                >
                  Twitter
                </a>
                <a
                  href="#"
                  className="px-4 py-2 bg-background border rounded-md hover:bg-muted transition-colors text-sm"
                >
                  Discord
                </a>
                <a
                  href="#"
                  className="px-4 py-2 bg-background border rounded-md hover:bg-muted transition-colors text-sm"
                >
                  GitHub
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t pt-8">
          <p className="text-center text-muted-foreground">
            We typically respond within 24-48 hours. For urgent matters, please
            use the email support.
          </p>
        </div>
      </div>
    </div>
  );
}
