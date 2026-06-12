import { T } from "@/lib/i18n";
import NewCardWizard from "@/components/NewCardWizard";

export default function NewCardPage() {
  return (
    <>
      <h1><T k="new.title" /></h1>
      <p className="subtitle"><T k="new.subtitle" /></p>
      <NewCardWizard />
    </>
  );
}
