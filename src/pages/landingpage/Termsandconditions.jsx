import React from 'react'
import Navbarlandingpage from '../../components/global/Navbarlandingpage'
import { Mask } from '../../assets/export'

const Termsandconditions = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
            <Navbarlandingpage />
            <div className=" max-w-[87em] mx-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
         
          <h1 className="text-3xl font-bold text-gray-900">Terms of Use</h1>
          <p className="text-sm text-gray-500 mt-2">Last updated: October 29, 2025</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-gray-600 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Agreement to Terms</h2>
            <p>
              These Terms of Use constitute a legally binding agreement between you ("user" or "you") and TopX ("we", "us", or "our"), regarding your access to and use of the TopX platform, including any media, websites, or applications related to TopX (collectively, "Platform"). By accessing or using TopX, you acknowledge that you have read, understood, and agree to comply with these Terms of Use.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Eligibility</h2>
            <p>
              Users must be at least 13 years old to use TopX. By using TopX, you affirm that you are of legal age and legally able to consent to these terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">User Accounts</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Users may create accounts using accurate, complete, and current information.</li>
              <li>You are responsible for maintaining the confidentiality of your login credentials and for all activity on your account.</li>
              <li>We reserve the right to suspend or terminate accounts that violate these Terms or our community guidelines.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Platform Purpose</h2>
            <p>
              TopX enables users to follow topics of interest. Users may not use TopX to impersonate other individuals or entities or misrepresent themselves.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Prohibited Conduct</h2>
            <p className="mb-2">By using TopX, you agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Post, share, or promote illegal, abusive, defamatory, or hateful content (including hate speech, harassment, graphic violence, or discrimination).</li>
              <li>Upload viruses or use the Platform to spam, phish, or engage in fraudulent activities.</li>
              <li>Violate intellectual property rights or privacy of others.</li>
              <li>Interfere with or disrupt the integrity, security, or operation of TopX.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Content Ownership and Use</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Users retain ownership of their posts but grant TopX a non-exclusive, worldwide license to use, display, and distribute the content on the Platform.</li>
              <li>Users must not upload content to which they do not have the necessary rights or permissions.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Intellectual Property</h2>
            <p>
              All Platform features, including logos, design, trademarks, and technology, are the property of TopX or its licensors. You may not copy, modify, or distribute any part of TopX without written consent.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Privacy</h2>
            <p>
              Your privacy is important to us. Please review the TopX Privacy Policy for details on how your information is collected, used, and protected.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Account Termination and Suspension</h2>
            <p>
              We reserve the right to suspend or delete any account that violates these Terms or engages in harmful conduct. You may also delete your account at any time by contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Third-Party Links</h2>
            <p>
              TopX may contain links to third-party websites. We are not responsible for the content or practices of these external sites.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Amendments to Terms</h2>
            <p>
              TopX may update these Terms at any time. We will notify users of material changes via Platform announcements. Continued use of TopX after changes are posted constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Governing Law</h2>
            <p>
              These Terms are governed by the laws of the jurisdiction in which TopX operates, without regard to conflict of law principles.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Dispute Resolution</h2>
            <p>
              Any disputes arising under these Terms shall be settled through arbitration or mediation where possible, or in the courts of the applicable jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Contact Information</h2>
            <p>
              If you have any questions or concerns about these Terms of Use, please contact us at: <a href="mailto:support@topx.com" className="text-blue-600 hover:underline font-semibold">support@topx.com</a>
            </p>
          </section>
        </div>
      </div>


            <div className="px-20">
                <p className="mt-20 text-gray-500 text-sm text-center py-6 border-t border-gray-300">
                    Copyright © 2025 Top X
                </p>
            </div>


        </div>
    )
}

export default Termsandconditions