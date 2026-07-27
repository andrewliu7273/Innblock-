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
  },
  {
    id: "tower-d",
    title: "Tower D",
    rooms: [
      {
        id: "collector-innblock",
        name: "Collector InnBlock",
        price: 70,
        roomType: "display",
        category: "collector",
        theme: "studio",
        floor: 1
      },
      {
        id: "storage-innblock",
        name: "Storage InnBlock",
        price: 55,
        roomType: "utility",
        category: "collector",
        theme: "shop",
        floor: 2
      },
      {
        id: "balcony-innblock",
        name: "Balcony InnBlock",
        price: 59,
        roomType: "display",
        category: "collector",
        theme: "home",
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

const towerGrid = document.querySelector("#tower-grid");
const cartCount = document.querySelector("[data-cart-count]");
const roomFilter = document.querySelector("#room-filter");
const categoryFilter = document.querySelector("#category-filter");
const themeFilter = document.querySelector("#theme-filter");
const sortFilter = document.querySelector("#sort-filter");
const elevatorCar = document.querySelector("#elevator-car");
const currentFloor = document.querySelector("#current-floor");
const totalFloors = document.querySelector("#total-floors");
const elevatorRail = document.querySelector(".elevator-rail");
const elevatorButtons = document.querySelectorAll("[data-elevator]");

const floorCount = Math.max(
  ...towers.flatMap((tower) => tower.rooms.map((room) => room.floor))
);

totalFloors.textContent = floorCount;

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
  updateElevator();
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

function getScrollProgress() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  return maxScroll > 0 ? window.scrollY / maxScroll : 0;
}

function updateElevator() {
  const progress = Math.min(Math.max(getScrollProgress(), 0), 1);
  const floor = Math.min(floorCount, Math.max(1, Math.round(progress * (floorCount - 1)) + 1));
  const isMobile = window.matchMedia("(max-width: 760px)").matches;
  const railSize = isMobile ? elevatorRail.clientWidth : elevatorRail.clientHeight;
  const carSize = isMobile ? elevatorCar.offsetWidth : elevatorCar.offsetHeight;
  const travel = Math.max(0, railSize - carSize - 2);
  const offset = Math.round(progress * travel);

  currentFloor.textContent = floor;
  elevatorCar.textContent = floor;

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

[roomFilter, categoryFilter, themeFilter, sortFilter].forEach((control) => {
  control.addEventListener("change", updateFilters);
});

elevatorButtons.forEach((button) => {
  button.addEventListener("click", () => moveElevator(button.dataset.elevator));
});

window.addEventListener("scroll", updateElevator, { passive: true });
window.addEventListener("resize", updateElevator);

renderTowers();
