(() => {
  const root = document.documentElement;

  const state = {
    finish: "graphite",
    levels: 4,
    light: "neutral",
    quantity: 1,
    cart: 0,
    activeModule: "gallery"
  };

  const pricing = {
    3: 259,
    4: 319,
    5: 389
  };

  const finishMap = {
    graphite: {
      label: "Graphite frame",
      frame: "#252b30",
      panel: "#f5f0e7",
      trim: "#c8a24f"
    },
    cloud: {
      label: "Cloud frame",
      frame: "#e9e5dc",
      panel: "#fbf9f4",
      trim: "#9a9fa6"
    },
    walnut: {
      label: "Walnut frame",
      frame: "#765139",
      panel: "#f5efe6",
      trim: "#d1a76a"
    }
  };

  const lightMap = {
    warm: {
      label: "Warm white",
      rgb: "255, 226, 182"
    },
    neutral: {
      label: "Neutral white",
      rgb: "255, 247, 224"
    },
    cool: {
      label: "Cool white",
      rgb: "214, 232, 255"
    }
  };

  const moduleFallbackByLevels = {
    3: "lounge",
    4: "gallery",
    5: "skyline"
  };

  const priceEl = document.querySelector("[data-price]");
  const selectedFinishEl = document.querySelector("[data-selected-finish]");
  const selectedHeightEl = document.querySelector("[data-selected-height]");
  const selectedLayoutEl = document.querySelector("[data-selected-layout]");
  const selectedLightEl = document.querySelector("[data-selected-light]");
  const quantityValueEl = document.querySelector("[data-quantity-value]");
  const cartCountEl = document.querySelector("[data-cart-count]");
  const toastEl = document.querySelector("[data-toast]");
  const towerRooms = Array.from(document.querySelectorAll(".tower-room"));
  const moduleCards = Array.from(document.querySelectorAll("[data-focus-module]"));

  let toastTimer = 0;

  function setPressedInGroup(button, selector) {
    const group = button.closest(selector);
    if (!group) return;

    group.querySelectorAll(".choice").forEach((item) => {
      const isSelected = item === button;
      item.classList.toggle("is-selected", isSelected);
      item.setAttribute("aria-pressed", String(isSelected));
    });
  }

  function formatPrice(value) {
    return `$${value.toLocaleString("en-US")}`;
  }

  function updatePrice() {
    if (priceEl) priceEl.textContent = formatPrice(pricing[state.levels]);
  }

  function updateFinish() {
    const finish = finishMap[state.finish];
    root.style.setProperty("--case-frame", finish.frame);
    root.style.setProperty("--case-panel", finish.panel);
    root.style.setProperty("--case-trim", finish.trim);
    if (selectedFinishEl) selectedFinishEl.textContent = finish.label;
  }

  function updateLight() {
    const light = lightMap[state.light];
    root.style.setProperty("--light-rgb", light.rgb);
    if (selectedLightEl) selectedLightEl.textContent = light.label;
  }

  function moduleIsVisible(moduleId) {
    const room = towerRooms.find((item) => item.dataset.module === moduleId);
    if (!room) return false;
    const level = Number(room.dataset.level || 0);
    return level <= state.levels;
  }

  function setActiveModule(moduleId) {
    const nextModule = moduleIsVisible(moduleId) ? moduleId : moduleFallbackByLevels[state.levels];
    state.activeModule = nextModule;

    towerRooms.forEach((room) => {
      room.classList.toggle("is-active", room.dataset.module === nextModule);
    });

    moduleCards.forEach((card) => {
      card.classList.toggle("is-active", card.dataset.focusModule === nextModule);
    });
  }

  function updateLevels() {
    root.dataset.levels = String(state.levels);
    if (selectedHeightEl) selectedHeightEl.textContent = `${state.levels} floors`;
    if (selectedLayoutEl) selectedLayoutEl.textContent = `${state.levels} floor kit`;
    updatePrice();
    setActiveModule(state.activeModule);
  }

  function showToast(message) {
    if (!toastEl) return;
    window.clearTimeout(toastTimer);
    toastEl.textContent = message;
    toastEl.classList.add("is-visible");
    toastTimer = window.setTimeout(() => {
      toastEl.classList.remove("is-visible");
    }, 2600);
  }

  document.querySelectorAll("[data-finish]").forEach((button) => {
    button.addEventListener("click", () => {
      state.finish = button.dataset.finish;
      setPressedInGroup(button, "[data-option-group='finish']");
      updateFinish();
    });
  });

  document.querySelectorAll("[data-level-choice]").forEach((button) => {
    button.addEventListener("click", () => {
      state.levels = Number(button.dataset.levelChoice);
      setPressedInGroup(button, "[data-option-group='levels']");
      updateLevels();
    });
  });

  document.querySelectorAll("[data-light]").forEach((button) => {
    button.addEventListener("click", () => {
      state.light = button.dataset.light;
      setPressedInGroup(button, "[data-option-group='light']");
      updateLight();
    });
  });

  document.querySelectorAll("[data-quantity]").forEach((button) => {
    button.addEventListener("click", () => {
      const direction = button.dataset.quantity;
      if (direction === "minus") state.quantity = Math.max(1, state.quantity - 1);
      if (direction === "plus") state.quantity = Math.min(9, state.quantity + 1);
      if (quantityValueEl) quantityValueEl.value = state.quantity;
      if (quantityValueEl) quantityValueEl.textContent = String(state.quantity);
    });
  });

  const addCartButton = document.querySelector("[data-add-cart]");
  if (addCartButton) {
    addCartButton.addEventListener("click", () => {
      state.cart += state.quantity;
      if (cartCountEl) cartCountEl.textContent = String(state.cart);
      showToast(`${state.quantity} Metro Stack ${state.quantity === 1 ? "case" : "cases"} added to cart.`);
    });
  }

  towerRooms.forEach((room) => {
    room.addEventListener("click", () => {
      setActiveModule(room.dataset.module);
    });
  });

  moduleCards.forEach((card) => {
    card.addEventListener("click", () => {
      setActiveModule(card.dataset.focusModule);
      document.querySelector("#overview")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  document.querySelectorAll(".accordion-button").forEach((button) => {
    button.addEventListener("click", () => {
      const panel = button.nextElementSibling;
      const accordion = button.closest(".accordion");
      const willOpen = button.getAttribute("aria-expanded") !== "true";

      accordion?.querySelectorAll(".accordion-button").forEach((item) => {
        item.classList.remove("is-open");
        item.setAttribute("aria-expanded", "false");
      });

      accordion?.querySelectorAll(".accordion-panel").forEach((item) => {
        item.hidden = true;
      });

      if (panel && willOpen) {
        button.classList.add("is-open");
        button.setAttribute("aria-expanded", "true");
        panel.hidden = false;
      }
    });
  });

  const sections = Array.from(document.querySelectorAll(".floor-section"));
  const elevatorTrack = document.querySelector("[data-elevator-track]");
  const elevatorCab = document.querySelector("[data-elevator-cab]");
  const elevatorFloor = document.querySelector("[data-elevator-floor]");
  const floorStops = Array.from(document.querySelectorAll(".floor-stop"));
  let elevatorTicking = false;

  function updateElevator() {
    elevatorTicking = false;
    if (!elevatorTrack || !elevatorCab || !sections.length) return;

    const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, window.scrollY / scrollable));
    const topPadding = 12;
    const travel = Math.max(0, elevatorTrack.clientHeight - elevatorCab.offsetHeight - topPadding * 2);
    elevatorCab.style.transform = `translateY(${progress * travel}px)`;

    const activeLine = window.scrollY + window.innerHeight * 0.44;
    let activeSection = sections[0];
    sections.forEach((section) => {
      if (section.offsetTop <= activeLine) activeSection = section;
    });

    const activeFloor = activeSection.dataset.floor || "1";
    if (elevatorFloor) elevatorFloor.textContent = activeFloor;

    floorStops.forEach((stop) => {
      const target = stop.dataset.target || "";
      stop.classList.toggle("is-active", target === `#${activeSection.id}`);
    });
  }

  function requestElevatorUpdate() {
    if (elevatorTicking) return;
    elevatorTicking = true;
    window.requestAnimationFrame(updateElevator);
  }

  floorStops.forEach((button) => {
    button.addEventListener("click", () => {
      const target = document.querySelector(button.dataset.target);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  window.addEventListener("scroll", requestElevatorUpdate, { passive: true });
  window.addEventListener("resize", requestElevatorUpdate);

  updateFinish();
  updateLight();
  updateLevels();
  updatePrice();
  updateElevator();
})();
