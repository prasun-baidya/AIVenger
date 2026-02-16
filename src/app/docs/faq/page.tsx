import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
        <p className="text-xl text-muted-foreground">
          Find answers to common questions about AIVenger
        </p>
      </div>

      <div className="border-t pt-8">
        <h2 className="text-2xl font-semibold mb-6">Account & Getting Started</h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="signup">
            <AccordionTrigger>Do I need an account to use AIVenger?</AccordionTrigger>
            <AccordionContent>
              Yes, you need a free account to create superhero transformations. Sign up takes less than a minute and requires no credit card.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="free">
            <AccordionTrigger>Is AIVenger really free?</AccordionTrigger>
            <AccordionContent>
              Yes! AIVenger offers a free tier that allows you to create superhero avatars. Premium features and higher generation limits will be available in the future.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="platforms">
            <AccordionTrigger>What devices can I use AIVenger on?</AccordionTrigger>
            <AccordionContent>
              AIVenger works on any modern device with a web browser - desktop, laptop, tablet, or smartphone. We recommend using Chrome, Firefox, Safari, or Edge for the best experience.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="border-t pt-8">
        <h2 className="text-2xl font-semibold mb-6">Generation & Images</h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="types">
            <AccordionTrigger>What types of photos work best?</AccordionTrigger>
            <AccordionContent>
              <p className="mb-2">For best results, use photos that:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Are well-lit and clear</li>
                <li>Show the face prominently</li>
                <li>Are high resolution (512x512 or higher)</li>
                <li>Are not heavily filtered or edited</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="pets">
            <AccordionTrigger>Can I transform photos of my pets?</AccordionTrigger>
            <AccordionContent>
              Absolutely! AIVenger works with photos of pets, friends, family, or anyone you'd like to turn into a superhero. Just upload the photo and watch the magic happen!
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="time">
            <AccordionTrigger>How long does generation take?</AccordionTrigger>
            <AccordionContent>
              Generation typically takes 3-5 seconds. The AI analyzes your photo and creates a unique superhero transformation. If it takes longer than 10 seconds, try refreshing the page.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="formats">
            <AccordionTrigger>What image formats are supported?</AccordionTrigger>
            <AccordionContent>
              AIVenger supports JPG, PNG, and WebP image formats. Maximum file size is 10MB. If your image is larger, try compressing it before uploading.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="multiple">
            <AccordionTrigger>Can I create multiple versions from the same photo?</AccordionTrigger>
            <AccordionContent>
              Yes! You can upload the same photo multiple times and get different superhero transformations. Each generation is unique, so feel free to experiment!
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="border-t pt-8">
        <h2 className="text-2xl font-semibold mb-6">Privacy & Security</h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="privacy">
            <AccordionTrigger>Is my data secure?</AccordionTrigger>
            <AccordionContent>
              Yes! Your uploaded images are currently stored locally in your browser using localStorage. We take privacy seriously and never share your photos with third parties.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="storage">
            <AccordionTrigger>Where are my images stored?</AccordionTrigger>
            <AccordionContent>
              Currently, your generated avatars are stored locally in your browser's localStorage. This means your images stay on your device and are not uploaded to our servers.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="delete">
            <AccordionTrigger>Can I delete my generated avatars?</AccordionTrigger>
            <AccordionContent>
              Yes! You can delete any generated avatar from your gallery at any time. Just hover over the avatar and click the delete button, then confirm the deletion.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="border-t pt-8">
        <h2 className="text-2xl font-semibold mb-6">Technical Issues</h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="upload-fail">
            <AccordionTrigger>Why is my upload failing?</AccordionTrigger>
            <AccordionContent>
              Common reasons for upload failures:
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 mt-2">
                <li>File size exceeds 10MB - try compressing the image</li>
                <li>Unsupported format - use JPG, PNG, or WebP</li>
                <li>Slow internet connection - check your connection and try again</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="generation-fail">
            <AccordionTrigger>What if generation fails?</AccordionTrigger>
            <AccordionContent>
              If generation fails, try these steps:
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 mt-2">
                <li>Refresh the page and try again</li>
                <li>Clear your browser cache</li>
                <li>Try a different photo</li>
                <li>Check your internet connection</li>
                <li>Try using a different browser</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="download">
            <AccordionTrigger>How do I download my generated avatar?</AccordionTrigger>
            <AccordionContent>
              Navigate to your Gallery, hover over the avatar you want to download, and click the "Download" button. The image will be saved to your device's default downloads folder.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="border-t pt-8">
        <div className="bg-muted/50 rounded-lg p-6">
          <h3 className="font-semibold mb-2">Still have questions?</h3>
          <p className="text-muted-foreground mb-4">
            If you couldn't find the answer you were looking for, feel free to reach out to us.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center text-primary hover:underline"
          >
            Contact Support →
          </a>
        </div>
      </div>
    </div>
  );
}
