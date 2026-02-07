function initArtalkComments() {
  const root = document.getElementById("Comments");
  if (!root || !window.Artalk) {
    return;
  }

  const server = root.dataset.artalkServer;
  const site = root.dataset.artalkSite;
  if (!server || !site) {
    return;
  }

  const pageKey = root.dataset.artalkPageKey;
  const pageTitle = root.dataset.artalkPageTitle;
  const locale = root.dataset.artalkLocale;
  const listSort = root.dataset.artalkListSort;
  const flatMode = root.dataset.artalkFlatMode;
  const preview = root.dataset.artalkPreview;
  const emoticons = root.dataset.artalkEmoticons;
  const vote = root.dataset.artalkVote;
  const voteDown = root.dataset.artalkVoteDown;
  const pageSize = root.dataset.artalkPageSize;
  const readMore = root.dataset.artalkReadMore;
  const autoLoad = root.dataset.artalkAutoLoad;
  const placeholder = root.dataset.artalkPlaceholder;
  const sendBtn = root.dataset.artalkSendBtn;
  const noComment = root.dataset.artalkNoComment;
  const showCopyright = root.dataset.artalkShowCopyright;
  const avatarUrl = root.dataset.artalkAvatarUrl;
  const showSidebarButton = root.dataset.artalkShowSidebarButton;

  const pageLang = document.documentElement.lang || "";
  const dataLocale = locale || "";
  const langHint = (pageLang || dataLocale).toLowerCase();
  const langCode = langHint.split("-")[0];

  const deLocale = {
    placeholder: "Kommentar schreiben",
    noComment: "Keine Kommentare",
    send: "Senden",
    signIn: "Anmelden",
    signUp: "Registrieren",
    save: "Speichern",
    nick: "Spitzname",
    email: "E-Mail",
    link: "Website",
    emoticon: "Emoji",
    preview: "Vorschau",
    uploadImage: "Bild hochladen",
    uploadFail: "Upload fehlgeschlagen",
    commentFail: "Kommentar fehlgeschlagen",
    restoredMsg: "Inhalt wurde wiederhergestellt",
    onlyAdminCanReply: "Nur Admins können antworten",
    uploadLoginMsg: "Bitte Namen und E-Mail zum Hochladen angeben",
    counter: "{count} Kommentare",
    sortLatest: "Neueste",
    sortOldest: "Älteste",
    sortBest: "Beste",
    sortAuthor: "Autor",
    openComment: "Kommentar öffnen",
    closeComment: "Kommentar schließen",
    listLoadFailMsg: "Kommentare konnten nicht geladen werden",
    listRetry: "Erneut versuchen",
    loadMore: "Mehr laden",
    admin: "Admin",
    reply: "Antworten",
    voteUp: "Hoch",
    voteDown: "Runter",
    voteFail: "Abstimmung fehlgeschlagen",
    readMore: "Mehr anzeigen",
    actionConfirm: "Bestätigen",
    collapse: "Einklappen",
    collapsed: "Eingeklappt",
    collapsedMsg: "Dieser Kommentar ist eingeklappt",
    expand: "Ausklappen",
    approved: "Freigegeben",
    pending: "Ausstehend",
    pendingMsg: "Ausstehend, nur für den Kommentierenden sichtbar.",
    edit: "Bearbeiten",
    editCancel: "Abbrechen",
    delete: "Löschen",
    deleteConfirm: "Bestätigen",
    pin: "Anheften",
    unpin: "Loslösen",
    seconds: "Sekunden",
    minutes: "Minuten",
    hours: "Stunden",
    days: "Tage",
    now: "gerade eben",
    adminCheck: "Admin-Passwort eingeben:",
    captchaCheck: "CAPTCHA eingeben, um fortzufahren:",
    confirm: "Bestätigen",
    cancel: "Abbrechen",
    msgCenter: "Nachrichten",
    ctrlCenter: "Dashboard",
    userProfile: "Profil",
    noAccountPrompt: "Kein Konto?",
    haveAccountPrompt: "Konto vorhanden?",
    forgetPassword: "Passwort vergessen",
    resetPassword: "Passwort zurücksetzen",
    changePassword: "Passwort ändern",
    confirmPassword: "Passwort bestätigen",
    passwordMismatch: "Passwörter stimmen nicht überein",
    verificationCode: "Verifizierungscode",
    verifySend: "Code senden",
    verifyResend: "Erneut senden",
    waitSeconds: "{seconds}n warten",
    emailVerified: "E-Mail wurde verifiziert",
    password: "Passwort",
    username: "Benutzername",
    nextStep: "Nächster Schritt",
    skipVerify: "Verifizierung überspringen",
    logoutConfirm: "Wirklich abmelden?",
    accountMergeNotice: "Diese E-Mail hat mehrere Konten mit unterschiedlichen IDs.",
    accountMergeSelectOne: "Bitte ein Konto auswählen, in das alle Daten zusammengeführt werden sollen.",
    accountMergeConfirm: "Alle Daten werden in ein Konto zusammengeführt, die ID ist {id}.",
    dismiss: "Schließen",
    merge: "Zusammenführen",
    frontend: "Frontend",
    backend: "Backend",
    loading: "Lädt",
    loadFail: "Laden fehlgeschlagen",
    editing: "Bearbeitung",
    editFail: "Bearbeiten fehlgeschlagen",
    deleting: "Löschen",
    deleteFail: "Löschen fehlgeschlagen",
    reqGot: "Anfrage eingegangen",
    reqAborted: "Anfrage abgelaufen oder unerwartet abgebrochen",
    updateMsg: "Bitte Artalk {name} aktualisieren, um Up-to-Date zu sein!",
    currentVersion: "Aktuelle Version",
    ignore: "Ignorieren",
    open: "Öffnen",
    openName: "{name} öffnen",
  };

  // Custom locale extensions:
  // 1) Define a locale object (see deLocale above)
  // 2) Add it to this map with its language code
  // The init logic will pick it up automatically.
  const locales = {
    de: deLocale,
  };
  const activeLocale = locales[langCode] || null;

  // Backend error message overrides (for servers without locale set).
  // Map server `msg` strings to localized equivalents by language code.
  const backendErrorMessages = {
    de: {
      "wrong captcha": "Falsches Captcha",
      "password is required": "Passwort erforderlich",
      "password is incorrect": "Falsches Passwort",
      "value is required": "Wert erforderlich",
      "value is incorrect": "Falscher Wert",
      "name is required": "Name erforderlich",
      "email is required": "Email erforderlich",
    },
  };
  const activeErrorMessages = backendErrorMessages[langCode] || null;

  const config = {
    el: "#Comments",
    server,
    site,
    darkMode: "inherit",
  };

  if (activeErrorMessages && !window.__artalkFetchWrapped) {
    const originalFetch = window.fetch;
    window.fetch = async (input, init) => {
      const response = await originalFetch(input, init);
      try {
        const url = typeof input === "string" ? input : input.url;
        if (!url.startsWith(server) || response.ok) {
          return response;
        }
        const contentType = response.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          return response;
        }
        const data = await response.clone().json().catch(() => null);
        if (data && typeof data.msg === "string") {
          const mapped = activeErrorMessages[data.msg.toLowerCase()];
          if (mapped) {
            data.msg = mapped;
            return new Response(JSON.stringify(data), {
              status: response.status,
              statusText: response.statusText,
              headers: response.headers,
            });
          }
        }
      } catch {
        return response;
      }
      return response;
    };
    window.__artalkFetchWrapped = true;
  }

  if (pageKey) {
    config.pageKey = pageKey;
  }
  if (pageTitle) {
    config.pageTitle = pageTitle;
  }
  if (activeLocale) {
    window.ArtalkI18n = window.ArtalkI18n || {};
    window.ArtalkI18n[langCode] = activeLocale;
    config.locale = langCode;
    config.remoteConfModifier = (conf) => {
      conf.locale = langCode;
    };
  } else if (locale) {
    config.locale = locale;
  }
  if (listSort !== undefined) {
    config.listSort = listSort === "true";
  }
  if (flatMode) {
    config.flatMode = flatMode;
  }
  if (preview !== undefined) {
    config.preview = preview === "true";
  }
  if (emoticons !== undefined) {
    config.emoticons = emoticons === "true";
  }
  if (vote !== undefined) {
    config.vote = vote === "true";
  }
  if (voteDown !== undefined) {
    config.voteDown = voteDown === "true";
  }
  if (pageSize) {
    const pageSizeNumber = Number.parseInt(pageSize, 10);
    if (Number.isFinite(pageSizeNumber) && pageSizeNumber > 0) {
      config.pagination = { pageSize: pageSizeNumber };
    }
  }
  if (readMore !== undefined) {
    config.pagination = config.pagination || {};
    config.pagination.readMore = readMore === "true";
  }
  if (autoLoad !== undefined) {
    config.pagination = config.pagination || {};
    config.pagination.autoLoad = autoLoad === "true";
  }
  if (placeholder) {
    config.placeholder = placeholder;
  }
  if (sendBtn) {
    config.sendBtn = sendBtn;
  }
  if (noComment) {
    config.noComment = noComment;
  }
  if (avatarUrl) {
    config.avatarURLBuilder = () => avatarUrl;
  }

  const startArtalk = () => {
    const instance = window.Artalk.init(config);
    if (activeLocale && instance && typeof instance.on === "function") {
      instance.on("mounted", () => {
        if (typeof instance.reload === "function") {
          instance.reload();
        }
      });
    }
    if (showCopyright !== undefined && showCopyright === "false") {
      root.classList.add("atk-hide-copyright");
    }
    const htmlElement = document.documentElement;
    const isDark = () => htmlElement.getAttribute("data-theme") === "dark";

    if (instance && typeof instance.setDarkMode === "function") {
      instance.setDarkMode(isDark());
    }

    const observer = new MutationObserver(() => {
      if (instance && typeof instance.setDarkMode === "function") {
        instance.setDarkMode(isDark());
      }
    });

    observer.observe(htmlElement, { attributes: true, attributeFilter: ["data-theme"] });

    if (showSidebarButton === "false" && instance && typeof instance.on === "function") {
      const getUser = () => {
        return instance.ctx && instance.ctx.get ? instance.ctx.get("user").getData() : null;
      };
      const enforceSidebarVisibility = (user) => {
        const updatedBtn = root.querySelector('[data-action="open-sidebar"]');
        if (!updatedBtn) {
          return;
        }
        if (user && user.is_admin) {
          updatedBtn.classList.remove("atk-hide");
        } else {
          updatedBtn.classList.add("atk-hide");
        }
      };
      const scheduleEnforce = (user) => {
        setTimeout(() => enforceSidebarVisibility(user), 0);
      };

      instance.on("mounted", () => {
        scheduleEnforce(getUser());
      });
      instance.on("list-loaded", () => {
        scheduleEnforce(getUser());
      });
      instance.on("user-changed", (user) => {
        scheduleEnforce(user);
      });
    }
  };

  startArtalk();
}

initArtalkComments();
