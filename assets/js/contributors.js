document.addEventListener("DOMContentLoaded", async () => {
  const listContainer = document.getElementById("contributors-list");
  if (!listContainer) return;

  await window.I18n.ready;
  const I18n = window.I18n;

  // 1. Determine the repository (manual setting first, otherwise infer from the URL)
  let repo = window.GITHUB_REPO;

  if (!repo || repo.trim() === "") {
    const host = window.location.hostname; // e.g. banabirsebepver.github.io
    const pathParts = window.location.pathname.split('/').filter(Boolean); // e.g. ["Relations"]

    if (host.endsWith(".github.io")) {
      const owner = host.split(".")[0];
      const repoName = pathParts.length > 0 ? pathParts[0] : `${owner}.github.io`;
      repo = `${owner}/${repoName}`;
    }
  }

  // Default repository for local development or when no repository is found:
  if (!repo) {
    repo = "banabirsebepver/Relations";
  }

  // The message is re-translated when the language changes
  let statusKey = null;
  const showStatus = (key) => {
    statusKey = key;
    const msg = document.createElement("small");
    msg.style.color = "#64748b";
    msg.textContent = I18n.t(key);
    listContainer.replaceChildren(msg);
  };

  let contributorList = [];
  const render = () => {
    if (statusKey) return showStatus(statusKey);
    listContainer.replaceChildren();
    contributorList.forEach(user => {
      const link = document.createElement("a");
      link.href = user.html_url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.className = "contributor-item";
      link.title = I18n.t("contribution_count", { login: user.login, count: user.contributions });

      const img = document.createElement("img");
      // Request 64px avatars for performance
      img.src = `${user.avatar_url}&s=64`;
      img.alt = user.login;
      img.className = "contributor-avatar";

      link.appendChild(img);
      listContainer.appendChild(link);
    });
  };
  document.addEventListener("i18n:change", render);

  // 2. Fetch contributors from the GitHub API
  fetch(`https://api.github.com/repos/${repo}/contributors`)
    .then(response => {
      if (!response.ok) throw new Error("The API did not respond");
      return response.json();
    })
    .then(contributors => {
      // Exclude GitHub bots (e.g. github-actions[bot])
      contributorList = Array.isArray(contributors) ? contributors.filter(u => u.type !== "Bot") : [];
      if (contributorList.length === 0) return showStatus("no_contributors");
      statusKey = null;
      render();
    })
    .catch(err => {
      console.warn("Contributors could not be loaded:", err);
      showStatus("contributors_failed");
    });
});
