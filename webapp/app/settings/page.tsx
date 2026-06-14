import { T } from "@/lib/i18n";
import AccountSettings from "@/components/AccountSettings";

export default function SettingsPage() {
  return (
    <>
      <h1><T k="settings.title" /></h1>
      <p className="subtitle"><T k="settings.subtitle" /></p>
      <AccountSettings />
    </>
  );
}
