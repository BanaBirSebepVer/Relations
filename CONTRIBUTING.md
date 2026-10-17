# Contributing Guide

This project follows the principles of investigative journalism and open source data archiving. To add a new person, organization, event or relation, follow the steps below. Code, comments and documentation in this repository are written in English.

## 1. Create a New File
- Add your nodes under a topic subdirectory of `_nodes/` (e.g. `_nodes/people/first-last.md`).
- File names must consist of lowercase letters and hyphens (`-`) only.

## 2. Required Fields
Every file must start with the following YAML block:

```yaml
---
id: "same-id-as-the-file-name"
title: "Full Display Name"
type: "person" # or organization, fund, event
lang: "en"     # language of this file (optional, defaults to default_lang)
color: "#HEXCODE" # Optional
relations:
  - target: "target-id"
    type: "partner"
    weight: 4 # 1-5
    evidence: "official_record" # alleged, documented, official_record
---
```

See [template.md](template.md) for every available field.

## 3. Translating Content
To translate a node or a post, add a file next to the original named `<original-name>.<lang>.md` and declare the original with `translation_of`:

```yaml
---
translation_of: "first-last"   # slug (file name without extension) of the original
lang: "tr"
title: "Translated title"
type: "person"
---
Translated body text...
```

- Relations, colors and images are read from the original file only.
- Translated **posts** must repeat `related_nodes` and use the original post's slug (file name without the date and extension) in `translation_of`.

## 4. Adding a New Interface Language
1. Copy `_data/i18n/en.yml` to `_data/i18n/<code>.yml` (use an ISO 639-1 code, e.g. `fr`).
2. Translate the values; keep the keys and `{placeholders}` unchanged. Set `language_name`, `dir` (`ltr` or `rtl`) and `date_format`.
3. Open a pull request. The language appears in the switcher automatically, no code change is needed.
