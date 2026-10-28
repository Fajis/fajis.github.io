// Site language. English lives in the HTML; Malayalam comes from the dictionary
// below, keyed by the English text. Switching swaps text nodes and a few
// attributes in place and remembers the choice.

(function () {
    const ML = {
        // Shared: navigation, footer, page titles
        'Skip to content': 'ഉള്ളടക്കത്തിലേക്ക് പോകുക',
        'Menu': 'മെനു',
        'Close': 'അടയ്ക്കുക',
        'Light': 'ലൈറ്റ്',
        'Dark': 'ഡാർക്ക്',
        'Switch to light theme': 'ലൈറ്റ് തീമിലേക്ക് മാറുക',
        'Switch to dark theme': 'ഡാർക്ക് തീമിലേക്ക് മാറുക',
        'About': 'എന്നെക്കുറിച്ച്',
        'Stack': 'സ്റ്റാക്ക്',
        'Work': 'പ്രോജക്ടുകൾ',
        'Contact': 'ബന്ധപ്പെടുക',
        'Tools': 'ടൂളുകൾ',
        'Home': 'ഹോം',
        'Pages': 'പേജുകൾ',
        'Products': 'പ്രോഡക്ടുകൾ',
        'Links': 'ലിങ്കുകൾ',
        'Primary': 'പ്രധാന മെനു',
        'Site': 'സൈറ്റ്',
        'Elsewhere': 'മറ്റിടങ്ങളിൽ',
        'Android apps': 'ആൻഡ്രോയിഡ് ആപ്പുകൾ',
        'Financial tools': 'ഫിനാൻഷ്യൽ ടൂളുകൾ',
        'Stay Fit privacy': 'Stay Fit സ്വകാര്യതാ നയം',
        'Fajis PM — PHP, React Native & MySQL Developer': 'Fajis PM — PHP, React Native, MySQL ഡെവലപ്പർ',
        'Financial Tools — Fajis PM': 'ഫിനാൻഷ്യൽ ടൂളുകൾ — Fajis PM',
        'Apps — Fajis PM': 'ആപ്പുകൾ — Fajis PM',

        // Home: hero
        'Bahrain ·': 'ബഹ്റൈൻ ·',
        'local': 'പ്രാദേശിക സമയം',
        'I build PHP backends,': 'ഞാൻ PHP ബാക്കെൻഡുകൾ,',
        'React Native apps': 'React Native ആപ്പുകൾ,',
        'and MySQL databases.': 'MySQL ഡാറ്റാബേസുകൾ നിർമ്മിക്കുന്നു.',
        "I'm a full-stack and mobile developer. I plan, build and launch apps — and the servers behind them.":
            'ഞാൻ ഒരു ഫുൾ-സ്റ്റാക്ക്, മൊബൈൽ ഡെവലപ്പർ ആണ്. ആപ്പുകളും അവയ്ക്ക് പിന്നിലെ സെർവറുകളും ഞാൻ പ്ലാൻ ചെയ്യുന്നു, നിർമ്മിക്കുന്നു, ലോഞ്ച് ചെയ്യുന്നു.',
        'See my work': 'എന്റെ പ്രോജക്ടുകൾ കാണുക',
        'Contact me': 'എന്നെ ബന്ധപ്പെടുക',
        'Apps live': 'ലൈവ് ആപ്പുകൾ',
        '3 on Google Play': 'Google Play-ൽ 3 എണ്ണം',
        'Location': 'സ്ഥലം',
        'Bahrain, works remotely': 'ബഹ്റൈൻ, റിമോട്ടായി ജോലി ചെയ്യുന്നു',
        'Status': 'സ്റ്റാറ്റസ്',
        'Open to new projects': 'പുതിയ പ്രോജക്ടുകൾക്ക് തയ്യാർ',

        // Home: about
        'I write clean, fast code that is easy to grow.':
            'വൃത്തിയുള്ളതും വേഗതയുള്ളതും എളുപ്പത്തിൽ വളർത്താവുന്നതുമായ കോഡ് ഞാൻ എഴുതുന്നു.',
        'I work on every part of an app: the server (PHP and Node.js), the database (MySQL) and the mobile app (React Native). I keep the code simple, so it is easy to change later.':
            'ഒരു ആപ്പിന്റെ എല്ലാ ഭാഗങ്ങളിലും ഞാൻ ജോലി ചെയ്യുന്നു: സെർവർ (PHP, Node.js), ഡാറ്റാബേസ് (MySQL), മൊബൈൽ ആപ്പ് (React Native). പിന്നീട് മാറ്റാൻ എളുപ്പമാകാൻ ഞാൻ കോഡ് ലളിതമായി സൂക്ഷിക്കുന്നു.',
        'Fast': 'വേഗത',
        'Pages, apps and database queries that load quickly.': 'വേഗത്തിൽ ലോഡ് ആകുന്ന പേജുകൾ, ആപ്പുകൾ, ഡാറ്റാബേസ് ക്വറികൾ.',
        'Ready to grow': 'വളരാൻ തയ്യാർ',
        'Code and data planned to handle more users.': 'കൂടുതൽ ഉപയോക്താക്കളെ കൈകാര്യം ചെയ്യാൻ പ്ലാൻ ചെയ്ത കോഡും ഡാറ്റയും.',
        'Easy to maintain': 'പരിപാലിക്കാൻ എളുപ്പം',
        'Clear code that other developers can pick up.': 'മറ്റ് ഡെവലപ്പർമാർക്ക് എളുപ്പം മനസ്സിലാകുന്ന വ്യക്തമായ കോഡ്.',

        // Home: stack
        'Tools I use.': 'ഞാൻ ഉപയോഗിക്കുന്ന ടൂളുകൾ.',
        'Area': 'മേഖല',
        'What for': 'എന്തിന്',
        'Backend': 'ബാക്കെൻഡ്',
        'APIs and server logic': 'API-കളും സെർവർ ലോജിക്കും',
        'Mobile': 'മൊബൈൽ',
        'Android and iOS apps, published on Google Play': 'Google Play-ൽ പ്രസിദ്ധീകരിച്ച Android, iOS ആപ്പുകൾ',
        'Database': 'ഡാറ്റാബേസ്',
        'Designing tables and making queries fast': 'ടേബിളുകൾ ഡിസൈൻ ചെയ്യലും ക്വറികൾ വേഗത്തിലാക്കലും',
        'Frontend': 'ഫ്രണ്ടെൻഡ്',
        'Websites that work on any screen': 'ഏത് സ്ക്രീനിലും പ്രവർത്തിക്കുന്ന വെബ്സൈറ്റുകൾ',
        'Learning': 'പഠിക്കുന്നത്',
        'Learning now': 'ഇപ്പോൾ പഠിക്കുന്നു',

        // Home: work
        "Things I've built.": 'ഞാൻ നിർമ്മിച്ചവ.',
        'Three Android apps on Google Play, plus free money calculators for the web. Click a row to see the details.':
            'Google Play-ലെ മൂന്ന് Android ആപ്പുകളും വെബിനായുള്ള സൗജന്യ സാമ്പത്തിക കാൽക്കുലേറ്ററുകളും. വിവരങ്ങൾ കാണാൻ ഒരു വരിയിൽ ക്ലിക്ക് ചെയ്യുക.',
        'Name': 'പേര്',
        'Category': 'വിഭാഗം',
        'Platform': 'പ്ലാറ്റ്ഫോം',
        'Link': 'ലിങ്ക്',
        'Health & fitness': 'ആരോഗ്യം, ഫിറ്റ്നസ്',
        'Productivity': 'പ്രൊഡക്ടിവിറ്റി',
        'Finance': 'സാമ്പത്തികം',
        'Web': 'വെബ്',
        'Financial Tools': 'ഫിനാൻഷ്യൽ ടൂളുകൾ',
        'Open →': 'തുറക്കുക →',
        'Track your workouts, steps and meals.': 'നിങ്ങളുടെ വ്യായാമം, ചുവടുകൾ, ഭക്ഷണം എന്നിവ ട്രാക്ക് ചെയ്യുക.',
        'Step counter, meal photos, Health Connect': 'സ്റ്റെപ്പ് കൗണ്ടർ, ഭക്ഷണ ഫോട്ടോകൾ, Health Connect',
        'Short notes you can search and look back on.': 'തിരയാനും പിന്നീട് നോക്കാനും കഴിയുന്ന ചെറിയ കുറിപ്പുകൾ.',
        'One-line notes, search, history': 'ഒറ്റവരി കുറിപ്പുകൾ, തിരയൽ, ഹിസ്റ്ററി',
        'A simple calculator for everyday sums.': 'ദിവസേനയുള്ള കണക്കുകൾക്കായി ഒരു ലളിതമായ കാൽക്കുലേറ്റർ.',
        'Currency converter, history': 'കറൻസി കൺവെർട്ടർ, ഹിസ്റ്ററി',
        'Web browser': 'വെബ് ബ്രൗസർ',
        'Loan, savings and budget calculators': 'ലോൺ, സേവിംഗ്സ്, ബജറ്റ് കാൽക്കുലേറ്ററുകൾ',
        'Free to use. No sign-up needed.': 'സൗജന്യം. സൈൻ-അപ്പ് ആവശ്യമില്ല.',
        'Budget planner with live currency rates': 'ലൈവ് കറൻസി നിരക്കുകളുള്ള ബജറ്റ് പ്ലാനർ',

        // Home: contact
        'Have a project?': 'ഒരു പ്രോജക്ട് ഉണ്ടോ?',
        "Let's talk.": 'നമുക്ക് സംസാരിക്കാം.',
        'Bahrain · Remote': 'ബഹ്റൈൻ · റിമോട്ട്',
        'Languages': 'ഭാഷകൾ',
        'English, Hindi, Malayalam': 'ഇംഗ്ലീഷ്, ഹിന്ദി, മലയാളം',
        'Email': 'ഇമെയിൽ',
        'Message': 'സന്ദേശം',
        'Send message': 'സന്ദേശം അയയ്ക്കുക',
        'Sending…': 'അയയ്ക്കുന്നു…',
        'Message sent. Thank you!': 'സന്ദേശം അയച്ചു. നന്ദി!',
        'Something went wrong. Try again.': 'എന്തോ പിശക് സംഭവിച്ചു. വീണ്ടും ശ്രമിക്കുക.',
        'No connection. Try again.': 'കണക്ഷൻ ഇല്ല. വീണ്ടും ശ്രമിക്കുക.',

        // Tools page
        'Free · No sign-up': 'സൗജന്യം · സൈൻ-അപ്പ് വേണ്ട',
        'Simple calculators for loans, savings and your monthly budget. Everything runs in your browser. Pick a tool to start.':
            'ലോൺ, സേവിംഗ്സ്, പ്രതിമാസ ബജറ്റ് എന്നിവയ്ക്കുള്ള ലളിതമായ കാൽക്കുലേറ്ററുകൾ. എല്ലാം നിങ്ങളുടെ ബ്രൗസറിൽ തന്നെ പ്രവർത്തിക്കുന്നു. തുടങ്ങാൻ ഒരു ടൂൾ തിരഞ്ഞെടുക്കുക.',
        'EMI Calculator': 'EMI കാൽക്കുലേറ്റർ',
        'Find your monthly loan payment': 'നിങ്ങളുടെ പ്രതിമാസ ലോൺ അടവ് കണ്ടെത്തുക',
        'SIP Calculator': 'SIP കാൽക്കുലേറ്റർ',
        'See how a monthly investment grows': 'പ്രതിമാസ നിക്ഷേപം എങ്ങനെ വളരുന്നു എന്ന് കാണുക',
        'Lumpsum': 'ലംപ്സം',
        'Lumpsum Calculator': 'ലംപ്സം കാൽക്കുലേറ്റർ',
        'See how a one-time investment grows': 'ഒറ്റത്തവണ നിക്ഷേപം എങ്ങനെ വളരുന്നു എന്ന് കാണുക',
        'Goal Planner': 'ലക്ഷ്യ പ്ലാനർ',
        'Find how much to save each month for a goal': 'ഒരു ലക്ഷ്യത്തിനായി ഓരോ മാസവും എത്ര സേവ് ചെയ്യണമെന്ന് കണ്ടെത്തുക',
        'Affordability': 'താങ്ങാനാകുന്ന ലോൺ',
        'Loan Affordability': 'താങ്ങാനാകുന്ന ലോൺ',
        'Find the biggest loan you can afford': 'നിങ്ങൾക്ക് എടുക്കാവുന്ന ഏറ്റവും വലിയ ലോൺ കണ്ടെത്തുക',
        'Budget Planner': 'ബജറ്റ് പ്ലാനർ',
        'Track income and spending in two currencies': 'രണ്ട് കറൻസികളിൽ വരവും ചെലവും ട്രാക്ക് ചെയ്യുക',
        '← All tools': '← എല്ലാ ടൂളുകളും',
        'Loan amount ($)': 'ലോൺ തുക ($)',
        'Interest rate (% per year)': 'പലിശ നിരക്ക് (% പ്രതിവർഷം)',
        'Years': 'വർഷം',
        'Months': 'മാസം',
        'Calculate': 'കണക്കാക്കുക',
        'Monthly payment': 'പ്രതിമാസ അടവ്',
        'Total interest': 'ആകെ പലിശ',
        'Total you pay': 'ആകെ അടയ്ക്കുന്നത്',
        'Amount per month ($)': 'പ്രതിമാസ തുക ($)',
        'Expected return (% per year)': 'പ്രതീക്ഷിക്കുന്ന റിട്ടേൺ (% പ്രതിവർഷം)',
        'Final value': 'അവസാന മൂല്യം',
        'You put in': 'നിങ്ങൾ നിക്ഷേപിച്ചത്',
        'You earn': 'നിങ്ങൾക്ക് ലഭിക്കുന്നത്',
        'Amount you invest ($)': 'നിക്ഷേപ തുക ($)',
        'Goal amount ($)': 'ലക്ഷ്യ തുക ($)',
        'Save this much each month': 'ഓരോ മാസവും ഇത്ര സേവ് ചെയ്യുക',
        'Monthly payment you can afford ($)': 'നിങ്ങൾക്ക് അടയ്ക്കാവുന്ന പ്രതിമാസ തുക ($)',
        'Biggest loan you can take': 'എടുക്കാവുന്ന ഏറ്റവും വലിയ ലോൺ',
        'Main currency': 'പ്രധാന കറൻസി',
        'Second currency': 'രണ്ടാമത്തെ കറൻസി',
        'Exchange rate': 'എക്സ്ചേഞ്ച് നിരക്ക്',
        'Income': 'വരവ്',
        'Spending': 'ചെലവ്',
        '+ Add income': '+ വരവ് ചേർക്കുക',
        '+ Add expense': '+ ചെലവ് ചേർക്കുക',
        'Left over each month': 'ഓരോ മാസവും ബാക്കി',
        'Total income': 'ആകെ വരവ്',
        'Total spending': 'ആകെ ചെലവ്',
        'Search currency': 'കറൻസി തിരയുക',
        'Search currency…': 'കറൻസി തിരയുക…',
        'Source': 'വരുമാന മാർഗം',
        'Expense': 'ചെലവ്',
        'Amount': 'തുക',
        'Currency': 'കറൻസി',

        // Downloads page
        'Free apps on Google Play. Tap one to open its store page.':
            'Google Play-ലെ സൗജന്യ ആപ്പുകൾ. സ്റ്റോർ പേജ് തുറക്കാൻ ഒന്നിൽ ടാപ്പ് ചെയ്യുക.',
        'A simple calculator with a currency converter and history.':
            'കറൻസി കൺവെർട്ടറും ഹിസ്റ്ററിയുമുള്ള ഒരു ലളിതമായ കാൽക്കുലേറ്റർ.',
        'Get it ↗': 'ഡൗൺലോഡ് ↗'
    };

    const STORAGE_KEY = 'lang';
    const ATTRS = ['aria-label', 'placeholder'];
    const textOriginals = new Map();   // text node -> English value
    const attrOriginals = new Map();   // element -> { attr: English value }
    const listeners = [];
    const englishTitle = document.title;
    let lang = 'en';

    const normalise = s => s.replace(/\s+/g, ' ').trim();

    function t(text) {
        return lang === 'ml' && ML[text] ? ML[text] : text;
    }

    function skip(node) {
        const el = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
        return !el || el.closest('script, style, [data-no-i18n]');
    }

    function translateText(node) {
        let english = textOriginals.get(node);
        if (english === undefined) {
            if (!ML[normalise(node.nodeValue)]) return;
            english = node.nodeValue;
            textOriginals.set(node, english);
        }
        if (lang === 'en') {
            node.nodeValue = english;
            return;
        }
        // Keep the surrounding whitespace, swap only the words
        const [, lead, words, trail] = english.match(/^(\s*)([\s\S]*?)(\s*)$/);
        node.nodeValue = lead + t(normalise(words)) + trail;
    }

    function translateAttrs(el) {
        ATTRS.forEach(attr => {
            if (!el.hasAttribute(attr)) return;
            const saved = attrOriginals.get(el) || {};
            if (saved[attr] === undefined) {
                if (!ML[el.getAttribute(attr)]) return;
                saved[attr] = el.getAttribute(attr);
                attrOriginals.set(el, saved);
            }
            el.setAttribute(attr, t(saved[attr]));
        });
    }

    function apply(root) {
        if (skip(root)) return;
        if (root.nodeType === Node.TEXT_NODE) {
            translateText(root);
            return;
        }
        if (root.nodeType !== Node.ELEMENT_NODE) return;

        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        let node;
        while ((node = walker.nextNode())) {
            if (!skip(node)) translateText(node);
        }
        [root, ...root.querySelectorAll('[aria-label], [placeholder]')].forEach(el => {
            if (!skip(el)) translateAttrs(el);
        });
    }

    function setLang(next) {
        lang = next === 'ml' ? 'ml' : 'en';
        document.documentElement.lang = lang;
        document.title = t(englishTitle);
        apply(document.body);
        try {
            localStorage.setItem(STORAGE_KEY, lang);
        } catch (e) { /* storage unavailable: choice lasts for this visit */ }
        listeners.forEach(fn => fn(lang));
    }

    // Translate content that scripts add later (budget rows, status text)
    new MutationObserver(mutations => {
        if (lang !== 'ml') return;
        mutations.forEach(m => m.addedNodes.forEach(apply));
    }).observe(document.body, { childList: true, subtree: true });

    let saved = null;
    try {
        saved = localStorage.getItem(STORAGE_KEY);
    } catch (e) { /* ignore */ }
    if (saved === 'ml') setLang('ml');

    window.siteI18n = {
        t,
        setLang,
        get lang() {
            return lang;
        },
        onChange(fn) {
            listeners.push(fn);
        }
    };
})();
