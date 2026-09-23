# EOMasters

Static English-language replacement for the Wix website, prepared for GitHub Pages.
Requires Node.js 22 or newer. There are no npm dependencies and no server-side service.

## Local preview

```sh
npm run build
npm test
npm start
```

Open http://127.0.0.1:8792. Rebuild and refresh after editing content.

## Content

- `content/posts/`: 28 complete blog articles, including dates, original paths, HTML and images.
- `content/newsletters/`: 41 complete newsletter issues, retaining the original `/so/…` paths.
- `content/eo-data.json`: 40 instruments, their sensor types, platforms, themes, operational status and data sources.
- `content/pages/`: imported page content. The build script uses selected pages and images; landing pages, About, Contact and Software & Training are composed in the build script.
- `content/privacy.html`: privacy notice adjusted to the static hosting and direct contact setup.
- `content/asset-sources.json`: provenance mapping for migrated images and downloads.
- `public/assets/`: local media. No image hotlinking or Wix runtime is required.
- `public/styles.css`, `public/site.js`: responsive presentation, navigation and filters.
- `scripts/build.mjs`: static page templates, navigation and legacy redirects.

The data directory filters use OR within a group and AND between groups. “In operation only” adds another constraint. The original data is retained as a migration snapshot; mission-status and access conditions have not been independently re-researched.

To add an article, copy an existing JSON file, choose a unique `/post/…` path, supply an ISO date, title, description and HTML. Add media in `public/assets/`. The build discovers the new file automatically. Update the migration-specific count assertions in the test when deliberately adding or removing records.

## GitHub Pages

Repository: https://github.com/eomasters-repos/eomasters-web

The existing repository already has **Settings → Pages → Source → GitHub Actions** selected. The included workflow builds, tests and deploys after a push to `main`, or on manual dispatch. It obtains the correct path prefix from GitHub Pages, so both the repository URL and a later custom domain work.

The workflow defaults to a **public preview with noindex**. This is not access control. Set the repository Actions variable `PAGES_PREVIEW` to `false` and deploy again for the production launch. Keep it `true` while reviewing the replacement alongside Wix.

Expected initial preview address after successful deployment:
https://eomasters-repos.github.io/eomasters-web/

No commit or push is performed by the build script. No `CNAME` file is needed with this custom Actions publishing workflow: set the domain in the repository Pages settings.

## Domain switch and Medium links

Keep the domain with its current provider. The registrar/DNS provider still needs to be identified.

1. Review the preview, contact details and adapted privacy notice.
2. Verify `eomasters.org` with GitHub using its account-specific TXT record.
3. Set the Pages custom domain to `www.eomasters.org`, matching the existing site's canonical hostname.
4. At the DNS provider, point `www` using CNAME to `eomasters-repos.github.io` and the apex domain using GitHub's documented A/AAAA records (or a supported ALIAS/ANAME).
5. Preserve email-related MX/TXT records and other unrelated DNS entries.
6. Enable HTTPS after GitHub finishes provisioning the certificate. Set `PAGES_PREVIEW=false` and redeploy so canonical URLs, sitemap and robots.txt use the production domain and indexing is enabled.
7. Verify the apex/www redirect, several original article and newsletter URLs, assets and the EO filters before retiring Wix.

The original `/post/<slug>` paths have been retained. Medium links therefore do not need changing when the same domain points to this website. Directory routes gain a trailing slash through GitHub Pages' normal directory handling. Old short URLs such as `/eomtbx` and `/davalien` have static HTML redirects. These optional HTML redirects are not configurable server-side 301 rules.

GitHub documentation:
- https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site
- https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages
- https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/troubleshooting-custom-domains-and-github-pages

## Scope and review notes

- Removed groups, memberships, article comments and the Lemontaps business card.
- Software & Training points to https://www.eomp.info/ with a concise description.
- Replaced the Wix contact/submission forms with working email links and the existing telephone number. Adding a web form later requires a submission service.
- The newsletter has ended, as stated in issue 41; no subscription form is carried over.
- YouTube videos open on YouTube. Four Wix-hosted demonstration videos are stored locally with native playback controls.
- Historical article and newsletter wording is retained. Existing third-party links are preserved; not all historical destinations were individually checked.
- Existing terms and imprint are preserved. The privacy notice reflects the new hosting rather than carrying over Wix's generic references to accounts, tracking and cookies. Owner review of legal/contact details remains appropriate before launch.
- Images were resized to at most 1600 px and converted to WebP where suitable; GIF animations were preserved.

Suggested commit: `Migrate EOMasters from Wix to GitHub Pages`

## Visit statistics and download counts

GitHub Pages can use an external analytics service through a small browser script. No application server is needed for the website. Analytics is optional and is not enabled by this documentation change.

### Website analytics options

| Service | Suitable for | Hosting and cost |
| --- | --- | --- |
| [GoatCounter](https://www.goatcounter.com/) | Basic visits, popular pages, referrers and lightweight statistics without cookies or persistent visitor identifiers. | The hosted service currently allows reasonable public usage, including small-to-medium businesses, for free; donations are accepted. Self-hosting is also possible. |
| [Plausible](https://plausible.io/) | Page views, visits, referrers, outbound links and download-link events in a straightforward dashboard. | Paid managed service hosted in the EU, with cookie-free analytics. |

For a simple starting point, consider GoatCounter for website visits and GitHub's release-asset counters for software downloads. Plausible is an alternative if its integrated event reporting is worth the subscription. Check current service terms and pricing before choosing.

To enable either service later, create a site in the provider's dashboard, add its supplied script to the shared page template in `scripts/build.mjs`, and update `content/privacy.html` to describe the actual setup. Browser-based measurements can undercount when scripts are blocked or disabled.

### GitHub Release asset downloads

GitHub exposes a cumulative `download_count` for each uploaded release asset, such as a ZIP, JAR or installer. This is independent of the website analytics script and can include downloads through direct links or software tools, even when the visitor never opens the website.

The public REST API endpoints are:

```text
GET https://api.github.com/repos/OWNER/REPO/releases/RELEASE_ID/assets
GET https://api.github.com/repos/OWNER/REPO/releases/assets/ASSET_ID
```

The response includes the file name, `browser_download_url` and `download_count`. Public release assets can be queried without authentication, subject to API rate limits. For a daily or monthly trend, save periodic snapshots and calculate the change in each asset's counter. These counters are not unique-user counts or proof of installation.

This applies to files uploaded as **Release assets**. A file merely stored in the repository or served by GitHub Pages is not a Release asset. GitHub Actions workflow artifacts are also a separate feature; deploying a Pages artifact does not provide this release counter for the website's individual files.

See [GitHub's release assets API documentation](https://docs.github.com/en/rest/releases/assets).

### Download clicks versus file downloads

Website analytics can record clicks on a download link. Such an event does not confirm that the transfer completed, and a direct file URL opened from an email or another site bypasses the website's click tracking.

Plausible provides optional [file-download tracking](https://plausible.io/docs/file-downloads-tracking). For files on another domain, such as GitHub Release assets, use outbound-link tracking or a custom event as appropriate. Keep these click statistics separate from GitHub's release-asset counters.
