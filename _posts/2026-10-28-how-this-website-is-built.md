---
layout: post
title: How this website is built
description: A simple site that is fast, easy to update and still a little fun.
---

I wanted my website to work like the systems I build for clients: simple underneath, easy to change, and quick for the people using it. Here is how it is put together.

## One page shell, many pages

Every page shares the same header, menu and footer. They live in one place, so when I change the menu, every page changes with it. The site is built with [Jekyll](https://jekyllrb.com/), which GitHub turns into plain web pages each time I save a change.

## Content lives in lists

My projects, jobs, apps and skills are not typed into the pages. They sit in short lists, one file each. To add a new project, I add a few lines to the list and the Experience page shows it, with the same layout as the others.

That is the same idea I use in business systems: keep the data in one place and let the screens read from it.

## Small touches

- **Search the site** with <kbd>⌘K</kbd> or <kbd>Ctrl K</kbd>, or press <kbd>?</kbd> to see the keyboard shortcuts.
- **Bug runner**, a tiny game where the cursor jumps over bugs. It even works offline.
- **The right app store**: Android phones go straight to Google Play, and iPhones will go to the App Store once the iPhone versions are out.
- **Light and dark** themes that follow your device, with a button to switch.

## Fast and respectful

- The fonts are stored on this site, so pages load without calling other servers.
- After your first visit, pages you have opened keep working without internet.
- If your device is set to reduce motion, things fade in gently instead of sliding.

## What's next

More notes like this one, about the systems I build and what I learn along the way. If you have a project in mind, [let's talk]({{ '/contact/' | relative_url }}).
