import React from 'react'
import Navbarlandingpage from '../../components/global/Navbarlandingpage'
import { Mask } from '../../assets/export'

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
            <Navbarlandingpage />
            <div className=" max-w-[87em] mx-auto">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">

                    <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 text-gray-600 text-sm leading-relaxed">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">Introduction</h2>
                        <p>
                            TopX ("the Platform", "we", "our", "us") is a social media platform designed to let users discover, follow, and engage with topics that interest them. This Privacy Policy explains what information we collect, how we use it, how we protect it, and your rights as a user when you engage with TopX.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">Information We Collect</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>
                                <span className="font-semibold text-gray-900">Profile Information:</span> When you sign up, we collect basic information such as your username, email, and a password to create your account.
                            </li>
                            <li>
                                <span className="font-semibold text-gray-900">Topic Interactions:</span> We collect data about the topics you follow, view, interact with, or share on TopX. This includes the time you spend on topic pages and your engagement with topic-specific posts.
                            </li>
                            <li>
                                <span className="font-semibold text-gray-900">Device & Usage Data:</span> Technical data about your device, browser type, operating system, and app usage is collected for platform optimization and security.
                            </li>
                            <li>
                                <span className="font-semibold text-gray-900">Cookies & Trackers:</span> We use cookies and other tracking technologies to personalize your experience, recognize repeat visits, and analyze platform usage.
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">How We Use Your Information</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>To recommend and personalize topic feeds and content based on your topic interests and activity.</li>
                            <li>To improve our services and develop new features tailored to users' topic preferences.</li>
                            <li>For analytics, troubleshooting, and platform security.</li>
                            <li>To communicate with you about service updates or issues relevant to your account or topics you follow.</li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">Sharing of Information</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>
                                <span className="font-semibold text-gray-900">With Service Providers:</span> Data processors and analytics partners who help improve and maintain the platform.
                            </li>
                            <li>
                                <span className="font-semibold text-gray-900">Publicly Shared Content:</span> Any content you post within a topic may be visible to all users.
                            </li>
                            <li>
                                <span className="font-semibold text-gray-900">Legal Requirements:</span> We may share information if required by law or necessary to protect user safety and platform integrity.
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">Data Retention</h2>
                        <p>
                            TopX retains personal data as long as your account is active or as needed for the purposes outlined in this policy. You may delete your account at any time, after which your personal data is generally deleted unless retention is required by law.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">Security</h2>
                        <p>
                            We use appropriate technical and organizational measures to secure your personal information against unauthorized access, disclosure, or loss.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">User Rights</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>
                                <span className="font-semibold text-gray-900">Access:</span> You can request access to your personal data.
                            </li>
                            <li>
                                <span className="font-semibold text-gray-900">Correction:</span> You may update or correct your profile information at any time.
                            </li>
                            <li>
                                <span className="font-semibold text-gray-900">Deletion:</span> You have the right to delete your account and personal data.
                            </li>
                            <li>
                                <span className="font-semibold text-gray-900">Consent:</span> You can adjust or revoke your consent for cookies and marketing preferences at any time.
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">Changes to This Policy</h2>
                        <p>
                            TopX may update this Privacy Policy as our practices change or as required by law. We will notify users of significant changes through the platform or by email.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">Contact Us</h2>
                        <p>
                            If you have any questions about this Privacy Policy, please contact us at <a href="mailto:support@my-topx.com" className="text-blue-600 hover:underline">support@my-topx.com</a>
                        </p>
                    </div>
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

export default PrivacyPolicy