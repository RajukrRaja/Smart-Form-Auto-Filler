// Key synonyms for better matching
const KEY_SYNONYMS = {
  name: ["name", "full_name", "fullname"],
  email: ["email", "e-mail", "useremail"],
  phone: ["phone", "mobile", "tel", "telephone", "contact"],
  address: ["address", "addr", "location"],
  summary: ["summary", "about", "bio"],

  company: ["company", "employer", "organization", "org"],
  role: ["role", "title", "jobtitle", "position"],
  startDate: ["start", "startdate", "from"],
  endDate: ["end", "enddate", "to"],

  prefRole: ["preferredrole", "targetrole", "position"],
  prefLocation: ["preferredlocation", "location", "city"],
  prefEmployment: ["employmenttype", "jobtype", "worktype"],
  noticePeriod: ["noticeperiod", "notice", "availability"]
};

const normalize = (str) =>
  (str || "").toLowerCase().replace(/[^a-z0-9_]/g, "");

function matchKey(fieldNameOrId, availableKeys) {
  const norm = normalize(fieldNameOrId);
  for (const key of availableKeys) {
    const synonyms = KEY_SYNONYMS[key] || [key];
    if (synonyms.some((s) => norm.includes(s))) return key;
  }
  for (const key of availableKeys) {
    if (norm.includes(normalize(key))) return key;
  }
  return null;
}

chrome.runtime.onMessage.addListener((req) => {
  if (req.action !== "fillForm") return;

  chrome.storage.sync.get("profileData", (data) => {
    const profile = data?.profileData || {};
    const basic = profile.basic || {};
    const prefs = profile.preferences || {};
    const custom = Array.isArray(profile.custom) ? profile.custom : [];

    const map = { ...basic, ...prefs };
    custom.forEach((cf) => {
      map[cf.key] = cf.type === "checkbox" ? !!cf.value : (cf.value ?? "");
    });

    const fields = document.querySelectorAll("input, textarea, select");
    fields.forEach((el) => {
      const key = matchKey(
        el.name || el.id || el.getAttribute("placeholder") || "",
        Object.keys(map)
      );
      if (!key) return;
      const val = map[key];
      if (val == null || val === "") return;

      if (el.tagName === "SELECT") {
        const options = Array.from(el.options || []);
        const exact = options.find(
          (o) => normalize(o.value) === normalize(val) || normalize(o.text) === normalize(val)
        );
        if (exact) el.value = exact.value;
        else {
          const partial = options.find((o) => normalize(o.text).includes(normalize(val)));
          if (partial) el.value = partial.value;
        }
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
        return;
      }

      const type = (el.getAttribute("type") || el.tagName).toLowerCase();
      if (type === "checkbox") {
        el.checked = !!val;
        el.dispatchEvent(new Event("change", { bubbles: true }));
      } else if (type === "radio") {
        if (normalize(el.value) === normalize(val)) {
          el.checked = true;
          el.dispatchEvent(new Event("change", { bubbles: true }));
        }
      } else {
        el.value = val;
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });

    const experience = Array.isArray(profile.experience) ? profile.experience : [];
    if (experience.length) {
      const xpText = experience
        .map((x) => {
          const dates = [x.startDate, x.endDate].filter(Boolean).join(" - ");
          return `• ${x.role || "Role"} @ ${x.company || "Company"}${
            dates ? ` (${dates})` : ""
          }\n  ${x.description || ""}`;
        })
        .join("\n");
      document.querySelectorAll("textarea").forEach((ta) => {
        const hint = (ta.name || ta.id || ta.placeholder || "").toLowerCase();
        if (/(experience|work|summary|responsibilities|achievements)/.test(hint) && !ta.value) {
          ta.value = xpText;
          ta.dispatchEvent(new Event("input", { bubbles: true }));
          ta.dispatchEvent(new Event("change", { bubbles: true }));
        }
      });
    }
  });
});
