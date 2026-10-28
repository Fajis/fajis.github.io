// Site content. Edit these arrays to update the pages; script.js turns them
// into the Stack table, Experience list and app lists.

window.SITE_DATA = {
    // Contact section and footer "Links" on every page.
    // LinkedIn is temporary: replace with your real profile URL.
    links: [
        { label: 'GitHub', handle: '@Fajis', url: 'https://github.com/fajis' },
        { label: 'LinkedIn', handle: '@fajispm', url: 'https://www.linkedin.com/in/fajispm' },
        { label: 'Instagram', handle: '@fajis.pm', url: 'https://www.instagram.com/fajis.pm/' }
    ],

    // Home: Stack table. `muted: true` greys out a row.
    stack: [
        { area: 'Backend', tools: 'PHP', use: 'APIs and server logic' },
        { area: 'Mobile', tools: 'React Native', use: 'Android and iOS apps, published on Google Play' },
        { area: 'Database', tools: 'MySQL', use: 'Designing tables and making queries fast' },
        { area: 'Frontend', tools: 'JavaScript ES6+, HTML, CSS', use: 'Websites that work on any screen' },
        { area: 'Learning', tools: 'TypeScript, Redux, DevOps', use: 'Learning now', muted: true }
    ],

    // Home: Experience. Newest job first; `end: 'Now'` for a current job.
    experience: [
        {
            role: 'Developer',
            company: 'Harvard Soft Tech',
            start: '2023',
            end: 'Now',
            projects: [
                'Property management system',
                'Car rental system',
                'Inventory management system',
                'Gym management SaaS',
                'E-shop loyalty program',
                'School management system'
            ],
            more: 'And many more'
        }
    ],

    // Home: Work table + terminal panel, and the Android apps page.
    // `id` is used in the terminal path (apps/<id>/README).
    apps: [
        {
            id: 'stay-fit',
            name: 'Stay Fit',
            category: 'Health & fitness',
            platform: 'Android',
            package: 'com.fajis.fitnessapp',
            logo: '/apps/fitness-app/logo.png',
            about: 'Track your workouts, steps and meals.',
            features: 'Step counter, meal photos, Health Connect'
        },
        {
            id: 'oneline',
            name: 'Oneline',
            category: 'Productivity',
            platform: 'Android',
            package: 'com.fajis.oneline',
            logo: '/apps/oneline/logo.png',
            about: 'Short notes you can search and look back on.',
            features: 'One-line notes, search, history'
        },
        {
            id: 'calculator-plus',
            name: 'Calculator+',
            category: 'Tools',
            platform: 'Android',
            package: 'com.fajis.SmartCalculator',
            logo: '/apps/smart-calculator/logo.png',
            about: 'A simple calculator with a currency converter and history.',
            features: 'Currency converter, history'
        }
    ]
};
