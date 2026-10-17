# Researcher Relationship Network (Relationship Graph)

An open source archive and visualization project, built on Jekyll and Cytoscape.js, that maps complex relationships between people, organizations and events through Markdown files.

## Features
- **Managed with Markdown and front matter:** No database needed; every node is an independent `.md` file.
- **Dynamic network analysis:** Node sizing by degree centrality, direction arrows and line styles based on the evidence level.
- **80% detail sidebar:** Clicking an actor dims all unrelated actors and opens an in-depth file view.
- **Ghost node support:** Actors without a file do not break the graph; they are listed as drafts.
- **Multilingual:** English and Turkish are built in. Anyone can add a language by adding one file (see below).
- **Zero server cost:** Runs statically on GitHub Pages.

## Local Development

```bash
# Clone the repository
git clone https://github.com/BanaBirSebepVer/Relations.git
cd Relations

# Install dependencies
bundle install

# Start the local server
bundle exec jekyll serve
```

Open http://localhost:4000/Relations/ in your browser to view the graph.

## Languages

- **Interface:** UI texts live in `_data/i18n/<code>.yml` (`en.yml`, `tr.yml`). To add a language, copy `en.yml` to `_data/i18n/<code>.yml` (for example `fr.yml`) and translate the values. It shows up in the language switcher automatically. The fallback language is `default_lang` in `_config.yml`.
- **Content:** A node or post can be translated with a separate file that declares `translation_of` (see [CONTRIBUTING.md](CONTRIBUTING.md)). Untranslated content falls back to the default language, then to the original file.
- The selected language is remembered in the browser; `?lang=xx` in the URL overrides it.
