+++
date = "2026-02-11"
title = "Adding audio to your blog"
description = "Learn how to create a customized HTML5 audio player using Howler.js for your blog."
authors = ["Thomas Weitzel"]
[taxonomies]
tags = ["audio", "javascript"]
[extra]
math = false
image = "banner.webp"
+++

There are two practical ways to add audio to a blog: use the native `<audio>` element or render a custom player with JavaScript.
The [Zola](https://www.getzola.org/) theme [Zolarwind](https://github.com/thomasweitzel/zolarwind) provides two shortcodes that map to those choices: `audio_simple` uses the native element, `audio` uses a custom player.
Both are usable as-is, and the choice comes down to how much control you want over the player UI.

## The baseline native `<audio>` 

You get built-in controls and good accessibility.
If you are fine with browser-native styling, this is the fastest path.

```html
<audio controls>
  <source src="audio.mp3" type="audio/mpeg">
</audio>
```
<audio controls>
  <source src="audio.mp3" type="audio/mpeg">
</audio>

The tradeoff is consistency. Browsers style the element differently, and you get limited control over the UI.

## `audio_simple` shortcode

This wraps the native element and keeps the setup small.
It uses no JavaScript, like the baseline audio element, but adds a small amount of CSS for layout.

```ini
{{ audio_simple(
  src="audio.mp3",
  title="Audio in your blog",
  year="2026",
  artist="Female Speaker",
  label="Blog of Thomas Weitzel")
) }}
```

{{ audio_simple(
  src="audio.mp3",
  title="Audio in your blog",
  year="2026",
  artist="Female Speaker",
  label="Blog of Thomas Weitzel"
) }}

## Custom player

If you want a consistent player UI across browsers, the `audio` shortcode renders a custom player with JavaScript.
The native `<audio>` controls are not used; the UI is fully custom.

```ini
{{ audio(
  src="audio.mp3",
  length="0:48",
  title="Audio in your blog",
  year="2026",
  artist="Female Speaker",
  label="Blog of Thomas Weitzel")
) }}
```

{{ audio(
  src="audio.mp3",
  length="0:48",
  title="Audio in your blog",
  year="2026",
  artist="Female Speaker",
  label="Blog of Thomas Weitzel"
) }}

I prefer the `audio` shortcode, because I want a stable player UI across browsers.
`audio_simple` stays in the toolbox because it keeps the setup small and uses no extra JavaScript.

## Notes

- The shortcodes expect local assets, not remote URLs.
- `zola serve` does not support range requests as of 0.22.1, so Chrome cannot seek properly. Use a static server for testing.
