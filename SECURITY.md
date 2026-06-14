# Security Policy

## Supported versions

Security fixes are applied to the current `main` branch. This project does not yet
maintain multiple supported release branches.

## Reporting a vulnerability

Do not open a public issue for a vulnerability, exposed credential, private storage
link, or access-control bypass.

Use GitHub's private vulnerability reporting feature for this repository. Include:

- A concise description of the issue.
- Affected routes, files, or deployment configuration.
- Reproduction steps or a minimal proof of concept.
- Potential impact.
- Any suggested mitigation.

If private vulnerability reporting is unavailable, contact the repository owner
privately through the contact method listed on their GitHub profile.

## Credential exposure

If a secret is exposed:

1. Revoke or rotate it immediately.
2. Update the deployment environment.
3. Remove it from the current tree.
4. Review provider logs and repository history.
5. Rewrite Git history only when necessary and coordinate with all maintainers.

Removing a secret from the latest commit does not invalidate it.
