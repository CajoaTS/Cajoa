# Security policy

## Supported versions

Only the latest release gets fixes. After 1.0, that is the latest 1.x release.

## Reporting a vulnerability

Please do not open a public issue for a security problem.

Use GitHub's private reporting instead: open the **Security** tab of this repository and choose **Report a vulnerability**. You will get an answer within a week. If the problem is real, we will fix it, publish a release, and credit you (if you want).

Things we treat as security problems: cross-site scripting through the server renderer (`@cajoa/server`) or the DOM renderer, unsafe handling of attributes and URLs, and problems in the published packages or the release process.
