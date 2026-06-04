(function () {
  const form = document.querySelector("#interest-form");
  const emailInput = document.querySelector("#email");
  const message = document.querySelector("#form-message");

  if (!form || !emailInput || !message) return;

  const web3FormsEndpoint = "https://api.web3forms.com/submit";
  const web3FormsAccessKey = "8989dd1e-f96a-470a-8d96-1363ac4d3534";

  function setMessage(text, tone) {
    message.textContent = text;
    message.classList.remove("is-success", "is-error");
    if (tone) message.classList.add(tone);
  }

  function isValidEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return email.length <= 254 && emailPattern.test(email);
  }

  function showNoteBurst() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const origin = form.getBoundingClientRect();
    const burst = document.createElement("div");
    const notes = ["♪", "♫", "♬", "♩"];
    const noteCount = 16;

    burst.className = "note-burst";
    burst.setAttribute("aria-hidden", "true");

    for (let index = 0; index < noteCount; index += 1) {
      const note = document.createElement("span");
      const angle = (Math.PI * 2 * index) / noteCount - Math.PI / 2;
      const distance = 78 + Math.random() * 82;

      note.textContent = notes[index % notes.length];
      note.style.left = `${origin.left + origin.width / 2}px`;
      note.style.top = `${origin.top + origin.height / 2}px`;
      note.style.setProperty("--burst-x", `${Math.cos(angle) * distance}px`);
      note.style.setProperty("--burst-y", `${Math.sin(angle) * distance - 28}px`);
      note.style.setProperty("--burst-rotate", `${Math.random() * 120 - 60}deg`);
      note.style.animationDelay = `${Math.random() * 120}ms`;
      burst.appendChild(note);
    }

    document.body.appendChild(burst);
    window.setTimeout(() => burst.remove(), 2300);
  }

  async function submitLead(email) {
    const formData = new FormData(form);
    formData.append("access_key", web3FormsAccessKey);
    formData.append("subject", "New Wire Chord Studio beta signup");
    formData.append("mail", email);
    formData.append("source", "landingPage");

    const response = await fetch(web3FormsEndpoint, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || "Web3Forms rejected the request.");
    }
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = emailInput.value.trim();
    if (!emailInput.checkValidity() || !isValidEmail(email)) {
      setMessage("Enter a real email address, for example you@example.com.", "is-error");
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
      showNoteBurst();
    } catch {
      setMessage("Could not save that email right now. Please try again in a moment.", "is-error");
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Join free";
    }
  });
})();
