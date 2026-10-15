document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("contributors-list");
  if (!window.GITHUB_REPO || !container) return;

  fetch(`https://api.github.com/repos/${window.GITHUB_REPO}/contributors`)
    .then(res => res.json())
    .then(contributors => {
      if (!Array.isArray(contributors)) return;
      container.innerHTML = "";
      contributors.slice(0, 10).forEach(c => {
        const link = document.createElement("a");
        link.href = c.html_url;
        link.target = "_blank";
        link.title = `${c.login} (${c.contributions} katkı)`;
        
        const img = document.createElement("img");
        img.src = c.avatar_url;
        img.alt = c.login;

        link.appendChild(img);
        container.appendChild(link);
      });
    })
    .catch(() => {
      container.parentElement.style.display = "none";
    });
});