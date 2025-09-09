// src/app/privacy/page.tsx
export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Privacy Policy</h1>
      <p><strong>Age Gate.</strong> We require confirmation that you are 18+. We do not store age-verification documents in plaintext. If verification is used in the future, sensitive documents will be encrypted and retained only as required.</p>
      <p><strong>Data.</strong> We store account data and content you upload (e.g., posts, photos, albums), and logs necessary to operate the service. Private albums are accessible only to the owner and approved users.</p>
      <p><strong>Storage & Access.</strong> Photos are stored in a private bucket. Access is controlled via per-user rules and expiring signed URLs.</p>
      <p><strong>Safety.</strong> You can report content and block users. We review reports and may remove content or disable accounts.</p>
      <p><strong>Location.</strong> Location is optional and controlled by you. You can set a custom matching location or hide locally.</p>
      <p><strong>Security.</strong> We apply industry-standard protections but no system is 100% secure. Use strong passwords and be cautious with what you share.</p>
    </main>
  );
}
