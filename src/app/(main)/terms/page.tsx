import { LegalDocument } from '@/components/legal/LegalDocument';

export default function TermsPage() {
  return (
    <LegalDocument
      settingKey="terms"
      defaultTitle="Terms & Conditions"
      defaultFallbackMessage="Our terms and conditions will be available soon. Please check back later."
    />
  );
}

