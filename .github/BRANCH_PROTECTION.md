# Main branch protection

Apply these settings to `main` after the `verify` workflow has run successfully
on GitHub at least once:

- Require a pull request before merging.
- Require one approval.
- Dismiss stale approvals when new commits are pushed.
- Require review from Code Owners.
- Require status checks to pass.
- Required check: `verify`.
- Require branches to be up to date before merging.
- Require conversation resolution.
- Block force pushes.
- Block branch deletion.
- Do not allow bypassing these settings.

GitHub repository settings:

`Settings → Rules → Rulesets → New branch ruleset`

Target the default branch and enable the settings above. Keeping the expected
check name in this file prevents the ruleset and workflow from drifting apart.
