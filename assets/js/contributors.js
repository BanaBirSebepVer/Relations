document.addEventListener("DOMContentLoaded", () => {
  const listContainer = document.getElementById("contributors-list");
  if (!listContainer) return;

  // 1. Repo adını belirle (Önce manuel ayara bak, yoksa URL'den otomatik çıkar)
  let repo = window.GITHUB_REPO;

  if (!repo || repo.trim() === "") {
    const host = window.location.hostname; // Örn: banabirsebepver.github.io
    const pathParts = window.location.pathname.split('/').filter(Boolean); // Örn: ["Relations"]

    if (host.endsWith(".github.io")) {
      const owner = host.split(".")[0];
      const repoName = pathParts.length > 0 ? pathParts[0] : `${owner}.github.io`;
      repo = `${owner}/${repoName}`;
    }
  }

  // Yerel (localhost) çalışmada veya repo bulunamadığında varsayılan repo:
  if (!repo) {
    repo = "banabirsebepver/Relations";
  }

  // 2. GitHub API'den katkıcıları çek
  fetch(`https://api.github.com/repos/${repo}/contributors`)
    .then(response => {
      if (!response.ok) throw new Error("API yanıt vermedi");
      return response.json();
    })
    .then(contributors => {
      if (!Array.isArray(contributors) || contributors.length === 0) {
        listContainer.innerHTML = "<small style='color:#64748b;'>Henüz katkıcı bulunmuyor.</small>";
        return;
      }

      listContainer.innerHTML = ""; // Önceki içeriği temizle

      contributors.forEach(user => {
        // GitHub botlarını (örn: github-actions[bot]) listeden hariç tut
        if (user.type === "Bot") return;

        const link = document.createElement("a");
        link.href = user.html_url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.className = "contributor-item";
        link.title = `${user.login} (${user.contributions} katkı)`;

        const img = document.createElement("img");
        // Performans için avatarları 64px boyutunda çekiyoruz
        img.src = `${user.avatar_url}&s=64`;
        img.alt = user.login;
        img.className = "contributor-avatar";

        link.appendChild(img);
        listContainer.appendChild(link);
      });
    })
    .catch(err => {
      console.warn("Katkıcılar yüklenemedi:", err);
      listContainer.innerHTML = "<small style='color:#64748b;'>Katkıcı listesi yüklenemedi.</small>";
    });
});