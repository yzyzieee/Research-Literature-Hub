import Link from "next/link";
import type { KeyReference } from "@/lib/types";
import { T } from "@/lib/i18n";

export default function KeyReferencesPanel({
  references,
}: {
  references: KeyReference[];
}) {
  if (!references.length) return null;
  const inLibrary = references.filter(
    (reference) => reference.status === "in_library" && reference.linked_card,
  ).length;
  const external = references.length - inLibrary;

  return (
    <details className="key-references-panel">
      <summary>
        <span><T k="detail.keyReferences" /></span>
        <small>
          {inLibrary} <T k="detail.keyRefsInLibrary" /> · {external} <T k="detail.keyRefsExternal" />
        </small>
      </summary>
      <div className="key-reference-list">
        {references.map((reference, index) => (
          <article className="key-reference-item" key={`${reference.title}-${index}`}>
            <div>
              <div className="key-reference-title">
                {reference.role && (
                  <span className="badge type">{reference.role.replaceAll("_", " ")}</span>
                )}
                <strong>{reference.title}</strong>
              </div>
              <p><b><T k="detail.keyRefReason" />:</b> {reference.reason}</p>
              {(reference.year || reference.doi) && (
                <small>
                  {[reference.year, reference.doi ? `DOI: ${reference.doi}` : ""]
                    .filter(Boolean)
                    .join(" · ")}
                </small>
              )}
            </div>
            {reference.status === "in_library" && reference.linked_card ? (
              <Link className="btn" href={`/cards/${reference.linked_card}`}>
                <T k="detail.keyRefOpen" />
              </Link>
            ) : (
              <span className="badge"><T k="detail.keyRefCandidate" /></span>
            )}
          </article>
        ))}
      </div>
    </details>
  );
}
