/*
 * Client-side internationalization.
 *
 * UI strings come from `_data/i18n/<code>.yml`, served as /api/i18n.json.
 * Any language file added to that folder shows up in the language switcher.
 *
 * Markup helpers:
 *   data-i18n="key"              -> element.innerHTML
 *   data-i18n-placeholder="key"  -> placeholder attribute
 *   data-i18n-title="key"        -> title attribute
 *
 * Language selection order: ?lang=xx  >  saved choice  >  browser language  >  default.
 * Listen for the "i18n:change" event on `document` to re-render dynamic content.
 */
(function () {
  const STORAGE_KEY = "relations-lang";
  const I18n = {
    lang: null,
    defaultLang: "en",
    languages: {},
    ready: null,

    /** Translate a key; {name} placeholders are replaced from `vars`. */
    t(key, vars, fallback) {
      const lookup = (code) => {
        const dict = this.languages[code] || {};
        return key.split(".").reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), dict);
      };
      let str = lookup(this.lang);
      if (typeof str !== "string") str = lookup(this.defaultLang);
      if (typeof str !== "string") str = fallback !== undefined ? fallback : key;
      return str.replace(/\{(\w+)\}/g, (m, name) => (vars && vars[name] !== undefined ? vars[name] : m));
    },

    /** Picks the best variant ({lang} objects) for the active language. */
    pick(variants) {
      return (
        variants.find((v) => v.lang === this.lang) ||
        variants.find((v) => v.lang === this.defaultLang) ||
        variants.find((v) => !v.is_translation) ||
        variants[0]
      );
    },

    setLang(code, persist = true) {
      if (!this.languages[code]) code = this.defaultLang;
      this.lang = code;
      if (persist) {
        try { localStorage.setItem(STORAGE_KEY, code); } catch (e) { /* storage unavailable */ }
      }
      document.documentElement.lang = code;
      document.documentElement.dir = (this.languages[code] && this.languages[code].dir) || "ltr";
      this.apply();
      document.dispatchEvent(new CustomEvent("i18n:change", { detail: { lang: code } }));
    },

    /** Applies translations to all marked elements under `root`. */
    apply(root = document) {
      root.querySelectorAll("[data-i18n]").forEach((el) => {
        el.innerHTML = this.t(el.getAttribute("data-i18n"));
      });
      root.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
        el.placeholder = this.t(el.getAttribute("data-i18n-placeholder"));
      });
      root.querySelectorAll("[data-i18n-title]").forEach((el) => {
        el.title = this.t(el.getAttribute("data-i18n-title"));
      });
      const titleKey = document.body && document.body.dataset.titleKey;
      document.title = titleKey ? `${this.t(titleKey)} | ${this.t("site_title")}` : this.t("site_title");
      this.renderSwitcher();
    },

    renderSwitcher() {
      const select = document.getElementById("lang-switcher");
      if (!select) return;
      if (!select.dataset.built) {
        Object.keys(this.languages).sort().forEach((code) => {
          const opt = document.createElement("option");
          opt.value = code;
          opt.textContent = this.languages[code].language_name || code;
          select.appendChild(opt);
        });
        select.addEventListener("change", (e) => this.setLang(e.target.value));
        select.dataset.built = "1";
      }
      select.value = this.lang;
    },

    detect() {
      const fromUrl = new URLSearchParams(window.location.search).get("lang");
      let saved = null;
      try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) { /* storage unavailable */ }
      const candidates = [fromUrl, saved].concat(
        (navigator.languages || [navigator.language || ""]).map((l) => l.toLowerCase().split("-")[0])
      );
      return candidates.find((c) => c && this.languages[c]) || this.defaultLang;
    }
  };

  I18n.ready = fetch(window.I18N_URL)
    .then((res) => {
      if (!res.ok) throw new Error(`i18n.json could not be loaded (HTTP ${res.status})`);
      return res.json();
    })
    .then((data) => {
      I18n.languages = data.languages || {};
      I18n.defaultLang = data.default_lang || "en";
      // Resolve only after the DOM is ready and the first language is applied.
      return new Promise((resolve) => {
        const start = () => {
          I18n.setLang(I18n.detect(), false);
          resolve(I18n);
        };
        if (document.readyState === "loading") {
          document.addEventListener("DOMContentLoaded", start);
        } else {
          start();
        }
      });
    })
    .catch((err) => console.error("Translations could not be initialized:", err));

  window.I18n = I18n;
})();
