// Latest public GitHub repos for the section in _includes/github-repos.html.
// Uses $ from main.js. The section stays hidden unless repos load.

(function () {
    const section = $('[data-github-repos]');
    if (!section) return;

    const list = $('.repo-list', section);
    const limit = Number(section.dataset.limit) || 6;
    const url = `https://api.github.com/users/${section.dataset.user}/repos?sort=pushed&per_page=30`;
    const monthYear = new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric' });

    function span(className, text) {
        const el = document.createElement('span');
        el.className = className;
        el.textContent = text;
        return el;
    }

    function repoItem(repo) {
        const link = document.createElement('a');
        link.className = 'index-row';
        link.href = repo.html_url;
        link.target = '_blank';
        link.rel = 'noopener';
        link.append(
            span('index-code', repo.language || '—'),
            span('index-name', repo.name),
            span('index-desc', repo.description || `Updated ${monthYear.format(new Date(repo.pushed_at))}`),
            span('index-go', '↗')
        );
        const item = document.createElement('li');
        item.append(link);
        return item;
    }

    fetch(url, { headers: { Accept: 'application/vnd.github+json' } })
        .then(response => (response.ok ? response.json() : Promise.reject(new Error(`HTTP ${response.status}`))))
        .then(repos => {
            const shown = repos.filter(repo => !repo.fork && !repo.archived).slice(0, limit);
            if (!shown.length) return;
            list.replaceChildren(...shown.map(repoItem));
            section.hidden = false;
        })
        .catch(() => { /* GitHub unreachable or rate-limited: keep the section hidden */ });
})();
