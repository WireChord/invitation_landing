(function () {
  const form = document.querySelector("#interest-form");
  const emailInput = document.querySelector("#email");
  const message = document.querySelector("#form-message");

  if (!form || !emailInput || !message) return;

  const storageKey = "wireChordLandingLeads";

  function setMessage(text, tone) {
    message.textContent = text;
    message.classList.remove("is-success", "is-error");
    if (tone) message.classList.add(tone);
  }

  function readLocalLeads() {
    try {
      const raw = window.localStorage.getItem(storageKey);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveLocalLead(email) {
    const normalizedEmail = email.toLowerCase();
    const leads = readLocalLeads();
    const alreadySaved = leads.some((lead) => lead.email === normalizedEmail);
    if (!alreadySaved) {
      leads.push({
        email: normalizedEmail,
        createdAt: new Date().toISOString(),
        source: "landingPage",
      });
      window.localStorage.setItem(storageKey, JSON.stringify(leads));
    }
  }

  async function submitLead(email) {
    const endpoint = window.WIRECHORD_LEADS_ENDPOINT;
    if (typeof endpoint !== "string" || endpoint.trim() === "") {
      saveLocalLead(email);
      return;
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        source: "landingPage",
      }),
    });

    if (!response.ok) {
      throw new Error("Lead endpoint rejected the request.");
    }
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = emailInput.value.trim();
    if (!emailInput.checkValidity() || email === "") {
      setMessage("Enter a valid email and we will keep you posted.", "is-error");
      emailInput.focus();
      return;
    }

    const submitButton = form.querySelector("button[type='submit']");
    submitButton.disabled = true;
    submitButton.textContent = "Joining...";
    setMessage("Saving your spot...", null);

    try {
      await submitLead(email);
      form.reset();
      setMessage("You are on the free beta list. We will send the invite when it is ready.", "is-success");
    } catch {
      setMessage("Could not save that email right now. Please try again in a moment.", "is-error");
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Join free";
    }
  });
})();
