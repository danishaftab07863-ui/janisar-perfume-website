/* =====================================
   JANISAR LUXURY PERFUME WEBSITE
   COMPLETE JAVASCRIPT
===================================== */

const phoneNumber = "917783053025";

const coupons = {
    JANISAR10: 10,
    LUXURY15: 15,
    WELCOME20: 20
};

let cart = JSON.parse(localStorage.getItem("janisarCart")) || [];
let wishlist = JSON.parse(localStorage.getItem("janisarWishlist")) || [];
let appliedCoupon = "";

const getElement = (id) => document.getElementById(id);

function saveCart() {
    localStorage.setItem("janisarCart", JSON.stringify(cart));
}

function saveWishlist() {
    localStorage.setItem("janisarWishlist", JSON.stringify(wishlist));
}

function formatPrice(price) {
    return "₹" + Number(price).toLocaleString("en-IN");
}

// TOAST NOTIFICATION
let toastTimeout;
function showToast(message) {
    const toast = getElement("toast-message");
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.remove("show");
    }, 2800);
}

// MOBILE NAV
const menuToggle = getElement("menu-toggle");
const mainNav = getElement("main-nav");

menuToggle?.addEventListener("click", () => {
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isExpanded));
    mainNav?.classList.toggle("active");
    menuToggle.textContent = isExpanded ? "☰" : "✕";
});

mainNav?.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
        mainNav.classList.remove("active");
        menuToggle?.setAttribute("aria-expanded", "false");
        if (menuToggle) menuToggle.textContent = "☰";
    });
});

// BACK TO TOP
const backToTopBtn = getElement("back-to-top");
window.addEventListener("scroll", () => {
    if (!backToTopBtn) return;
    backToTopBtn.classList.toggle("show", window.scrollY > 300);
});

backToTopBtn?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
});

// CART COUNT & ADD TO CART
function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    const display = getElement("cart-count");
    if (display) display.textContent = count;
}

function addToCart(product) {
    const existing = cart.find(item => item.name === product.name);

    if (existing) {
        existing.quantity += product.quantity || 1;
    } else {
        cart.push({
            ...product,
            quantity: product.quantity || 1
        });
    }

    saveCart();
    updateCartCount();
    renderCart();
    showToast(`${product.name} added to your cart`);
}

document.querySelectorAll(".product-card").forEach(card => {
    const button = card.querySelector(".add-cart");
    button?.addEventListener("click", () => {
        const product = {
            name: card.dataset.name,
            price: Number(card.dataset.price),
            image: card.dataset.image,
            quantity: 1
        };

        addToCart(product);

        button.textContent = "ADDED ✓";
        setTimeout(() => {
            button.textContent = "ADD TO CART";
        }, 1000);
    });
});

// CART PANEL TOGGLE
const cartPanel = getElement("cart-panel");
getElement("cart-toggle")?.addEventListener("click", () => {
    getElement("wishlist-panel")?.classList.remove("active");
    cartPanel?.classList.add("active");
    renderCart();
});

getElement("close-cart")?.addEventListener("click", () => {
    cartPanel?.classList.remove("active");
});

// RENDER CART
function renderCart() {
    const container = getElement("cart-items");
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = "<p>Your cart is empty.</p>";
        updateCartTotals();
        return;
    }

    container.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-item-info">
                <h3>${item.name}</h3>
                <p>${formatPrice(item.price)}</p>
                <div class="quantity-controls">
                    <button data-action="decrease" data-index="${index}">−</button>
                    <span>${item.quantity}</span>
                    <button data-action="increase" data-index="${index}">+</button>
                </div>
                <button class="remove-item" data-action="remove" data-index="${index}">Remove</button>
            </div>
        </div>
    `).join("");

    updateCartTotals();
}

getElement("cart-items")?.addEventListener("click", event => {
    const button = event.target.closest("[data-action]");
    if (!button) return;

    const index = Number(button.dataset.index);
    if (!Number.isInteger(index) || !cart[index]) return;

    const action = button.dataset.action;

    if (action === "increase") cart[index].quantity++;
    if (action === "decrease") {
        cart[index].quantity--;
        if (cart[index].quantity <= 0) cart.splice(index, 1);
    }
    if (action === "remove") cart.splice(index, 1);

    saveCart();
    updateCartCount();
    renderCart();
});

// COUPONS & TOTALS
getElement("apply-coupon")?.addEventListener("click", () => {
    const input = getElement("coupon-code");
    const message = getElement("coupon-message");
    if (!input || !message) return;

    const code = input.value.trim().toUpperCase();

    if (coupons[code]) {
        appliedCoupon = code;
        message.textContent = `${coupons[code]}% discount applied (${code})!`;
        message.style.color = "#25D366";
        showToast(`Coupon ${code} applied!`);
    } else {
        appliedCoupon = "";
        message.textContent = "Invalid coupon code.";
        message.style.color = "#ff9999";
    }

    updateCartTotals();
});

function updateCartTotals() {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discountPercent = coupons[appliedCoupon] || 0;
    const discount = Math.round(subtotal * discountPercent / 100);
    const total = subtotal - discount;

    if (getElement("cart-subtotal")) getElement("cart-subtotal").textContent = formatPrice(subtotal);
    if (getElement("cart-discount")) getElement("cart-discount").textContent = formatPrice(discount);
    if (getElement("cart-total")) getElement("cart-total").textContent = formatPrice(total);
}

// WHATSAPP ORDER
getElement("whatsapp-order")?.addEventListener("click", () => {
    if (cart.length === 0) {
        showToast("Your cart is empty!");
        return;
    }

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discountPercent = coupons[appliedCoupon] || 0;
    const discount = Math.round(subtotal * discountPercent / 100);
    const total = subtotal - discount;

    let message = "Hello JANISAR! I want to place an order.\n\n";

    cart.forEach((item, index) => {
        message += `${index + 1}. ${item.name}\nQuantity: ${item.quantity}\nPrice: ${formatPrice(item.price * item.quantity)}\n\n`;
    });

    message += `Subtotal: ${formatPrice(subtotal)}\n`;
    if (discount > 0) message += `Discount: -${formatPrice(discount)}\n`;
    message += `Total Payable: ${formatPrice(total)}\n`;
    if (appliedCoupon) message += `Coupon: ${appliedCoupon}\n`;
    message += "\nPlease confirm my order. Thank you!";

    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, "_blank");
});

// SEARCH, FILTER & SORT
const searchInput = getElement("product-search");
searchInput?.addEventListener("input", filterProducts);
getElement("category-filter")?.addEventListener("change", filterProducts);
getElement("sort-products")?.addEventListener("change", filterProducts);

function filterProducts() {
    const search = searchInput?.value.toLowerCase().trim() || "";
    const category = getElement("category-filter")?.value || "all";
    const sort = getElement("sort-products")?.value || "default";

    const container = getElement("product-container");
    const cards = [...document.querySelectorAll(".product-card")];

    let visibleCards = cards.filter(card => {
        const name = (card.dataset.name || "").toLowerCase();
        const desc = (card.dataset.description || "").toLowerCase();
        return (name.includes(search) || desc.includes(search)) &&
            (category === "all" || card.dataset.category === category);
    });

    if (sort === "low-high") visibleCards.sort((a, b) => Number(a.dataset.price) - Number(b.dataset.price));
    if (sort === "high-low") visibleCards.sort((a, b) => Number(b.dataset.price) - Number(a.dataset.price));
    if (sort === "name") visibleCards.sort((a, b) => a.dataset.name.localeCompare(b.dataset.name));

    cards.forEach(card => card.hidden = true);
    visibleCards.forEach(card => {
        card.hidden = false;
        container?.appendChild(card);
    });

    const noProducts = getElement("no-products");
    if (noProducts) noProducts.hidden = visibleCards.length !== 0;
}

// WISHLIST LOGIC
function updateWishlistCount() {
    const display = getElement("wishlist-count");
    if (display) display.textContent = wishlist.length;
}

function renderWishlist() {
    const container = getElement("wishlist-items");
    if (!container) return;

    if (wishlist.length === 0) {
        container.innerHTML = "<p>Your wishlist is empty.</p>";
        return;
    }

    container.innerHTML = wishlist.map((item, index) => `
        <div class="wishlist-item">
            <img src="${item.image}" alt="${item.name}">
            <div>
                <h3>${item.name}</h3>
                <p>${formatPrice(item.price)}</p>
                <button class="add-cart" data-wishlist-add="${index}">ADD TO CART</button>
                <button class="remove-item" data-wishlist-remove="${index}">Remove</button>
            </div>
        </div>
    `).join("");
}

document.querySelectorAll(".product-card").forEach(card => {
    const button = card.querySelector(".wishlist-btn");
    button?.addEventListener("click", () => {
        const product = {
            name: card.dataset.name,
            price: Number(card.dataset.price),
            image: card.dataset.image
        };

        const index = wishlist.findIndex(item => item.name === product.name);
        if (index >= 0) {
            wishlist.splice(index, 1);
            showToast(`${product.name} removed from wishlist`);
        } else {
            wishlist.push(product);
            showToast(`${product.name} added to wishlist`);
        }

        saveWishlist();
        updateWishlistCount();
        renderWishlist();
        syncWishlistButtons();
    });
});

getElement("wishlist-toggle")?.addEventListener("click", () => {
    cartPanel?.classList.remove("active");
    getElement("wishlist-panel")?.classList.add("active");
    renderWishlist();
});

getElement("wishlist-close")?.addEventListener("click", () => {
    getElement("wishlist-panel")?.classList.remove("active");
});

getElement("wishlist-items")?.addEventListener("click", event => {
    const addBtn = event.target.closest("[data-wishlist-add]");
    const removeBtn = event.target.closest("[data-wishlist-remove]");

    if (addBtn) {
        const item = wishlist[Number(addBtn.dataset.wishlistAdd)];
        if (item) addToCart({ ...item, quantity: 1 });
    }
    if (removeBtn) {
        wishlist.splice(Number(removeBtn.dataset.wishlistRemove), 1);
        saveWishlist();
        updateWishlistCount();
        renderWishlist();
        syncWishlistButtons();
    }
});

function syncWishlistButtons() {
    document.querySelectorAll(".product-card").forEach(card => {
        const button = card.querySelector(".wishlist-btn");
        if (!button) return;
        const exists = wishlist.some(item => item.name === card.dataset.name);
        button.classList.toggle("active", exists);
        button.textContent = exists ? "♥" : "♡";
    });
}

// QUICK VIEW MODAL
const modal = getElement("quick-view-modal");
let selectedSize = "50ml";
let currentBasePrice = 0;
let modalQuantity = 1;

document.querySelectorAll(".product-card").forEach(card => {
    card.querySelector(".quick-view")?.addEventListener("click", () => {
        const baseImg = card.dataset.image;
        currentBasePrice = Number(card.dataset.price);
        modalQuantity = 1;
        selectedSize = "50ml";

        getElement("modal-image").src = baseImg;
        getElement("modal-name").textContent = card.dataset.name;
        getElement("modal-description").textContent = card.dataset.description;
        getElement("modal-qty-value").textContent = modalQuantity;

        document.querySelectorAll(".size-btn").forEach(btn => {
            btn.classList.toggle("active", btn.dataset.size === "50ml");
        });

        const thumbContainer = getElement("modal-thumbnails");
        thumbContainer.innerHTML = `
            <img src="${baseImg}" class="thumb active" alt="Thumb">
            <img src="${baseImg}" class="thumb" alt="Thumb">
        `;

        thumbContainer.querySelectorAll(".thumb").forEach(thumb => {
            thumb.addEventListener("click", (e) => {
                getElement("modal-image").src = e.target.src;
                thumbContainer.querySelectorAll(".thumb").forEach(t => t.classList.remove("active"));
                e.target.classList.add("active");
            });
        });

        updateModalPrice();
        modal?.classList.add("active");
        modal?.setAttribute("aria-hidden", "false");
    });
});

document.querySelectorAll(".size-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
        document.querySelectorAll(".size-btn").forEach(b => b.classList.remove("active"));
        e.target.classList.add("active");
        selectedSize = e.target.dataset.size;
        updateModalPrice();
    });
});

getElement("modal-qty-plus")?.addEventListener("click", () => {
    modalQuantity++;
    getElement("modal-qty-value").textContent = modalQuantity;
});

getElement("modal-qty-minus")?.addEventListener("click", () => {
    if (modalQuantity > 1) {
        modalQuantity--;
        getElement("modal-qty-value").textContent = modalQuantity;
    }
});

function updateModalPrice() {
    const activeBtn = document.querySelector(".size-btn.active");
    const multiplier = activeBtn ? Number(activeBtn.dataset.priceMultiplier) : 1;
    const calculatedPrice = Math.round(currentBasePrice * multiplier);

    getElement("modal-price").textContent = formatPrice(calculatedPrice);

    getElement("modal-add-cart").onclick = () => {
        addToCart({
            name: `${getElement("modal-name").textContent} (${selectedSize})`,
            price: calculatedPrice,
            image: getElement("modal-image").src,
            quantity: modalQuantity
        });
        closeModal();
    };
}

getElement("modal-close")?.addEventListener("click", closeModal);
modal?.addEventListener("click", e => {
    if (e.target === modal) closeModal();
});

function closeModal() {
    modal?.classList.remove("active");
    modal?.setAttribute("aria-hidden", "true");
}

document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
        closeModal();
        cartPanel?.classList.remove("active");
        getElement("wishlist-panel")?.classList.remove("active");
    }
});

// NEWSLETTER
getElement("newsletter-form")?.addEventListener("submit", e => {
    e.preventDefault();
    const email = getElement("newsletter-email")?.value.trim();
    if (!email) return;

    let subs = JSON.parse(localStorage.getItem("janisarSubscribers")) || [];
    if (subs.includes(email)) {
        getElement("newsletter-message").textContent = "This email is already subscribed.";
        return;
    }

    subs.push(email);
    localStorage.setItem("janisarSubscribers", JSON.stringify(subs));
    getElement("newsletter-message").textContent = "Thank you! Use WELCOME20 for 20% off.";
    showToast("Subscribed successfully!");
    getElement("newsletter-form")?.reset();
});

// INITIAL LOAD
updateCartCount();
updateWishlistCount();
renderCart();
renderWishlist();
syncWishlistButtons();