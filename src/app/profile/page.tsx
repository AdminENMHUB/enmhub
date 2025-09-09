// src/app/profile/page.tsx
import PreferencesForm from "@/components/PreferencesForm";

export default function ProfilePage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Your Preferences</h1>
      <PreferencesForm />
    </div>
  );
}
