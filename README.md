# fajis.is-a.dev

Personal site, built by GitHub Pages with Jekyll.

## Where things live

| To change… | Edit |
|---|---|
| Email, CV path, location, form | `_config.yml` |
| Menu | `_data/navigation.yml` |
| GitHub / LinkedIn / Instagram | `_data/links.yml` |
| Stack table | `_data/stack.yml` |
| Jobs and projects | `_data/experience.yml` |
| Android apps (home + /downloads/) | `_data/apps.yml` |
| Financial tools | `_data/tools.yml` |
| Page text | `index.html`, `tools.html`, `downloads/index.html`, `404.html` |
| Shared head, header, footer | `_includes/`, `_layouts/default.html` |
| Styles | `assets/css/style.css` |
| Behaviour | `assets/js/main.js` (all pages), `assets/js/tools.js` |

CSS and JS links get a build timestamp, so browsers always load the latest files.

## Run locally

```bash
gem install jekyll -v 3.10.0 webrick
jekyll serve
```

Then open http://localhost:4000.
