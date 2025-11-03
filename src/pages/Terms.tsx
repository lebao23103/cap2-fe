import { motion } from 'framer-motion';
import { FileText, Mail } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function Terms() {
  const effectiveDate = 'January 15, 2025';

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl">
                <FileText className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
              Terms of Service
            </h1>
            <p className="text-muted-foreground text-lg">
              Effective date: {effectiveDate}
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Table of Contents - Sticky Sidebar */}
            <nav className="lg:col-span-1 hidden lg:block" aria-label="Terms of service navigation">
              <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-white/20 sticky top-24">
                <CardContent className="p-6">
                  <h2 className="font-semibold mb-4 text-lg">Contents</h2>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <button
                        onClick={() => scrollToSection('acceptance')}
                        className="text-muted-foreground hover:text-primary transition-colors text-left w-full"
                      >
                        Acceptance
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection('user-accounts')}
                        className="text-muted-foreground hover:text-primary transition-colors text-left w-full"
                      >
                        User Accounts
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection('content')}
                        className="text-muted-foreground hover:text-primary transition-colors text-left w-full"
                      >
                        Content & Conduct
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection('intellectual-property')}
                        className="text-muted-foreground hover:text-primary transition-colors text-left w-full"
                      >
                        Intellectual Property
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection('restrictions')}
                        className="text-muted-foreground hover:text-primary transition-colors text-left w-full"
                      >
                        Use Restrictions
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection('liability')}
                        className="text-muted-foreground hover:text-primary transition-colors text-left w-full"
                      >
                        Liability
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection('termination')}
                        className="text-muted-foreground hover:text-primary transition-colors text-left w-full"
                      >
                        Termination
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection('changes')}
                        className="text-muted-foreground hover:text-primary transition-colors text-left w-full"
                      >
                        Changes to Terms
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection('governing-law')}
                        className="text-muted-foreground hover:text-primary transition-colors text-left w-full"
                      >
                        Governing Law
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection('contact')}
                        className="text-muted-foreground hover:text-primary transition-colors text-left w-full"
                      >
                        Contact
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
                  {/* Acceptance */}
                  <section id="acceptance" className="scroll-mt-24">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4">Acceptance of Terms</h2>
                    <div className="space-y-4 text-muted-foreground leading-relaxed">
                      <p>
                        Welcome to Knowly. By accessing or using our platform, you agree to be bound by these Terms of Service 
                        and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited 
                        from using or accessing this site.
                      </p>
                      <p>
                        These Terms of Service apply to all users of the platform, including without limitation users who are 
                        browsers, readers, contributors, and/or contributors of content.
                      </p>
                    </div>
                  </section>

                  {/* User Accounts */}
                  <section id="user-accounts" className="scroll-mt-24 pt-8 border-t">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4">User Accounts</h2>
                    <div className="space-y-4 text-muted-foreground leading-relaxed">
                      <h3 className="text-xl font-semibold text-foreground mt-6">Account Creation</h3>
                      <p>
                        To access certain features of Knowly, you must register for an account. When you register for an account, 
                        you agree to:
                      </p>
                      <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Provide accurate, current, and complete information</li>
                        <li>Maintain and promptly update your account information</li>
                        <li>Maintain the security of your password and account</li>
                        <li>Accept all risks of unauthorized access to your account</li>
                        <li>Immediately notify us of any unauthorized use of your account</li>
                      </ul>

                      <h3 className="text-xl font-semibold text-foreground mt-6">Account Responsibilities</h3>
                      <p>
                        You are responsible for all activities that occur under your account. You must be at least 13 years old 
                        to create an account. If you are under 18, you must have your parent or guardian's permission to use 
                        our services.
                      </p>
                    </div>
                  </section>

                  {/* Content and Conduct */}
                  <section id="content" className="scroll-mt-24 pt-8 border-t">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4">Content and Conduct</h2>
                    <div className="space-y-4 text-muted-foreground leading-relaxed">
                      <h3 className="text-xl font-semibold text-foreground mt-6">User-Generated Content</h3>
                      <p>
                        Our platform allows you to post, link, store, share, and otherwise make available certain information, 
                        text, graphics, notes, or other material ("User Content"). You are responsible for the User Content 
                        that you post to the platform.
                      </p>
                      <p>
                        By posting User Content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, 
                        modify, and display such content in connection with operating and providing the platform.
                      </p>

                      <h3 className="text-xl font-semibold text-foreground mt-6">Prohibited Conduct</h3>
                      <p>You agree not to:</p>
                      <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Post content that is illegal, harmful, threatening, abusive, harassing, or offensive</li>
                        <li>Impersonate any person or entity</li>
                        <li>Upload or transmit viruses or malicious code</li>
                        <li>Collect or store personal data about other users without permission</li>
                        <li>Interfere with or disrupt the platform or servers</li>
                        <li>Use the platform for any illegal or unauthorized purpose</li>
                      </ul>
                    </div>
                  </section>

                  {/* Intellectual Property */}
                  <section id="intellectual-property" className="scroll-mt-24 pt-8 border-t">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4">Intellectual Property Rights</h2>
                    <div className="space-y-4 text-muted-foreground leading-relaxed">
                      <p>
                        The platform and its original content (excluding User Content), features, and functionality are and will 
                        remain the exclusive property of Knowly and its licensors. The platform is protected by copyright, 
                        trademark, and other laws.
                      </p>
                      <p>
                        Our trademarks and trade dress may not be used in connection with any product or service without our 
                        prior written consent. All books, materials, and content available on the platform are protected by 
                        copyright and may not be reproduced without permission.
                      </p>
                      <h3 className="text-xl font-semibold text-foreground mt-6">Copyright Infringement</h3>
                      <p>
                        We respect the intellectual property rights of others. If you believe that any content on our platform 
                        infringes your copyright, please contact us with details of the alleged infringement.
                      </p>
                    </div>
                  </section>

                  {/* Restrictions */}
                  <section id="restrictions" className="scroll-mt-24 pt-8 border-t">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4">Use Restrictions</h2>
                    <div className="space-y-4 text-muted-foreground leading-relaxed">
                      <p>You agree not to:</p>
                      <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>
                          Use the platform in any way that could disable, overburden, damage, or impair the site
                        </li>
                        <li>
                          Use any robot, spider, or other automatic device to access the platform
                        </li>
                        <li>
                          Attempt to gain unauthorized access to any portion of the platform
                        </li>
                        <li>
                          Engage in any data mining, data harvesting, or data extracting activities
                        </li>
                        <li>
                          Copy, modify, create derivative works from, or reverse engineer the platform
                        </li>
                        <li>
                          Remove or alter any copyright, trademark, or proprietary rights notices
                        </li>
                        <li>
                          Use the platform for any commercial purpose without our express written permission
                        </li>
                      </ul>
                    </div>
                  </section>

                  {/* Liability */}
                  <section id="liability" className="scroll-mt-24 pt-8 border-t">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4">Limitation of Liability</h2>
                    <div className="space-y-4 text-muted-foreground leading-relaxed">
                      <p>
                        The platform is provided on an "AS IS" and "AS AVAILABLE" basis. We make no warranties, expressed or 
                        implied, and hereby disclaim all warranties including, without limitation, implied warranties of 
                        merchantability, fitness for a particular purpose, or non-infringement.
                      </p>
                      <p>
                        In no event shall Knowly, its directors, employees, or agents be liable for any indirect, incidental, 
                        special, consequential, or punitive damages, including without limitation loss of profits, data, use, 
                        or other intangible losses, resulting from:
                      </p>
                      <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Your access to or use of or inability to access or use the platform</li>
                        <li>Any conduct or content of any third party on the platform</li>
                        <li>Any content obtained from the platform</li>
                        <li>Unauthorized access, use, or alteration of your transmissions or content</li>
                      </ul>
                    </div>
                  </section>

                  {/* Termination */}
                  <section id="termination" className="scroll-mt-24 pt-8 border-t">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4">Termination</h2>
                    <div className="space-y-4 text-muted-foreground leading-relaxed">
                      <p>
                        We may terminate or suspend your account and bar access to the platform immediately, without prior 
                        notice or liability, under our sole discretion, for any reason whatsoever, including without limitation 
                        if you breach the Terms.
                      </p>
                      <p>
                        You may terminate your account at any time by contacting us or through your account settings. All 
                        provisions of the Terms which by their nature should survive termination shall survive, including 
                        ownership provisions, warranty disclaimers, and limitations of liability.
                      </p>
                      <h3 className="text-xl font-semibold text-foreground mt-6">Effect of Termination</h3>
                      <p>
                        Upon termination, your right to use the platform will immediately cease. If you wish to terminate your 
                        account, you may discontinue using the platform. We reserve the right to delete your User Content upon 
                        termination of your account.
                      </p>
                    </div>
                  </section>

                  {/* Changes */}
                  <section id="changes" className="scroll-mt-24 pt-8 border-t">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4">Changes to Terms</h2>
                    <div className="space-y-4 text-muted-foreground leading-relaxed">
                      <p>
                        We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a 
                        revision is material, we will provide at least 30 days' notice prior to any new terms taking effect.
                      </p>
                      <p>
                        What constitutes a material change will be determined at our sole discretion. By continuing to access 
                        or use our platform after any revisions become effective, you agree to be bound by the revised terms.
                      </p>
                    </div>
                  </section>

                  {/* Governing Law */}
                  <section id="governing-law" className="scroll-mt-24 pt-8 border-t">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4">Governing Law and Dispute Resolution</h2>
                    <div className="space-y-4 text-muted-foreground leading-relaxed">
                      <p>
                        These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which 
                        Knowly operates, without regard to its conflict of law provisions.
                      </p>
                      <p>
                        Any dispute arising from or relating to the subject matter of these Terms shall be finally settled by 
                        arbitration, except that we may seek injunctive or other equitable relief in any court of competent 
                        jurisdiction.
                      </p>
                      <h3 className="text-xl font-semibold text-foreground mt-6">Severability</h3>
                      <p>
                        If any provision of these Terms is held to be unenforceable or invalid, such provision will be changed 
                        and interpreted to accomplish the objectives of such provision to the greatest extent possible, and the 
                        remaining provisions will continue in full force and effect.
                      </p>
                    </div>
                  </section>

                  {/* Contact */}
                  <section id="contact" className="scroll-mt-24 pt-8 border-t">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4">Contact Us</h2>
                    <div className="space-y-4 text-muted-foreground leading-relaxed">
                      <p>
                        If you have any questions about these Terms of Service, please contact us:
                      </p>
                      <div className="mt-6 p-6 bg-primary/5 border border-primary/20 rounded-lg">
                        <div className="flex items-start gap-3">
                          <Mail className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-foreground">Email</p>
                            <a 
                              href="mailto:legal@knowly.com" 
                              className="text-primary hover:underline"
                            >
                              legal@knowly.com
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
