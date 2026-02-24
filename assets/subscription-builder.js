const storefrontAccessToken = '967cf6ccc67894215053bb3f8a0181b4';
const shopDomain = '{{ shop.permanent_domain | default: shop.url }}';

document.addEventListener("DOMContentLoaded", function () {
  const maxWeight = 15;
  let totalWeight = 0;
  let totalItems = 0;

  const rows = document.querySelectorAll(".builder-row");

  function updateSummary() {
    document.getElementById("total-items").textContent = totalItems;
    document.getElementById("total-weight").textContent = totalWeight.toFixed(2);

    const bundle = [];

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

  document.querySelectorAll(".qty-plus").forEach(btn => {
    btn.addEventListener("click", function () {
      const index = this.dataset.index;
      const row = rows[index];
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
      const row = rows[index];
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

  document.getElementById("complete-subscription").addEventListener("click", function () {
    const bundleJson = document.getElementById("bundle-json").value;

    console.log("Bundle JSON:", bundleJson);

    alert("This is where your API call will go.");
  });
});
