"use strict";
(function() {
  // global variables
  const towers = [
    {
      id: "tower-a",
      title: "Tower A",
      rooms: [
        {
          id: "living-innblock",
          name: "Living InnBlock",
          price: 64,
          roomType: "living",
          category: "base",
          theme: "home",
          floor: 1
        },
        {
          id: "bedroom-innblock",
          name: "Bedroom InnBlock",
          price: 62,
          roomType: "living",
          category: "base",
          theme: "home",
          floor: 2
        },
        {
          id: "entry-innblock",
          name: "Entry InnBlock",
          price: 54,
          roomType: "display",
          category: "theme",
          theme: "home",
          floor: 3
        }
      ]
    },
    {
      id: "tower-b",
      title: "Tower B",
      rooms: [
        {
          id: "kitchen-innblock",
          name: "Kitchen InnBlock",
          price: 68,
          roomType: "living",
          category: "base",
          theme: "home",
          floor: 1
        },
        {
          id: "studio-innblock",
          name: "Studio InnBlock",
          price: 66,
          roomType: "display",
          category: "theme",
          theme: "studio",
          floor: 2
        },
        {
          id: "pantry-innblock",
          name: "Pantry InnBlock",
          price: 56,
          roomType: "utility",
          category: "theme",
          theme: "shop",
          floor: 3
        }
      ]
    },
    {
      id: "tower-c",
      title: "Tower C",
      rooms: [
        {
          id: "bathroom-innblock",
          name: "Bathroom InnBlock",
          price: 60,
          roomType: "living",
          category: "base",
          theme: "home",
          floor: 1
        },
        {
          id: "laundry-innblock",
          name: "Laundry InnBlock",
          price: 58,
          roomType: "utility",
          category: "base",
          theme: "home",
          floor: 2
        },
        {
          id: "mechanical-innblock",
          name: "Mechanical InnBlock",
          price: 52,
          roomType: "utility",
          category: "theme",
          theme: "studio",
          floor: 3
        }
      ]
    }
  ];

  const state = {
    cartCount: 0,
    favorites: new Set(),
    filters: {
      roomType: "all",
      category: "all",
      theme: "all",
      sort: "featured"
    }
  };

  // loads the website
  window.addEventListener('load', init);

  // Sets up inital event listeners for the website
  function init() {
    renderTowers();

    [roomFilter, categoryFilter, themeFilter, sortFilter].forEach((control) => {
      control.addEventListener("change", updateFilters);
    });

    renderElevator();
  }

  const towerGrid = document.querySelector("#tower-grid");
  const cartCount = document.querySelector("[data-cart-count]");
  const roomFilter = document.querySelector("#room-filter");
  const categoryFilter = document.querySelector("#category-filter");
  const themeFilter = document.querySelector("#theme-filter");
  const sortFilter = document.querySelector("#sort-filter");

  // const totalFloors = document.querySelector("#total-floors");
  // const elevatorRail = document.querySelector(".elevator-rail");
  // const elevatorButtons = document.querySelectorAll("[data-elevator]");

  // elevator variables
  const elevator = document.getElementById("elevator-car");
  const track = document.querySelector(".elevator-scrollbar");
  const openDoor = "assets/elevator-open-transparent.png";
  const closedDoor = "assets/innblock-elevator-closed.png";
  let currentPosition = 0;
  let targetPosition = 0;
  let scrollStopTimer;
  let isSnapping = false;

  function getFilteredRooms(rooms) {
    return rooms
      .filter((room) => {
        const roomMatch =
          state.filters.roomType === "all" ||
          room.roomType === state.filters.roomType;
        const categoryMatch =
          state.filters.category === "all" ||
          room.category === state.filters.category;
        const themeMatch =
          state.filters.theme === "all" || room.theme === state.filters.theme;

        return roomMatch && categoryMatch && themeMatch;
      })
      .sort((a, b) => {
        if (state.filters.sort === "price-low") return a.price - b.price;
        if (state.filters.sort === "price-high") return b.price - a.price;
        if (state.filters.sort === "name") return a.name.localeCompare(b.name);
        return a.floor - b.floor;
      });
  }

  function renderProductCard(room, towerTitle) {
    const article = document.createElement("article");
    article.className = "product-card";
    article.dataset.floor = room.floor;
    article.dataset.productId = room.id;
    article.setAttribute("aria-labelledby", `${room.id}-title`);

    article.innerHTML = `
      <img class="product-frame" src="assets/innblock-product-card-frame-cropped.webp" alt="Product Frame" aria-hidden="true">
      <div class="image-slot">
        <span>Future room image asset area<br>${towerTitle} / Floor ${room.floor}</span>
      </div>
      <aside class="product-info" aria-label="${room.name} purchase options">
        <p class="floor-label">Floor ${room.floor}</p>
        <h2 class="product-name" id="${room.id}-title">${room.name}</h2>
        <p class="price">$${room.price}</p>
        <div class="product-actions">
          <button type="button" data-add-to-cart="${room.id}">Add to cart</button>
          <button type="button" aria-pressed="${state.favorites.has(room.id)}" data-favorite="${room.id}">
            ${state.favorites.has(room.id) ? "Favorited" : "Favorite"}
          </button>
        </div>
      </aside>
    `;

    return article;
  }

  function renderTowers() {
    towerGrid.innerHTML = "";

    let visibleCount = 0;

    towers.forEach((tower) => {
      const visibleRooms = getFilteredRooms(tower.rooms);
      visibleCount += visibleRooms.length;

      const section = document.createElement("section");
      section.className = "tower";
      section.id = tower.id;
      section.setAttribute("aria-labelledby", `${tower.id}-title`);

      const header = document.createElement("header");
      header.className = "tower-header";
      header.innerHTML = `
        <span id="${tower.id}-title">${tower.title}</span>
        <span>${visibleRooms.length} rooms</span>
      `;

      section.append(header);

      visibleRooms.forEach((room) => {
        section.append(renderProductCard(room, tower.title));
      });

      towerGrid.append(section);
    });

    if (visibleCount === 0) {
      const empty = document.createElement("p");
      empty.className = "empty-state";
      empty.textContent = "No rooms match the selected wireframe filters.";
      towerGrid.replaceChildren(empty);
    }

    bindProductActions();
  }

  function bindProductActions() {
    document.querySelectorAll("[data-add-to-cart]").forEach((button) => {
      button.addEventListener("click", () => {
        state.cartCount += 1;
        cartCount.textContent = state.cartCount;
      });
    });

    document.querySelectorAll("[data-favorite]").forEach((button) => {
      button.addEventListener("click", () => {
        const productId = button.dataset.favorite;

        if (state.favorites.has(productId)) {
          state.favorites.delete(productId);
          button.textContent = "Favorite";
          button.setAttribute("aria-pressed", "false");
        } else {
          state.favorites.add(productId);
          button.textContent = "Favorited";
          button.setAttribute("aria-pressed", "true");
        }
      });
    });
  }

  function updateFilters() {
    state.filters.roomType = roomFilter.value;
    state.filters.category = categoryFilter.value;
    state.filters.theme = themeFilter.value;
    state.filters.sort = sortFilter.value;
    renderTowers();
  }

  function renderElevator() {
    window.addEventListener("scroll", () => {
      updateTarget();
      scrollingStarted();
    }, { passive: true });

    window.addEventListener("resize", updateTarget);

    updateTarget();
    animateElevator();
  }

  // updates location of the elevator
  function updateTarget() {
    const maxScroll =
      document.documentElement.scrollHeight - window.innerHeight;

    const trackHeight = track.clientHeight;
    const elevatorHeight = elevator.offsetHeight;

    const maxTravel = Math.max(
      0,
      trackHeight - elevatorHeight
    );

    const progress = maxScroll > 0
      ? window.scrollY / maxScroll
      : 0;

    targetPosition = progress * maxTravel;
  }

  // animate eleavtor movement
  function animateElevator() {
    // Smoothness — higher = faster response
    currentPosition +=
      (targetPosition - currentPosition) * 0.08;

    elevator.style.transform =
      `translate3d(0, ${currentPosition}px, 0)`;

    requestAnimationFrame(animateElevator);
  }

  // max distance elevator can travel
  function getMaxTravel() {
    return Math.max(
      0,
      track.clientHeight - elevator.offsetHeight
    );
  }

  //snaps elevator to nearest floor of the tower
  function snapToNearestFloor() {
    const maxTravel = getMaxTravel();

    // 3 floors = 3 possible elevator positions
    const floorCount = 3;

    const floorSpacing =
      maxTravel / (floorCount - 1);

    // Find closest floor
    const nearestFloor = Math.round(
      currentPosition / floorSpacing
    );

    const snappedPosition =
      nearestFloor * floorSpacing;

    isSnapping = true;

    // Close enough to the floor → snap there
    targetPosition = snappedPosition;

    // Wait for the elevator to visually arrive
    setTimeout(() => {
      currentPosition = snappedPosition;
      targetPosition = snappedPosition;

      elevator.style.transform =
        `translate3d(0, ${snappedPosition}px, 0)`;

      // Open doors
      elevator.src = openDoor;

      isSnapping = false;
    }, 350);
  }

  // update elevator image when scrolling
  function scrollingStarted() {
    // Close doors while moving
    elevator.src = closedDoor;

    // Reset the timer every time scrolling continues
    clearTimeout(scrollStopTimer);

    // Wait until scrolling actually stops
    scrollStopTimer = setTimeout(() => {
      snapToNearestFloor();
    }, 200);
  }

})();