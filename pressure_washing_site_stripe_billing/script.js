const stripePaymentLinks = {
  deposit: "https://buy.stripe.com/REPLACE_WITH_DEPOSIT_PAYMENT_LINK",
  final: "https://buy.stripe.com/REPLACE_WITH_FINAL_PAYMENT_LINK"
};

const themeToggle = document.querySelector(".theme-toggle");
const savedTheme = localStorage.getItem("ppw-theme");

if (savedTheme === "dark") {
  document.body.classList.add("dark-mode");
  themeToggle.textContent = "Light";
  themeToggle.setAttribute("aria-label", "Switch to light mode");
}

themeToggle.addEventListener("click", () => {
  const isDark = document.body.classList.toggle("dark-mode");
  localStorage.setItem("ppw-theme", isDark ? "dark" : "light");
  themeToggle.textContent = isDark ? "Light" : "Dark";
  themeToggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
});

function encodeFormData(form) {
  return new URLSearchParams(new FormData(form)).toString();
}

function handleNetlifyForm(formId, messageId, successMessage) {
  const form = document.getElementById(formId);
  const message = document.getElementById(messageId);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    message.textContent = "Sending...";

    try {
      const response = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encodeFormData(form)
      });

      if (!response.ok) {
        throw new Error("Form submission failed");
      }

      message.textContent = successMessage;
      form.reset();
    } catch (error) {
      message.textContent = "Something went wrong. Please email everettpope77@gmail.com directly.";
    }
  });
}

handleNetlifyForm("quoteForm", "formMessage", "Thanks! Your quote request has been sent.");
handleNetlifyForm("bookingForm", "bookingMessage", "Thanks! Your booking request has been sent.");

const billingForm = document.getElementById("billingForm");
const billingMessage = document.getElementById("billingMessage");

billingForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  billingMessage.textContent = "Opening secure Stripe checkout...";

  const formData = new FormData(billingForm);

  try {
    const response = await fetch("/.netlify/functions/create-setup-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        notes: formData.get("notes")
      })
    });

    const data = await response.json();

    if (!response.ok || !data.url) {
      throw new Error(data.error || "Stripe checkout could not be created");
    }

    window.location.href = data.url;
  } catch (error) {
    billingMessage.textContent = "Stripe billing setup is not active yet. Please email everettpope77@gmail.com.";
  }
});

document.querySelectorAll(".stripe-pay").forEach((button) => {
  button.addEventListener("click", () => {
    const paymentType = button.dataset.payment;
    const paymentUrl = stripePaymentLinks[paymentType];

    if (!paymentUrl || paymentUrl.includes("REPLACE_WITH")) {
      alert("Stripe is ready to connect. Replace the placeholder Stripe Payment Link in script.js first.");
      return;
    }

    window.location.href = paymentUrl;
  });
});
