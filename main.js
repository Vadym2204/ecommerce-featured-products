// Асинхронна ф-ція для отримання продуктів з API Shopify за допомогою GraphQL
async function fetchProducts() {
  // URL запит до API Shopify
  const url = "https://tsodykteststore.myshopify.com/api/2023-01/graphql.json";
  // GraphQL-запит, який отримує назви, опис, ціни та зображення продуктів
  const query = `
        {
          products(first: 10) {
            edges {
              node {
                title
                description
                variants(first: 1) {
                  edges {
                    node {
                      price {
                        amount
                        currencyCode
                      }
                      compareAtPrice {
                        amount
                        currencyCode
                      }
                    }
                  }
                }
                images(first: 2) {
                  edges {
                    node {
                      url
                      altText
                    }
                  }
                }
              }
            }
          }
        }
    `;

  try {
    // Використовуємо fetch-запит для відправлення POST-запиту з GraphQL-запитом
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Встановлюємо заголовки для JSON-запитів
        "X-Shopify-Storefront-Access-Token": "7e174585a317d187255660745da44cc7", // Токен доступу до API Shopify
      },
      // Вміст тіла запиту у форматі JSON
      body: JSON.stringify({ query }),
    });

    // Перевіряємо чи запит успішний ( статус 200)
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    // Перетворюємо дані у формат JSON
    const data = await response.json();
    // Повертаємо продукти з відповіді
    return data.data.products.edges;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error; // Передаємо помилку далі, щоб її можна було обробити в init
  }
}

//Ф-ція для відображення продуктів на сторінці
function renderProducts(products) {
  //Знаходимо контейнер для продуктів у HTML
  const container = document.querySelector(".products");
  container.innerHTML = ""; // Очищуємо вміст контейнера

  // Перебираємо отримані продукти
  products.forEach(({ node }) => {
    const product = node; // беремо дані продукту
    const variant = product.variants.edges[0].node; // Беремо перший варіант продукту
    const images = product.images.edges; // Беремо зображення продукту

    // Створюємо новий елемент продукту
    const productElement = document.createElement("div");
    productElement.className = "products__card"; // Додаємо клас для стилізації

    // Створюємо контейнер зображень для продукту
    const imageContainer = document.createElement("div");
    imageContainer.className = "products__card-image-container";

    // Створюємо головне зображення продукту
    const mainImage = document.createElement("img");
    mainImage.src = images[0].node.url; // Встановлюємо URL зображення
    mainImage.alt = images[0].node.altText || product.title; // Встановлюємо альтернативний текст
    mainImage.className = "products__card-image main-image"; // Клас для стилізації

    // Додаємо головне зображення в контейнер зображення
    imageContainer.appendChild(mainImage);

    // Якщо є більше одного зображення , створюємо друге зображення для hover-ефекту
    if (images.length > 1) {
      const hoverImage = document.createElement("img");
      hoverImage.src = images[1].node.url; // Встановлюємо URL другого зображення
      hoverImage.alt = images[1].node.altText || product.title; // Встановлюємо альтернативний текст
      hoverImage.className = "products__card-image hover-image"; // Клас для стилізації
      imageContainer.appendChild(hoverImage); // Додаємо друге зображення до контейнера
    }

    // Створюємо заголовок продукту
    const title = document.createElement("h3");
    title.className = "products__card-title"; // Клас для стилізації
    title.textContent = product.title; // Текст заголовку продукту

    // Створюємо опис продукту (скорочуємо його до 50 символів)
    const description = document.createElement("p");
    description.className = "products__card-text"; // Клас для стилізації
    description.textContent =
      product.description.substring(0, 50) +
      (product.description.length > 50 ? "..." : "");

    // Отримуємо ціну продукту та можливу знижку
    const compareAtPrice = variant.compareAtPrice
      ? parseFloat(variant.compareAtPrice.amount)
      : null;
    const currentPrice = parseFloat(variant.price.amount);

    // Створюємо елемент для відображення ціни
    const priceElement = document.createElement("div");
    priceElement.className = "products__card-price-container"; // Клас для стилізації

    // Якщо є знижка, відображаємо стару (перекреслену) ціну
    if (compareAtPrice && compareAtPrice > currentPrice) {
      const oldPrice = document.createElement("span");
      oldPrice.className = "products__card-price --dashed"; // Клас для перекресленої ціни
      oldPrice.textContent = formatPrice(
        compareAtPrice,
        variant.price.currencyCode
      );
      priceElement.appendChild(oldPrice);
    }

    // Відображаємо актуальну ціну продукту
    const price = document.createElement("span");
    price.className = "products__card-price"; // Клас для стилізації
    price.textContent = formatPrice(currentPrice, variant.price.currencyCode); // Форматуємо ціну
    priceElement.appendChild(price);

    // Додаємо всі елементи продукту до загального контейнера продукту
    productElement.appendChild(imageContainer);
    productElement.appendChild(title);
    productElement.appendChild(description);
    productElement.appendChild(priceElement);

    // Додаємо продукт до контейнера на сторінці
    container.appendChild(productElement);
  });

  // Додаємо обробники подій для hover ефекту на зображеннях
  addHoverEffect();
}

// Функція для форматування ціни у відповідний формат валют
function formatPrice(amount, currencyCode) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Функція для додавання ефекту зміни зображень при наведенні (hover)
function addHoverEffect() {
  const productCards = document.querySelectorAll(".products__card");
  productCards.forEach((card) => {
    const imageContainer = card.querySelector(
      ".products__card-image-container"
    );
    const mainImage = card.querySelector(".main-image");
    const hoverImage = card.querySelector(".hover-image");

    // Якщо є зображення для hover, додаємо події
    if (hoverImage) {
      // При наведенні на контейнер замінюємо головне зображення на hover
      imageContainer.addEventListener("mouseenter", () => {
        mainImage.style.opacity = "0"; // Зникає головне зображення
        hoverImage.style.opacity = "1"; // Показується hover зображення
      });

      // При відведенні миші повертаємо основне зображення
      imageContainer.addEventListener("mouseleave", () => {
        mainImage.style.opacity = "1"; // Повертається головне зображення
        hoverImage.style.opacity = "0"; // Зникає hover зображення
      });
    }
  });
}

// Головна функція ініціалізації скрипта
async function init() {
  try {
    // Викликаємо функцію для отримання продуктів
    const products = await fetchProducts();
    // Відображаємо продукти на сторінці
    renderProducts(products);
  } catch (error) {
    // Виводимо помилку у випадку невдалої ініціалізації та виводимо повідомлення користувачу
    console.error("Failed to initialize products:", error);
    const container = document.querySelector(".products");
    container.innerHTML =
      "<p>Sorry, we couldn't load the products at this time. Please try again later.</p>";
  }
}

// Викликаємо головну функцію для старту
init();

// Створення акордіону
document.addEventListener("DOMContentLoaded", function () {
  const accordionItems = document.querySelectorAll(".faqs__accordion-item");

  accordionItems.forEach((item) => {
    const header = item.querySelector(".faqs__accordion-item-header");
    const content = item.querySelector(".faqs__accordion-item-content");

    header.addEventListener("click", () => {
      const isActive = item.classList.contains("active");

      // Закриваємо інші вкладки , при кліку на одну вибрану
      accordionItems.forEach((otherItem) => {
        if (otherItem !== item) {
          otherItem.classList.remove("active");
        }
      });

      // Переключення поточного елементу
      if (isActive) {
        item.classList.remove("active");
      } else {
        item.classList.add("active");
      }
    });
  });
});
