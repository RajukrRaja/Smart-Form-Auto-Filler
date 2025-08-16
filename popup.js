// popup.js
// Run only after DOM ready (we also used defer in HTML)
(() => {
  // ---------- Tiny Utilities ----------
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const has = (sel) => Boolean($(sel));
  const getEl = (id) => document.getElementById(id);

  const getInputValue = (el) => {
    if (!el) return "";
    if (el.type === "checkbox") return el.checked;
    return (el.value ?? "").toString();
  };
  const setInputValue = (el, val) => {
    if (!el) return;
    if (el.type === "checkbox") {
      el.checked = Boolean(val);
    } else {
      el.value = val ?? "";
    }
  };

  const toast = (msg) => {
    const t = $("#toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.remove("hidden");
    t.classList.add("show");
    setTimeout(() => {
      t.classList.remove("show");
      t.classList.add("hidden");
    }, 1200);
  };

  // ---------- Tabs ----------
  $$(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      $$(".tab-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const tab = btn.dataset.tab;
      $$(".tab-panel").forEach((p) =>
        p.classList.toggle("hidden", p.dataset.panel !== tab)
      );
    });
  });

  // ---------- Data Model ----------
  let profile = {
    basic: {},
    experience: [],
    education: [],
    preferences: {},
    custom: []
  };

  // A resilient list of common "basic" fields (30+).
  // It’s OK if some IDs don’t exist in your HTML — we’ll silently skip them.
  const BASIC_FIELDS = [
    // Names
    "firstName",
    "middleName",
    "lastName",
    "fullName",

    // Core contact
    "email",
    "altEmail",
    "phone",
    "altPhone",

    // Social / web
    "linkedin",
    "github",
    "portfolio",
    "website",
    "twitter",

    // Address
    "street",
    "city",
    "state",
    "zip",
    "country",
    "address", // keep backward-compat single-line address if you have it

    // Personal
    "dob",
    "gender",
    "nationality",
    "maritalStatus",
    "languages",
    "bloodGroup",

    // IDs
    "nationalId",
    "passportNo",
    "drivingLicense",

    // Emergency
    "emergencyContact",
    "emergencyPhone",

    // Other
    "summary",
    "skills" // comma-separated, optional
  ];

  // ---------- Load From Storage ----------
  chrome.storage.sync.get("profileData", (data) => {
    if (data && data.profileData) {
      const p = data.profileData;
      profile = {
        basic: p.basic || {},
        experience: Array.isArray(p.experience) ? p.experience : [],
        education: Array.isArray(p.education) ? p.education : [],
        preferences: p.preferences || {},
        custom: Array.isArray(p.custom) ? p.custom : []
      };
    }
    renderAll();
  });

  // ---------- Render ----------
  function renderAll() {
    // Basic fields (looped to be resilient to markup changes)
    const b = profile.basic || {};
    BASIC_FIELDS.forEach((id) => setInputValue(getEl(id), b[id] ?? ""));

    // Backward compatibility with earlier minimal fields
    if (has("#name") && !getEl("name").value && b.fullName) {
      setInputValue(getEl("name"), b.fullName);
    }
    if (has("#email")) setInputValue(getEl("email"), b.email ?? "");
    if (has("#phone")) setInputValue(getEl("phone"), b.phone ?? "");
    if (has("#summary")) setInputValue(getEl("summary"), b.summary ?? "");
    if (has("#address")) {
      // prefer single-line address if present, else compose from street/city/state/country
      const composed =
        b.address ||
        [b.street, b.city, b.state, b.country].filter(Boolean).join(", ");
      setInputValue(getEl("address"), composed);
    }

    // Preferences
    setInputValue(getEl("prefRole"), profile.preferences?.prefRole ?? "");
    setInputValue(getEl("prefLocation"), profile.preferences?.prefLocation ?? "");
    if (getEl("prefEmployment"))
      getEl("prefEmployment").value = profile.preferences?.prefEmployment ?? "";
    setInputValue(getEl("noticePeriod"), profile.preferences?.noticePeriod ?? "");

    // Experience
    const expList = $("#experienceList");
    if (expList) {
      expList.innerHTML = "";
      (profile.experience || []).forEach((item, i) => {
        const node = renderExperienceItem(item, i);
        if (node) expList.appendChild(node);
      });
    }

    // Education
    const eduList = $("#educationList");
    if (eduList) {
      eduList.innerHTML = "";
      (profile.education || []).forEach((item, i) => {
        const node = renderEducationItem(item, i);
        if (node) eduList.appendChild(node);
      });
    }

    // Custom
    renderCustomFields();
  }

  function renderExperienceItem(item = {}, index) {
    const tpl = $("#experienceItemTpl");
    if (!tpl?.content?.firstElementChild) return null;

    const node = tpl.content.firstElementChild.cloneNode(true);
    node.querySelector('[data-key="company"]').value = item.company || "";
    node.querySelector('[data-key="role"]').value = item.role || "";
    node.querySelector('[data-key="startDate"]').value = item.startDate || "";
    node.querySelector('[data-key="endDate"]').value = item.endDate || "";
    node.querySelector('[data-key="description"]').value = item.description || "";

    node.querySelectorAll("[data-key]").forEach((inp) => {
      inp.addEventListener("input", () => {
        const k = inp.dataset.key;
        profile.experience[index][k] =
          inp.type === "number" ? Number(inp.value) : inp.value;
        saveSilently();
      });
    });

    node.addEventListener("click", (e) => {
      const action = e.target?.dataset?.action;
      if (!action) return;
      if (action === "delete") {
        profile.experience.splice(index, 1);
        renderAll();
        saveSilently();
      }
      if (action === "move-up" && index > 0) {
        [profile.experience[index - 1], profile.experience[index]] = [
          profile.experience[index],
          profile.experience[index - 1]
        ];
        renderAll();
        saveSilently();
      }
      if (action === "move-down" && index < profile.experience.length - 1) {
        [profile.experience[index + 1], profile.experience[index]] = [
          profile.experience[index],
          profile.experience[index + 1]
        ];
        renderAll();
        saveSilently();
      }
    });

    return node;
  }

  function renderEducationItem(item = {}, index) {
    const tpl = $("#educationItemTpl");
    if (!tpl?.content?.firstElementChild) return null;

    const node = tpl.content.firstElementChild.cloneNode(true);
    node.querySelector('[data-key="school"]').value = item.school || "";
    node.querySelector('[data-key="degree"]').value = item.degree || "";
    node.querySelector('[data-key="startYear"]').value = item.startYear || "";
    node.querySelector('[data-key="endYear"]').value = item.endYear || "";
    node.querySelector('[data-key="notes"]').value = item.notes || "";

    node.querySelectorAll("[data-key]").forEach((inp) => {
      inp.addEventListener("input", () => {
        const k = inp.dataset.key;
        profile.education[index][k] =
          inp.type === "number" ? Number(inp.value) : inp.value;
        saveSilently();
      });
    });

    node.addEventListener("click", (e) => {
      const action = e.target?.dataset?.action;
      if (!action) return;
      if (action === "delete") {
        profile.education.splice(index, 1);
        renderAll();
        saveSilently();
      }
      if (action === "move-up" && index > 0) {
        [profile.education[index - 1], profile.education[index]] = [
          profile.education[index],
          profile.education[index - 1]
        ];
        renderAll();
        saveSilently();
      }
      if (action === "move-down" && index < profile.education.length - 1) {
        [profile.education[index + 1], profile.education[index]] = [
          profile.education[index],
          profile.education[index + 1]
        ];
        renderAll();
        saveSilently();
      }
    });

    return node;
  }

  function renderCustomFields() {
    const wrap = $("#customFieldsContainer");
    if (!wrap) return;
    wrap.innerHTML = "";
    (profile.custom || []).forEach((f, i) => {
      const card = document.createElement("div");
      card.className = "card";

      const label = document.createElement("label");
      label.className = "lbl";
      label.textContent = `${f.label} (${f.type})`;

      let inputEl;
      switch (f.type) {
        case "textarea":
          inputEl = document.createElement("textarea");
          inputEl.rows = 4;
          inputEl.className = "input";
          inputEl.value = f.value || "";
          break;
        case "number":
          inputEl = document.createElement("input");
          inputEl.type = "number";
          inputEl.className = "input";
          inputEl.value = f.value ?? "";
          break;
        case "date":
          inputEl = document.createElement("input");
          inputEl.type = "date";
          inputEl.className = "input";
          inputEl.value = f.value || "";
          break;
        case "checkbox":
          inputEl = document.createElement("input");
          inputEl.type = "checkbox";
          inputEl.className = "checkbox";
          inputEl.checked = Boolean(f.value);
          break;
        case "select":
          inputEl = document.createElement("select");
          inputEl.className = "input";
          (f.options || []).forEach((opt) => {
            const o = document.createElement("option");
            o.value = opt;
            o.textContent = opt;
            inputEl.appendChild(o);
          });
          inputEl.value = f.value || "";
          break;
        default:
          inputEl = document.createElement("input");
          inputEl.type = "text";
          inputEl.className = "input";
          inputEl.value = f.value || "";
      }

      inputEl.addEventListener("input", () => {
        profile.custom[i].value = f.type === "checkbox" ? inputEl.checked : inputEl.value;
        saveSilently();
      });
      if (f.type === "checkbox") {
        inputEl.addEventListener("change", () => {
          profile.custom[i].value = inputEl.checked;
          saveSilently();
        });
      }

      const row = document.createElement("div");
      row.className = f.type === "checkbox" ? "row gap" : "";
      row.appendChild(label);
      row.appendChild(inputEl);

      const actions = document.createElement("div");
      actions.className = "row-right gap mt";
      actions.innerHTML = `
        <button class="btn subtle" data-action="edit">Edit</button>
        <button class="btn danger" data-action="delete">Delete</button>
      `;
      actions.addEventListener("click", (e) => {
        const action = e.target?.dataset?.action;
        if (action === "delete") {
          profile.custom.splice(i, 1);
          renderCustomFields();
          saveSilently();
        }
        if (action === "edit") {
          openCustomFieldDialog(profile.custom[i], (updated) => {
            profile.custom[i] = updated;
            renderCustomFields();
            saveSilently();
          });
        }
      });

      card.appendChild(row);
      card.appendChild(actions);
      wrap.appendChild(card);
    });
  }

  // ---------- Add Buttons ----------
  if (getEl("addExperience")) {
    getEl("addExperience").addEventListener("click", () => {
      if (!Array.isArray(profile.experience)) profile.experience = [];
      profile.experience.push({
        company: "",
        role: "",
        startDate: "",
        endDate: "",
        description: ""
      });
      renderAll();
      saveSilently();
    });
  }

  if (getEl("addEducation")) {
    getEl("addEducation").addEventListener("click", () => {
      if (!Array.isArray(profile.education)) profile.education = [];
      profile.education.push({
        school: "",
        degree: "",
        startYear: "",
        endYear: "",
        notes: ""
      });
      renderAll();
      saveSilently();
    });
  }

  // ---------- Custom Field Dialog ----------
  if (getEl("addCustomFieldBtn")) {
    getEl("addCustomFieldBtn").addEventListener("click", () =>
      openCustomFieldDialog(null, (field) => {
        if (!Array.isArray(profile.custom)) profile.custom = [];
        profile.custom.push(field);
        renderCustomFields();
        saveSilently();
      })
    );
  }

  function openCustomFieldDialog(existing, onSave) {
    const dlg = $("#customFieldDialog");
    if (!dlg) return;

    const cfLabel = $("#cfLabel");
    const cfKey = $("#cfKey");
    const cfType = $("#cfType");
    const cfOptionsWrap = $("#cfOptionsWrap");
    const cfOptions = $("#cfOptions");

    cfLabel.value = existing?.label || "";
    cfKey.value = existing?.key || "";
    cfType.value = existing?.type || "text";
    cfOptions.value = (existing?.options || []).join(", ");
    cfOptionsWrap.classList.toggle("hidden", cfType.value !== "select");
    cfType.onchange = () =>
      cfOptionsWrap.classList.toggle("hidden", cfType.value !== "select");

    dlg.showModal();

    $("#cfSaveBtn").onclick = (e) => {
      e.preventDefault();
      const field = {
        id: existing?.id || (crypto?.randomUUID ? crypto.randomUUID() : `cf_${Date.now()}`),
        label: (cfLabel.value || "").trim(),
        key: (cfKey.value || cfLabel.value || "").trim(),
        type: cfType.value,
        options:
          cfType.value === "select"
            ? cfOptions.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : undefined,
        value: existing?.value ?? (cfType.value === "checkbox" ? false : "")
      };
      if (!field.label || !field.key) return;
      dlg.close();
      onSave(field);
    };

    dlg.addEventListener(
      "close",
      () => {
        $("#cfSaveBtn").onclick = null; // prevent duplicate handlers
      },
      { once: true }
    );
  }

  // ---------- Collect From UI ----------
  function collectFromUI() {
    const b = {};
    BASIC_FIELDS.forEach((id) => {
      const el = getEl(id);
      if (el) b[id] = getInputValue(el).trim?.() ?? getInputValue(el);
    });

    // Back-compat: if only #name is present, map to fullName
    if (has("#name")) {
      const v = getInputValue(getEl("name"));
      if (v) b.fullName = v.trim();
    }

    profile.basic = b;

    profile.preferences = {
      prefRole: getInputValue(getEl("prefRole")).trim?.() ?? getInputValue(getEl("prefRole")),
      prefLocation:
        getInputValue(getEl("prefLocation")).trim?.() ?? getInputValue(getEl("prefLocation")),
      prefEmployment: getEl("prefEmployment") ? getEl("prefEmployment").value : "",
      noticePeriod: getInputValue(getEl("noticePeriod"))
    };
  }

  // ---------- Save ----------
  function saveSilently() {
    chrome.storage.sync.set({ profileData: profile });
  }

  if (getEl("saveBtn")) {
    getEl("saveBtn").addEventListener("click", () => {
      collectFromUI();
      saveSilently();
      toast("Saved");
    });
  }

  // ---------- One-Click Fill ----------
  if (getEl("fillBtn")) {
    getEl("fillBtn").addEventListener("click", async () => {
      collectFromUI();
      saveSilently();
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab?.id) {
          chrome.tabs.sendMessage(tab.id, { action: "fillForm" }, () => {
            toast("Filling form…");
          });
        }
      } catch {
        // no-op
      }
    });
  }
})();
