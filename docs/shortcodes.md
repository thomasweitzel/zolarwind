# Markdown components

Zolarwind's Markdown-facing components are stored in `templates/shortcodes/`. Use them for the intended feature, not as generic formatting helpers.

---

## `katex`

Purpose: Render display KaTeX math.

Parameters:
- Optional: `class` (string)

Notes:
- The component is block-level. Do not include `$$` inside the body; it adds the delimiters.
- Use `$...$` directly in Markdown for inline math. Markdown processes backslashes first, so write `\\%` when KaTeX must receive `\%` for a percent sign.

Example:
```md
{% <katex> %}
\int_0^1 x^2 \, dx
{% </katex> %}
```

Display-math example:
```md
{% <katex> %}
\mathbf{A} * \mathbf{B} = \sum_{i=1}^n a_i b_i
{% </katex> %}
```

Inline example:
```md
$E = mc^2$
```

---

## `diagram`

Purpose: Render Mermaid diagrams from text.

Parameters:
- Optional: `init` (JSON string for Mermaid init config)

Notes:
- This component only emits the Mermaid `<pre>` block.
- Make sure Mermaid is enabled on the page (for example `extra.diagram = true` if your template gates Mermaid assets).

Example:
```md
{% <diagram> %}
graph TD
  A --> B
  B --> C
{% </diagram> %}
```

Example with init:
```md
{% <diagram init="{'theme': 'default'}"> %}
sequenceDiagram
  A->>B: Hello
{% </diagram> %}
```

---

## `image`

Purpose: Render local images with optional caption/title and light/dark variants.

Parameters:
- Required: `page` (pass `{page}`)
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
- The component uses `get_url`, so it works under subpaths.
- When `dark_src` is set, the component renders light/dark variants.

Example (single image with caption):
```md
{{<image
  page={page}
  src="diagram.webp"
  alt="Block diagram"
  caption="Figure 1: System overview."
/>}}
```

Example (override one dimension, keep aspect ratio):
```md
{{<image
  page={page}
  src="diagram.webp"
  alt="Block diagram"
  width=640
/>}}
```

Example (link the image):
```md
{{<image
  page={page}
  src="diagram.webp"
  alt="Block diagram"
  link="https://example.com"
/>}}
```

Example (light/dark image pair):
```md
{{<image
  page={page}
  src="example-light.webp"
  dark_src="example-dark.webp"
  alt="Example image"
/>}}
```

---

## `audio_simple`

Purpose: Render a themed card with the native `<audio>` element.

Parameters:
- Required: `config` (pass `{config}`)
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
{{<audio_simple
  config={config}
  title="Track Title"
  artist="Artist"
  label="Label"
  year="2024"
  src="/audio/track.mp3"
/>}}
```

---

## `audio`

Purpose: Render a custom audio player with JS controls.

Parameters:
- Required: `config` (pass `{config}`)
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
{{<audio
  config={config}
  title="Track One"
  artist="Artist"
  length="3:42"
  src="/audio/track-1.mp3"
/>}}
```

Multiple players on one page:
```md
{{<audio
  config={config}
  id=1
  title="Track One"
  artist="Artist"
  length="3:42"
  src="/audio/track-1.mp3"
/>}}

{{<audio
  config={config}
  id=2
  title="Track Two"
  artist="Artist"
  length="4:10"
  src="/audio/track-2.mp3"
/>}}
```
