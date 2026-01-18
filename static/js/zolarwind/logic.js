const APPLICATION_NAME = "zolarwind";

const htmlElement = document.documentElement;
const darkTheme = "dark";
const lightTheme = "light";

const getSavedTheme = () => {
  try {
    return localStorage.getItem(APPLICATION_NAME);
  } catch (error) {
    console.warn("Failed to read theme from localStorage:", error);
    return null;
  }
};

const savedTheme = getSavedTheme() || (window.matchMedia("(prefers-color-scheme: dark)").matches ? darkTheme : lightTheme);
htmlElement.setAttribute("data-theme", savedTheme);

window.addEventListener("DOMContentLoaded", () => {
  // Copy button for code; only inside an article that has the class "prose"
  const buildClipboardSvg = (title) => (`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6"><title>${title}</title><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" /></svg>`);
  const buildOkSvg = (title) => (`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6"><title>${title}</title><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>`);
  const buildErrorSvg = (title) => (`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6"><title>${title}</title><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>`);

  const createClickHandler = (textElement, button, iconSet) => () => {
    navigator.clipboard
      .writeText(textElement.textContent)
      .then(() => {
        button.innerHTML = iconSet.ok;
        setTimeout(() => (button.innerHTML = iconSet.clipboard), 2000);
      })
      .catch(() => {
        button.innerHTML = iconSet.error;
      });
  };

  document.querySelectorAll("article.prose pre").forEach((pre) => {
    const container = pre;
    const code = pre.querySelector("code");
    const article = pre.closest("article");
    const copyLabel = article?.dataset.clipboardCopy || "";
    const copiedLabel = article?.dataset.clipboardCopied || "";
    const errorLabel = article?.dataset.clipboardError || "";
    const iconSet = {
      clipboard: buildClipboardSvg(copyLabel),
      ok: buildOkSvg(copiedLabel),
      error: buildErrorSvg(errorLabel)
    };

    // Clipboard API requires a secure context (HTTPS) to function
    if (container && code && navigator?.clipboard?.writeText) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "text-sm text-neutral-400 cursor-pointer hover:text-neutral-200 rounded-md absolute top-2 right-2";
      button.innerHTML = iconSet.clipboard;

      container.style.position = "relative";
      container.appendChild(button);

      button.addEventListener("click", createClickHandler(code, button, iconSet));
    }
  });

  const suns = document.querySelectorAll(".theme-icon-sun");
  const moons = document.querySelectorAll(".theme-icon-moon");

  const toggleMobileMenu = () => {
    const ids = ["mobile-menu", "mobile-icon-menu-unselected", "mobile-icon-menu-selected"];
    ids.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        element.classList.toggle("hidden");
      }
    });
  };

  const saveTheme = (theme) => {
    try {
      localStorage.setItem(APPLICATION_NAME, theme);
    } catch (error) {
      console.warn("Failed to save theme to localStorage:", error);
    }
  };

  const toggleTheme = (clickedElements, hiddenElements, theme, persist = false) => {
    clickedElements.forEach((element) => element.classList.add("hidden"));
    hiddenElements.forEach((element) => element.classList.remove("hidden"));
    htmlElement.setAttribute("data-theme", theme);
    if (persist) {
      saveTheme(theme);
    }
  };

  const mobileButton = document.getElementById("toggleMobileMenu");
  if (mobileButton) {
    mobileButton.addEventListener("click", toggleMobileMenu);
  }

  if (suns.length || moons.length) {
    if (savedTheme === darkTheme) {
      toggleTheme(moons, suns, darkTheme);
    } else {
      toggleTheme(suns, moons, lightTheme);
    }

    suns.forEach((sun) => sun.addEventListener("click", () => {
      toggleTheme(suns, moons, lightTheme, true);
    }));

    moons.forEach((moon) => moon.addEventListener("click", () => {
      toggleTheme(moons, suns, darkTheme, true);
    }));
  }
});
