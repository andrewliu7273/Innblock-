(() => {
  const ROOT_SELECTOR = "[data-innblock-home]";

  function getShopifyRoute(path) {
    const root =
      window.Shopify && window.Shopify.routes && window.Shopify.routes.root
        ? window.Shopify.routes.root
        : "/";

    return `${root}${root.endsWith("/") ? "" : "/"}${path}`;
  }

  function numberFromDataset(element, key, fallback = 0) {
    const value = Number(element.dataset[key]);
    return Number.isFinite(value) ? value : fallback;
  }

  function initInnblockHome(root) {
    if (!root || root.dataset.innblockReady === "true") return;

    root.dataset.innblockReady = "true";

    const state = {
      favorites: new Set(),
      filters: {
        roomType: "all",
        category: "all",
        theme: "all",
        sort: "featured"
      }
    };

    const cards = Array.from(root.querySelectorAll("[data-innblock-room]"));
    const towers = Array.from(root.querySelectorAll("[data-innblock-tower]"));
    const cartCount = root.querySelector("[data-innblock-cart-count]");
    const roomFilter = root.querySelector("[data-innblock-room-filter]");
    const categoryFilter = root.querySelector("[data-innblock-category-filter]");
    const themeFilter = root.querySelector("[data-innblock-theme-filter]");
    const sortFilter = root.querySelector("[data-innblock-sort-filter]");
    const elevatorCar = root.querySelector("[data-innblock-elevator-car]");
    const currentFloor = root.querySelector("[data-innblock-current-floor]");
    const totalFloors = root.querySelector("[data-innblock-total-floors]");
    const elevatorRail = root.querySelector("[data-innblock-elevator-rail]");
    const emptyState = root.querySelector("[data-innblock-empty]");
    const floorCount = Math.max(
      1,
      ...cards.map((card) => numberFromDataset(card, "floor", 1))
    );

    if (totalFloors) totalFloors.textContent = String(floorCount);

    function matchesFilters(card) {
      const roomMatch =
        state.filters.roomType === "all" ||
        card.dataset.roomType === state.filters.roomType;
      const categoryMatch =
        state.filters.category === "all" ||
        card.dataset.category === state.filters.category;
      const themeMatch =
        state.filters.theme === "all" ||
        card.dataset.theme === state.filters.theme;

      return roomMatch && categoryMatch && themeMatch;
    }

    function sortCards(a, b) {
      if (state.filters.sort === "price-low") {
        return (
          numberFromDataset(a, "priceCents") -
          numberFromDataset(b, "priceCents")
        );
      }

      if (state.filters.sort === "price-high") {
        return (
          numberFromDataset(b, "priceCents") -
          numberFromDataset(a, "priceCents")
        );
      }

      if (state.filters.sort === "name") {
        return (a.dataset.name || "").localeCompare(b.dataset.name || "");
      }

      return numberFromDataset(a, "floor", 1) - numberFromDataset(b, "floor", 1);
    }

    function renderFilters() {
      let visibleCount = 0;

      towers.forEach((tower) => {
        const roomList = tower.querySelector("[data-innblock-room-list]");
        const towerCards = cards
          .filter((card) => card.dataset.tower === tower.dataset.tower)
          .sort(sortCards);
        const visibleCards = towerCards.filter(matchesFilters);

        towerCards.forEach((card) => {
          card.hidden = !matchesFilters(card);
          if (roomList) roomList.append(card);
        });

        visibleCount += visibleCards.length;
        tower.hidden = visibleCards.length === 0;

        const count = tower.querySelector("[data-innblock-tower-count]");
        if (count) {
          count.textContent = `${visibleCards.length} ${
            visibleCards.length === 1 ? "room" : "rooms"
          }`;
        }
      });

      if (emptyState) emptyState.hidden = visibleCount !== 0;
      updateElevator();
    }

    function updateFilters() {
      state.filters.roomType = roomFilter ? roomFilter.value : "all";
      state.filters.category = categoryFilter ? categoryFilter.value : "all";
      state.filters.theme = themeFilter ? themeFilter.value : "all";
      state.filters.sort = sortFilter ? sortFilter.value : "featured";
      renderFilters();
    }

    function getScrollProgress() {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      return maxScroll > 0 ? window.scrollY / maxScroll : 0;
    }

    function updateElevator() {
      if (!elevatorCar || !currentFloor || !elevatorRail) return;

      const progress = Math.min(Math.max(getScrollProgress(), 0), 1);
      const floor = Math.min(
        floorCount,
        Math.max(1, Math.round(progress * (floorCount - 1)) + 1)
      );
      const isMobile = window.matchMedia("(max-width: 760px)").matches;
      const railSize = isMobile
        ? elevatorRail.clientWidth
        : elevatorRail.clientHeight;
      const carSize = isMobile ? elevatorCar.offsetWidth : elevatorCar.offsetHeight;
      const travel = Math.max(0, railSize - carSize - 2);
      const offset = Math.round(progress * travel);

      currentFloor.textContent = String(floor);
      elevatorCar.textContent = String(floor);

      if (isMobile) {
        elevatorCar.style.left = `${offset}px`;
        elevatorCar.style.top = "";
      } else {
        elevatorCar.style.top = `${offset}px`;
        elevatorCar.style.left = "";
      }
    }

    function moveElevator(direction) {
      const floorHeight = window.innerHeight * 0.72;
      const nextPosition =
        direction === "up"
          ? window.scrollY - floorHeight
          : window.scrollY + floorHeight;

      window.scrollTo({
        top: nextPosition,
        behavior: "smooth"
      });
    }

    async function refreshCartCount() {
      if (!cartCount) return;

      const response = await fetch(getShopifyRoute("cart.js"), {
        headers: { Accept: "application/json" }
      });

      if (!response.ok) return;

      const cart = await response.json();
      cartCount.textContent = String(cart.item_count || 0);
    }

    async function addToCart(button) {
      const card = button.closest("[data-innblock-room]");
      const variantId = card ? card.dataset.variantId : "";

      if (!variantId) return;

      const defaultText = button.dataset.defaultText || button.textContent;
      button.disabled = true;
      button.textContent = "Adding...";

      try {
        const response = await fetch(getShopifyRoute("cart/add.js"), {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            items: [{ id: Number(variantId), quantity: 1 }]
          })
        });

        if (!response.ok) throw new Error("Cart add failed");

        await refreshCartCount();
        document.dispatchEvent(
          new CustomEvent("innblock:cart:add", {
            bubbles: true,
            detail: { variantId }
          })
        );

        button.textContent = "Added";
        window.setTimeout(() => {
          button.textContent = defaultText;
          button.disabled = false;
        }, 1200);
      } catch (error) {
        button.textContent = "Try again";
        window.setTimeout(() => {
          button.textContent = defaultText;
          button.disabled = false;
        }, 1600);
      }
    }

    function toggleFavorite(button) {
      const card = button.closest("[data-innblock-room]");
      if (!card) return;

      const productId = card.dataset.productId || card.id;

      if (state.favorites.has(productId)) {
        state.favorites.delete(productId);
        button.textContent = "Favorite";
        button.setAttribute("aria-pressed", "false");
      } else {
        state.favorites.add(productId);
        button.textContent = "Favorited";
        button.setAttribute("aria-pressed", "true");
      }
    }

    [roomFilter, categoryFilter, themeFilter, sortFilter]
      .filter(Boolean)
      .forEach((control) => control.addEventListener("change", updateFilters));

    root.addEventListener("click", (event) => {
      const addButton = event.target.closest("[data-innblock-add]");
      if (addButton && root.contains(addButton) && !addButton.disabled) {
        addToCart(addButton);
        return;
      }

      const favoriteButton = event.target.closest("[data-innblock-favorite]");
      if (favoriteButton && root.contains(favoriteButton)) {
        toggleFavorite(favoriteButton);
        return;
      }

      const elevatorButton = event.target.closest("[data-innblock-elevator]");
      if (elevatorButton && root.contains(elevatorButton)) {
        moveElevator(elevatorButton.dataset.innblockElevator);
      }
    });

    window.addEventListener("scroll", updateElevator, { passive: true });
    window.addEventListener("resize", updateElevator);

    renderFilters();
    refreshCartCount();
  }

  function initAll() {
    document.querySelectorAll(ROOT_SELECTOR).forEach(initInnblockHome);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll);
  } else {
    initAll();
  }

  document.addEventListener("shopify:section:load", (event) => {
    const root = event.target.matches(ROOT_SELECTOR)
      ? event.target
      : event.target.querySelector(ROOT_SELECTOR);

    if (root) initInnblockHome(root);
  });
})();
