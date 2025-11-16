import { LegalDocument } from '@/components/legal/LegalDocument';

export default function PrivacyPolicyPage() {
  return (
    <LegalDocument
      settingKey="privacy"
      defaultTitle="Privacy Policy"
      defaultFallbackMessage="Our privacy policy will be published here soon. Please check back later."
    />
  );
}

