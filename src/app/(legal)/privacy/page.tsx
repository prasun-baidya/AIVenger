export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <h1>Privacy Policy</h1>
        <p className="text-muted-foreground">Last updated: February 16, 2026</p>

        <section>
          <h2>1. Introduction</h2>
          <p>
            Welcome to AIVenger ("we," "our," or "us"). We respect your privacy
            and are committed to protecting your personal data. This privacy
            policy will inform you about how we look after your personal data
            and tell you about your privacy rights.
          </p>
        </section>

        <section>
          <h2>2. Data We Collect</h2>
          <p>We may collect, use, store and transfer different kinds of personal data about you:</p>
          <ul>
            <li>
              <strong>Identity Data:</strong> Name, email address, username
            </li>
            <li>
              <strong>Technical Data:</strong> IP address, browser type and
              version, device information
            </li>
            <li>
              <strong>Usage Data:</strong> Information about how you use our
              website and services
            </li>
            <li>
              <strong>Image Data:</strong> Photos you upload for superhero
              transformation (currently stored locally in your browser)
            </li>
          </ul>
        </section>

        <section>
          <h2>3. How We Use Your Data</h2>
          <p>We use your data to:</p>
          <ul>
            <li>Provide and maintain our service</li>
            <li>Process your superhero avatar generation requests</li>
            <li>Manage your account and provide customer support</li>
            <li>Improve our services and develop new features</li>
            <li>Send you important service updates (if you opt-in)</li>
          </ul>
        </section>

        <section>
          <h2>4. Data Storage and Security</h2>
          <p>
            Currently, your uploaded images and generated avatars are stored
            locally in your browser using localStorage technology. This means
            your images remain on your device and are not uploaded to our
            servers.
          </p>
          <p>
            We implement appropriate technical and organizational security
            measures to protect your personal data against unauthorized access,
            alteration, disclosure, or destruction.
          </p>
        </section>

        <section>
          <h2>5. Data Sharing</h2>
          <p>
            We do not sell, trade, or rent your personal information to third
            parties. We may share your data only in the following circumstances:
          </p>
          <ul>
            <li>With your explicit consent</li>
            <li>To comply with legal obligations</li>
            <li>To protect our rights and safety</li>
          </ul>
        </section>

        <section>
          <h2>6. Your Rights</h2>
          <p>Under data protection law, you have rights including:</p>
          <ul>
            <li>The right to access your personal data</li>
            <li>The right to rectify incorrect data</li>
            <li>The right to erase your data</li>
            <li>The right to restrict processing</li>
            <li>The right to data portability</li>
            <li>The right to object to processing</li>
          </ul>
        </section>

        <section>
          <h2>7. Cookies</h2>
          <p>
            We use cookies and similar tracking technologies to improve your
            experience. You can control cookie settings through your browser
            preferences.
          </p>
        </section>

        <section>
          <h2>8. Third-Party Links</h2>
          <p>
            Our website may include links to third-party websites. We are not
            responsible for the privacy practices of these external sites.
          </p>
        </section>

        <section>
          <h2>9. Children's Privacy</h2>
          <p>
            Our service is not intended for children under 13. We do not
            knowingly collect personal information from children under 13.
          </p>
        </section>

        <section>
          <h2>10. Changes to This Policy</h2>
          <p>
            We may update this privacy policy from time to time. We will notify
            you of any changes by posting the new policy on this page and
            updating the "Last updated" date.
          </p>
        </section>

        <section>
          <h2>11. Contact Us</h2>
          <p>
            If you have any questions about this privacy policy or our privacy
            practices, please contact us at:
          </p>
          <p>
            Email: <a href="mailto:privacy@aivenger.com">privacy@aivenger.com</a>
          </p>
        </section>
      </div>
    </div>
  );
}
