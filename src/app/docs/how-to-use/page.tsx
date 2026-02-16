import { Upload, Sparkles, Download, Shield } from "lucide-react";

export default function HowToUsePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-4">How to Use AIVenger</h1>
        <p className="text-xl text-muted-foreground">
          A complete guide to creating amazing superhero transformations
        </p>
      </div>

      <div className="border-t pt-8">
        <h2 className="text-2xl font-semibold mb-6">Step-by-Step Tutorial</h2>

        <div className="space-y-8">
          {/* Step 1 */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                <Upload className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold">1. Upload Your Photo</h3>
            </div>
            <div className="ml-15 pl-6 border-l-2 border-border space-y-3">
              <p className="text-muted-foreground">
                Navigate to your dashboard after signing in. You'll see a large upload area where you can either:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Drag and drop your photo directly onto the upload area</li>
                <li>Click the upload area to browse and select a file from your device</li>
              </ul>
              <div className="bg-muted/50 rounded-lg p-4 mt-4">
                <p className="text-sm font-medium mb-2">✨ Tips for Best Results:</p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Use well-lit, clear photos</li>
                  <li>• Face should be visible and centered</li>
                  <li>• Higher resolution images work better (512x512 or higher)</li>
                  <li>• Avoid heavily filtered or edited photos</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold">2. Generate Your Superhero Avatar</h3>
            </div>
            <div className="ml-15 pl-6 border-l-2 border-border space-y-3">
              <p className="text-muted-foreground">
                Once your photo is uploaded, you'll see a preview. Review it to make sure it looks good, then:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Click the "Generate Superhero Avatar" button</li>
                <li>Wait 3-5 seconds while our AI works its magic</li>
                <li>Watch the transformation happen in real-time!</li>
              </ul>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mt-4">
                <p className="text-sm">
                  <strong className="text-blue-600 dark:text-blue-400">Note:</strong> Generation typically takes 3-5 seconds. The AI is analyzing your photo and creating a unique superhero transformation just for you!
                </p>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-red-500 flex items-center justify-center">
                <Download className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold">3. View & Download Your Result</h3>
            </div>
            <div className="ml-15 pl-6 border-l-2 border-border space-y-3">
              <p className="text-muted-foreground">
                After generation completes, your superhero avatar will be displayed:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>View your transformation in the dashboard's "Recent Transformations" section</li>
                <li>Navigate to your Gallery to see all your creations</li>
                <li>Click the download button to save the image to your device</li>
                <li>Share your superhero avatar on social media!</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t pt-8">
        <h2 className="text-2xl font-semibold mb-4">Understanding Your Results</h2>
        <div className="bg-muted/50 rounded-lg p-6 space-y-4">
          <p className="text-muted-foreground">
            Your generated superhero avatar is a unique AI creation based on your uploaded photo. The AI analyzes facial features, expressions, and characteristics to create a superhero version that maintains your likeness while adding heroic elements.
          </p>
          <p className="text-muted-foreground">
            Each generation is unique - even if you upload the same photo twice, you may get slightly different results as the AI explores different creative interpretations!
          </p>
        </div>
      </div>

      <div className="border-t pt-8">
        <h2 className="text-2xl font-semibold mb-4">Troubleshooting Common Issues</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Upload Failed</h3>
            <p className="text-muted-foreground text-sm">
              Make sure your image is under 10MB and in JPG, PNG, or WebP format. Try compressing large images before uploading.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Generation Taking Too Long</h3>
            <p className="text-muted-foreground text-sm">
              If generation takes more than 10 seconds, refresh the page and try again. Check your internet connection.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Result Not Satisfactory</h3>
            <p className="text-muted-foreground text-sm">
              Try uploading a different photo with better lighting and a clearer face. You can also generate multiple times with the same photo to get different results!
            </p>
          </div>
        </div>
      </div>

      <div className="border-t pt-8">
        <div className="bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">Your Privacy Matters</h3>
              <p className="text-sm text-muted-foreground">
                All uploaded images are processed securely and stored locally in your browser. We take your privacy seriously and never share your photos with third parties.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
