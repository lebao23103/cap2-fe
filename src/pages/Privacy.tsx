import { motion } from 'framer-motion';
import { Shield, Mail } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function Privacy() {
  const lastUpdated = 'January 15, 2025';

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="relative w-full min-h-screen pt-20 pb-12">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl">
                <Shield className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground text-lg">
              Last updated: {lastUpdated}
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Table of Contents - Sticky Sidebar */}
            <nav className="lg:col-span-1 hidden lg:block" aria-label="Privacy policy navigation">
              <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-white/20 sticky top-24">
                <CardContent className="p-6">
                  <h2 className="font-semibold mb-4 text-lg">Contents</h2>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <button
                        onClick={() => scrollToSection('introduction')}
                        className="text-muted-foreground hover:text-primary transition-colors text-left w-full"
                      >
                        Introduction
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection('data-collection')}
                        className="text-muted-foreground hover:text-primary transition-colors text-left w-full"
                      >
                        Data Collection
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection('data-usage')}
                        className="text-muted-foreground hover:text-primary transition-colors text-left w-full"
                      >
                        How We Use Data
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection('data-sharing')}
                        className="text-muted-foreground hover:text-primary transition-colors text-left w-full"
                      >
                        Data Sharing
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection('cookies')}
                        className="text-muted-foreground hover:text-primary transition-colors text-left w-full"
                      >
                        Cookies
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection('security')}
                        className="text-muted-foreground hover:text-primary transition-colors text-left w-full"
                      >
                        Data Security
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection('user-rights')}
                        className="text-muted-foreground hover:text-primary transition-colors text-left w-full"
                      >
                        Your Rights
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection('children')}
                        className="text-muted-foreground hover:text-primary transition-colors text-left w-full"
                      >
                        Children's Privacy
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection('changes')}
                        className="text-muted-foreground hover:text-primary transition-colors text-left w-full"
                      >
                        Policy Changes
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection('contact')}
                        className="text-muted-foreground hover:text-primary transition-colors text-left w-full"
                      >
                        Contact Us
                      </button>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </nav>

            {/* Main Content */}
            <article className="lg:col-span-3">
              <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-white/20">
                <CardContent className="p-6 sm:p-8 lg:p-12 space-y-8">
                  {/* Introduction */}
                  <section id="introduction" className="scroll-mt-24">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4">Introduction</h2>
                    <div className="space-y-4 text-muted-foreground leading-relaxed">
                      <p>
                        Welcome to Knowly. We respect your privacy and are committed to protecting your personal data. 
                        This privacy policy explains how we collect, use, disclose, and safeguard your information when 
                        you use our platform.
                      </p>
                      <p>
                        By using Knowly, you agree to the collection and use of information in accordance with this policy. 
                        If you do not agree with our policies and practices, please do not use our services.
                      </p>
                    </div>
                  </section>

                  {/* Data Collection */}
                  <section id="data-collection" className="scroll-mt-24 pt-8 border-t">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4">Information We Collect</h2>
                    <div className="space-y-4 text-muted-foreground leading-relaxed">
                      <h3 className="text-xl font-semibold text-foreground mt-6">Personal Information</h3>
                      <p>
                        We collect information that you provide directly to us, including:
                      </p>
                      <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Name and email address when you create an account</li>
                        <li>Profile information such as bio and profile picture</li>
                        <li>Payment information if you purchase premium features</li>
                        <li>Communications you send to us</li>
                      </ul>

                      <h3 className="text-xl font-semibold text-foreground mt-6">Usage Information</h3>
                      <p>
                        We automatically collect certain information about your device and how you interact with our platform:
                      </p>
                      <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Reading history and progress</li>
                        <li>Books you favorite or bookmark</li>
                        <li>Quiz scores and performance</li>
                        <li>Notes and highlights you create</li>
                        <li>Device information (browser type, operating system)</li>
                        <li>Log data (IP address, access times, pages viewed)</li>
                      </ul>
                    </div>
                  </section>

                  {/* Data Usage */}
                  <section id="data-usage" className="scroll-mt-24 pt-8 border-t">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4">How We Use Your Information</h2>
                    <div className="space-y-4 text-muted-foreground leading-relaxed">
                      <p>We use the information we collect to:</p>
                      <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Provide, maintain, and improve our services</li>
                        <li>Personalize your reading experience and recommendations</li>
                        <li>Process transactions and send related information</li>
                        <li>Send you technical notices, updates, and support messages</li>
                        <li>Respond to your comments and questions</li>
                        <li>Monitor and analyze trends, usage, and activities</li>
                        <li>Detect, prevent, and address technical issues and fraud</li>
                        <li>Comply with legal obligations</li>
                      </ul>
                    </div>
                  </section>

                  {/* Data Sharing */}
                  <section id="data-sharing" className="scroll-mt-24 pt-8 border-t">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4">Information Sharing and Disclosure</h2>
                    <div className="space-y-4 text-muted-foreground leading-relaxed">
                      <p>
                        We may share your information in the following circumstances:
                      </p>
                      <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>
                          <strong className="text-foreground">With your consent:</strong> We may share your information 
                          when you give us permission to do so
                        </li>
                        <li>
                          <strong className="text-foreground">Service providers:</strong> We may share information with 
                          third-party vendors who perform services on our behalf
                        </li>
                        <li>
                          <strong className="text-foreground">Legal requirements:</strong> We may disclose information 
                          if required by law or to protect our rights
                        </li>
                        <li>
                          <strong className="text-foreground">Business transfers:</strong> In connection with any merger, 
                          sale of assets, or acquisition
                        </li>
                      </ul>
                      <p className="mt-4">
                        <strong className="text-foreground">We do not sell your personal information to third parties.</strong>
                      </p>
                    </div>
                  </section>

                  {/* Cookies */}
                  <section id="cookies" className="scroll-mt-24 pt-8 border-t">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4">Cookies and Tracking Technologies</h2>
                    <div className="space-y-4 text-muted-foreground leading-relaxed">
                      <p>
                        We use cookies and similar tracking technologies to track activity on our platform and store certain information. 
                        Cookies are files with small amount of data that are sent to your browser from a website and stored on your device.
                      </p>
                      <p>
                        You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, 
                        if you do not accept cookies, you may not be able to use some features of our service.
                      </p>
                      <h3 className="text-xl font-semibold text-foreground mt-6">Types of Cookies We Use</h3>
                      <ul className="list-disc list-inside space-y-2 ml-4">
                        <li><strong className="text-foreground">Essential cookies:</strong> Required for the platform to function properly</li>
                        <li><strong className="text-foreground">Preference cookies:</strong> Remember your settings and choices</li>
                        <li><strong className="text-foreground">Analytics cookies:</strong> Help us understand how you use our service</li>
                      </ul>
                    </div>
                  </section>

                  {/* Security */}
                  <section id="security" className="scroll-mt-24 pt-8 border-t">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4">Data Security</h2>
                    <div className="space-y-4 text-muted-foreground leading-relaxed">
                      <p>
                        We take the security of your personal information seriously and use appropriate technical and organizational 
                        measures to protect it. However, no method of transmission over the Internet or electronic storage is 100% secure.
                      </p>
                      <p>
                        We implement industry-standard security measures including:
                      </p>
                      <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Encryption of data in transit and at rest</li>
                        <li>Regular security assessments and updates</li>
                        <li>Access controls and authentication</li>
                        <li>Secure payment processing through trusted providers</li>
                      </ul>
                    </div>
                  </section>

                  {/* User Rights */}
                  <section id="user-rights" className="scroll-mt-24 pt-8 border-t">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4">Your Privacy Rights</h2>
                    <div className="space-y-4 text-muted-foreground leading-relaxed">
                      <p>
                        Depending on your location, you may have certain rights regarding your personal information:
                      </p>
                      <ul className="list-disc list-inside space-y-2 ml-4">
                        <li><strong className="text-foreground">Access:</strong> Request a copy of your personal data</li>
                        <li><strong className="text-foreground">Correction:</strong> Request correction of inaccurate data</li>
                        <li><strong className="text-foreground">Deletion:</strong> Request deletion of your personal data</li>
                        <li><strong className="text-foreground">Portability:</strong> Request transfer of your data</li>
                        <li><strong className="text-foreground">Objection:</strong> Object to processing of your data</li>
                        <li><strong className="text-foreground">Withdraw consent:</strong> Withdraw consent at any time</li>
                      </ul>
                      <p className="mt-4">
                        To exercise these rights, please contact us using the information provided in the Contact section below.
                      </p>
                    </div>
                  </section>

                  {/* Children's Privacy */}
                  <section id="children" className="scroll-mt-24 pt-8 border-t">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4">Children's Privacy</h2>
                    <div className="space-y-4 text-muted-foreground leading-relaxed">
                      <p>
                        Our service is not intended for children under the age of 13. We do not knowingly collect personal 
                        information from children under 13. If you are a parent or guardian and believe your child has provided 
                        us with personal information, please contact us.
                      </p>
                    </div>
                  </section>

                  {/* Changes */}
                  <section id="changes" className="scroll-mt-24 pt-8 border-t">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4">Changes to This Privacy Policy</h2>
                    <div className="space-y-4 text-muted-foreground leading-relaxed">
                      <p>
                        We may update our Privacy Policy from time to time. We will notify you of any changes by posting 
                        the new Privacy Policy on this page and updating the "Last updated" date.
                      </p>
                      <p>
                        We encourage you to review this Privacy Policy periodically for any changes. Changes to this Privacy 
                        Policy are effective when they are posted on this page.
                      </p>
                    </div>
                  </section>

                  {/* Contact */}
                  <section id="contact" className="scroll-mt-24 pt-8 border-t">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4">Contact Us</h2>
                    <div className="space-y-4 text-muted-foreground leading-relaxed">
                      <p>
                        If you have any questions about this Privacy Policy or our data practices, please contact us:
                      </p>
                      <div className="mt-6 p-6 bg-primary/5 border border-primary/20 rounded-lg">
                        <div className="flex items-start gap-3">
                          <Mail className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-foreground">Email</p>
                            <a 
                              href="mailto:privacy@knowly.com" 
                              className="text-primary hover:underline"
                            >
                              privacy@knowly.com
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>
                </CardContent>
              </Card>
            </article>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
