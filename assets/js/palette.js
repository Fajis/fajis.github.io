// Command palette and keyboard shortcuts.
// Entries come from _includes/command-palette.html. Uses $ and $$ from main.js.
//   ⌘K / Ctrl+K, / or ?   open the palette
//   g then a key           jump to a page (data-go)
//   single key             run an entry (data-key)

(function () {
    const dialog = $('#palette');
    if (!dialog || typeof dialog.showModal !== 'function') return;

    const input = $('#paletteInput');
    const empty = $('#paletteEmpty');
    const items = $$('.palette-item', dialog);
    const openButton = $('#paletteOpen');
    let active = null;

    // ---------- Running an entry ----------

    function download(url, filename) {
        const link = Object.assign(document.createElement('a'), { href: url, download: filename });
        document.body.append(link);
        link.click();
        link.remove();
    }

    const actions = {
        theme: () => $('#themeToggle')?.click(),
        cv: () => download(dialog.dataset.cv, 'Fajis-PM-CV.pdf')
    };

    function run(item) {
        if (!item) return;
        close();
        if (item.dataset.action) {
            actions[item.dataset.action]?.();
        } else if (item.dataset.external !== undefined) {
            window.open(item.dataset.url, '_blank', 'noopener');
        } else {
            location.href = item.dataset.url;
        }
    }

    // ---------- Selection and filtering ----------

    const visibleItems = () => items.filter(item => !item.hidden);

    function select(item) {
        items.forEach(i => i.setAttribute('aria-selected', String(i === item)));
        active = item;
        if (item) {
            input.setAttribute('aria-activedescendant', item.id);
            item.scrollIntoView({ block: 'nearest' });
        } else {
            input.removeAttribute('aria-activedescendant');
        }
    }

    function filter() {
        const words = input.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
        items.forEach(item => {
            item.hidden = !words.every(word => item.dataset.search.includes(word));
        });
        const visible = visibleItems();
        empty.hidden = visible.length > 0;
        select(visible[0] || null);
    }

    function move(step) {
        const visible = visibleItems();
        if (!visible.length) return;
        const index = visible.indexOf(active);
        select(visible[(index + step + visible.length) % visible.length]);
    }

    // ---------- Open / close ----------

    function open() {
        if (dialog.open) return;
        input.value = '';
        filter();
        dialog.showModal();
        input.focus();
    }

    function close() {
        if (dialog.open) dialog.close();
    }

    // ---------- Wiring ----------

    items.forEach((item, i) => {
        item.id = `palette-item-${i}`;
        item.addEventListener('click', () => run(item));
        item.addEventListener('mousemove', () => {
            if (active !== item) select(item);
        });
    });

    input.addEventListener('input', filter);
    input.addEventListener('keydown', e => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            move(1);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            move(-1);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            run(active);
        }
    });

    // Click on the backdrop closes
    dialog.addEventListener('click', e => {
        if (e.target === dialog) close();
    });

    openButton?.addEventListener('click', open);

    // Show the right shortcut hint for this computer
    const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
    const hint = $('#paletteShortcut');
    if (hint && !isMac) hint.textContent = 'Ctrl K';

    // ---------- Keyboard shortcuts ----------

    const typing = target => target.closest('input, textarea, select, [contenteditable="true"]');
    let waitingForGo = false;
    let goTimer;

    document.addEventListener('keydown', e => {
        // ⌘K / Ctrl+K works everywhere, even while typing
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            dialog.open ? close() : open();
            return;
        }
        if (dialog.open || e.metaKey || e.ctrlKey || e.altKey || typing(e.target)) return;

        const key = e.key.toLowerCase();

        if (waitingForGo) {
            waitingForGo = false;
            clearTimeout(goTimer);
            const target = items.find(item => item.dataset.go === key);
            if (target) {
                e.preventDefault();
                run(target);
            }
            return;
        }

        if (key === '?' || key === '/') {
            e.preventDefault();
            open();
        } else if (key === 'g') {
            waitingForGo = true;
            goTimer = setTimeout(() => { waitingForGo = false; }, 1200);
        } else {
            const target = items.find(item => item.dataset.key === key);
            if (target) {
                e.preventDefault();
                run(target);
            }
        }
    });
})();
