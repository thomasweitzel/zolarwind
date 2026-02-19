# Shortcodes

Zolarwind shortcodes are designed to solve specific rendering problems while keeping Markdown readable.
Use them for the intended feature, not as generic formatting helpers.

---

## `katex`

Purpose: Render KaTeX math without Markdown interfering with symbols like `*` or backslashes.

Parameters:
- Optional: `inline` (boolean, default `false`)
- Optional: `class` (string)

Notes:
- Do not include `$` or `$$` inside the body. The shortcode adds the delimiters.
- The body is treated as raw text, not Markdown.

Example:
```md
{% katex() %}
\int_0^1 x^2 \, dx
{% end %}
```

Markdown-sensitive example (the shortcode avoids Markdown interpreting `*`, `_`, and backslashes):
```md
{% katex() %}
\mathbf{A} * \mathbf{B} = \sum_{i=1}^n a_i b_i
{% end %}
```

Inline example:
```md
{% katex(inline=true) %}E = mc^2{% end %}
```

---

## `diagram`

Purpose: Render Mermaid diagrams from text.

Parameters:
- Optional: `init` (JSON string for Mermaid init config)

Notes:
- This shortcode only emits the Mermaid `<pre>` block.
- Make sure Mermaid is enabled on the page (for example `extra.diagram = true` if your template gates Mermaid assets).

Example:
```md
{% diagram() %}
graph TD
  A --> B
  B --> C
{% end %}
```

Example with init:
```md
{% diagram(init="{ 'theme': 'default' }") %}
sequenceDiagram
  A->>B: Hello
{% end %}
```

---

## `image`

Purpose: Render local images with optional caption/title and light/dark variants.

Parameters:
- Required: `src` (local path)
- Optional: `dark_src` (local path for dark mode)
- Optional: `alt` (falls back to the file name)
- Optional: `dark_alt` (alt text for the dark image, defaults to `alt`)
- Optional: `title`
- Optional: `caption`
- Optional: `link` (URL)
- Optional: `width` (number)
- Optional: `height` (number)
- Optional: `lazy` (boolean, default `true`)
- Optional: `decoding` (string, default `async`)

Notes:
- Local paths only. Remote URLs are intentionally not supported.
- If the page is a colocated bundle, relative paths resolve from the page directory.
- The shortcode uses `get_url`, so it works under subpaths.
- When `dark_src` is set, the shortcode renders light/dark variants.

Example (single image with caption):
```md
{{ image(
  src="diagram.webp",
  alt="Block diagram",
  caption="Figure 1: System overview."
) }}
```

Example (override one dimension, keep aspect ratio):
```md
{{ image(
  src="diagram.webp",
  alt="Block diagram",
  width=640
) }}
```

Example (link the image):
```md
{{ image(
  src="diagram.webp",
  alt="Block diagram",
  link="https://example.com"
) }}
```

Example (light/dark image pair):
```md
{{ image(
  src="example-light.webp",
  dark_src="example-dark.webp",
  alt="Example image"
) }}
```

---

## `audio_simple`

Purpose: Render a themed card with the native `<audio>` element.

Parameters:
- Required: `src`
- Optional: `title`
- Optional: `artist`
- Optional: `label`
- Optional: `year`

Notes:
- The subtitle is built from `artist`, `label`, and `year`.
- Uses the localized fallback string `audio_no_element` if the browser lacks audio support.

Example:
```md
{{ audio_simple(
  title="Track Title",
  artist="Artist",
  label="Label",
  year="2024",
  src="/audio/track.mp3"
) }}
```

---

## `audio`

Purpose: Render a custom audio player with JS controls.

Parameters:
- Required: `src`
- Optional: `id` (integer, default `1`)
- Optional: `title`
- Optional: `artist`
- Optional: `label`
- Optional: `year`
- Optional: `length` (string, display-only, e.g. `3:42`)

Notes:
- Use a unique `id` per player on the page.
- The first player (id `1`) loads the JS assets (`howler.js`, `audio-player.js`, `audio-init.js`).

Example:
```md
{{ audio(
  title="Track One",
  artist="Artist",
  length="3:42",
  src="/audio/track-1.mp3"
) }}
```

Multiple players on one page:
```md
{{ audio(
  id=1,
  title="Track One",
  artist="Artist",
  length="3:42",
  src="/audio/track-1.mp3"
) }}

{{ audio(
  id=2,
  title="Track Two",
  artist="Artist",
  length="4:10",
  src="/audio/track-2.mp3"
) }}
```
