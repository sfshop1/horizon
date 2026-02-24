const storefrontAccessToken = '967cf6ccc67894215053bb3f8a0181b4';
const shopDomain = '{{ shop.permanent_domain | default: shop.url }}';

document.addEventListener("DOMContentLoaded", async function () {
  const maxWeight = 15;
  let totalWeight = 0;
  let totalItems = 0;

  // Pull Storefront API token + shop domain from Liquid
  const STOREFRONT_API_TOKEN = document.querySelector(
    '[data-storefront-token]'
  )?.dataset.storefrontToken || "{{ section.settings.storefront_token }}";

  const SHOP_DOMAIN = "{{ section.settings.shop_domain }}";

  const query = `
  {
    products(first: 100) {
      edges {
        node {
          title
          variants(first: 10) {
            edges {
              node {
                id
                title
                sku
                weight
                weightUnit
                sellingPlanAllocations(first: 10) {
                  edges {
                    node {
                      sellingPlan {
                        id
                        name
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }`;

  async function fetchSubscriptionProducts() {
    const response = await fetch(`https://${SHOP_DOMAIN}/api/2024-10/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": STOREFRONT_API_TOKEN
      },
      body: JSON.stringify({ query })
    });

    const json = await response.json();
    return json.data.products.edges;
  }

  function renderSubscriptionItems(products) {
    const container = document.getElementById("subscription-items");
    container.innerHTML = "";

    let index = 0;

    products.forEach(productEdge => {
      const product = productEdge.node;

      product.variants.edges.forEach(variantEdge => {
        const variant = variantEdge.node;

        // Only show variants with selling plans (subscription eligible)
        if (variant.sellingPlanAllocations.edges.length === 0) return;

        const row = document.createElement("tr");
        row.classList.add("builder-row");
        row.dataset.title = product.title;
        row.dataset.sku = variant.sku;
        row.dataset.weight = variant.weight;

        row.innerHTML = `
          <td>${product.title}</td>
          <td>${variant.title}</td>
          <td></td>
          <td>${variant.weight} lb</td>
          <td><button class="qty-minus" data-index="${index}">-</button></td>
          <td>
            <span class="qty-display" id="qty-${index}">0</span>
            <button class="qty-plus" data-index="${index}">+</button>
          </td>
        `;

        container.appendChild(row);
        index++;
      });
    });

    attachQtyListeners();
  }

  function attachQtyListeners() {
    document.querySelectorAll(".qty-plus").forEach(btn => {
      btn.addEventListener("click", function () {
        const index = this.dataset.index;
        const row = document.querySelectorAll(".builder-row")[index];
        const weight = parseFloat(row.dataset.weight);

        if (totalWeight + weight > maxWeight) {
          alert("You cannot exceed 15 lbs.");
          return;
        }

        const qtyDisplay = document.getElementById(`qty-${index}`);
        qtyDisplay.textContent = parseInt(qtyDisplay.textContent) + 1;

        totalItems++;
        totalWeight += weight;

        updateSummary();
      });
    });

    document.querySelectorAll(".qty-minus").forEach(btn => {
      btn.addEventListener("click", function () {
        const index = this.dataset.index;
        const row = document.querySelectorAll(".builder-row")[index];
        const weight = parseFloat(row.dataset.weight);

        const qtyDisplay = document.getElementById(`qty-${index}`);
        const currentQty = parseInt(qtyDisplay.textContent);

        if (currentQty > 0) {
          qtyDisplay.textContent = currentQty - 1;
          totalItems--;
          totalWeight -= weight;
          updateSummary();
        }
      });
    });
  }

  function updateSummary() {
    document.getElementById("total-items").textContent = totalItems;
    document.getElementById("total-weight").textContent = totalWeight.toFixed(2);

    const bundle = [];
    const rows = document.querySelectorAll(".builder-row");

    rows.forEach((row, index) => {
      const qty = parseInt(document.getElementById(`qty-${index}`).textContent);
      if (qty > 0) {
        bundle.push({
          title: row.dataset.title,
          sku: row.dataset.sku,
          qty: qty,
          weight: parseFloat(row.dataset.weight)
        });
      }
    });

    document.getElementById("bundle-json").value = JSON.stringify(bundle);
  }

  document.getElementById("complete-subscription").addEventListener("click", function () {
    const bundleJson = document.getElementById("bundle-json").value;
    console.log("Bundle JSON:", bundleJson);
    alert("This is where your API call will go.");
  });

  // Load products on page load
  const products = await fetchSubscriptionProducts();
  renderSubscriptionItems(products);
});
