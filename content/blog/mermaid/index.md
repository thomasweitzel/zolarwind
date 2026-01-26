+++
date = 2023-09-26
title = "Diagrams with Mermaid"
description = "Discover Mermaid's Markdown-inspired syntax to craft diverse diagrams using simple text in your blog posts. Learn how to integrate and customize Mermaid diagrams."
authors = ["Thomas Weitzel"]
[taxonomies]
tags = ["diagram"]
[extra]
math = false
diagram = true
image = "banner.jpg"
+++

## What are Mermaid diagrams

[Mermaid](https://mermaid.js.org) is a syntax similar to Markdown where you can use text to describe and automatically generate diagrams.
With Mermaid, you can generate
[Flow charts](https://mermaid.js.org/syntax/flowchart.html),
[UML diagrams](https://mermaid.js.org/syntax/classDiagram.html),
[Pie charts](https://mermaid.js.org/syntax/pie.html),
[Gantt diagrams](https://mermaid.js.org/syntax/gantt.html),
[Entity Relationship diagrams](https://mermaid.js.org/syntax/entityRelationshipDiagram.html),
and more.

## An Entity Relationship diagram example

{% diagram(init="{'theme': 'forest'}") %}
erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINEITEM : contains
    PRODUCT ||--o{ LINEITEM : is_listed_in
    CUSTOMER {
        string Name
        string Email
        string Address
    }
    PRODUCT {
        string ProductName
        float Price
    }
    ORDER {
        date DateOrdered
        string Status
    }
    LINEITEM {
        int Quantity
    }
{% end %}

## Using Mermaid in your blog post

The diagram shortcode allows you to easily embed Mermaid diagrams in your blog posts, with an option to configure its appearance.

### Basic Usage
To use the shortcode in your blog post, you would use the following format:

{% showcode() %}
```javascript
SC_OPEN diagram() SC_CLOSE
Your Mermaid diagram code here
SC_OPEN end SC_CLOSE
```
{% end %}

Replace *Your Mermaid diagram code here* with your actual Mermaid diagram code.

To load the necessary JavaScript to render the Mermaid diagram, you need to enable it in the front matter of your blog post by setting the value for `extra.diagram` to `true`:

```ini
+++
[extra]
diagram = true
+++
```

### Configuring the Appearance
The shortcode supports an optional `init` parameter, that allows you to specify configuration options for Mermaid,
particularly changing the appearance of the diagrams through the theme.

For example, to apply the `forest` theme:

{% showcode() %}
```javascript
SC_OPEN diagram(init="{'theme': 'forest'}") SC_CLOSE
Your Mermaid diagram code here
SC_OPEN end SC_CLOSE
```
{% end %}

### Providing init Configuration
When using the `init` parameter, the configuration should be a string wrapped in double quotes.
Inside this string, use single quotes for keys and values.

Here's a more advanced example with multiple configuration options:

{% showcode() %}
```javascript
SC_OPEN diagram(init="{'theme': 'forest', 'themeVariables': {'primaryColor': '#FF0000'}}") SC_CLOSE
Your Mermaid diagram code here
SC_OPEN end SC_CLOSE
```
{% end %}

In this example, we're using the `forest` theme and changing the primary color to red (`#FF0000`).

**Note**: Ensure that you use single quotes inside the double quotes for the configuration to work correctly.

### Putting it all together
Use the shortcode by enclosing your Mermaid diagram code with it.
To change the look of the Mermaid theme, provide values for the `init` parameter.
Always enclose the `init` value with double quotes, and use single quotes inside the configuration string.
With this shortcode in place, integrating and customizing Mermaid diagrams in your blog posts becomes easy.

## Explaining Mermaid diagram code

Here is how the diagram rendered above is embedded in this blog post as a code block.
Because it is the same code as the diagram above, extra care has to be taken to prevent Mermaid from rendering it as a diagram.
There is a `showcode()` shortcode to prevent Mermaid from rendering it as a diagram.
Use `SC_OPEN`/`SC_CLOSE` for `{%`/`%}` and `EX_OPEN`/`EX_CLOSE` for `{{`/`}}` inside the fenced block.

{% showcode() %}
```javascript
SC_OPEN diagram(init="{'theme': 'forest'}") SC_CLOSE
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINEITEM : contains
    PRODUCT ||--o{ LINEITEM : is_listed_in
    CUSTOMER {
        string Name
        string Email
        string Address
    }
    PRODUCT {
        string ProductName
        float Price
    }
    ORDER {
        date DateOrdered
        string Status
    }
    LINEITEM {
        int Quantity
    }
SC_OPEN end SC_CLOSE
```
{% end %}
