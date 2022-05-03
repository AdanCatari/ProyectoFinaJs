const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDOM = document.querySelector('.products-center');

let cart = [];
let buttonsDOM = [];

class Products {
  async getProducts() {
    try {
      let result = await fetch('products.json');
      let data = await result.json();
      let products = data.items;
      products = products.map((item) => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;
        return { title, price, id, image };
      });
      return products;
    } catch (error) {
      console.log(error);
    }
  }
}

class UI {
  displayProducts(products) {
    let result = '';
    products.forEach((product) => {
      result += `
      <article class="product">
      <div class="img-container">
        <img
          src=${product.image}
          alt="product-1"
          class="product-img"
        />
        <button class="bag-btn" data-id=${product.id}>
          <i class="fas fa-shopping-cart"></i>
          agregar al carrito
        </button>
      </div>
      <h3>${product.title}</h3>
      <h4>$${product.price}</h4>
    </article>
      `;
    });
    productsDOM.innerHTML = result;
  }
  getBagButtons() {
    const buttons = [...document.querySelectorAll('.bag-btn')];
    buttonsDOM = buttons;
    buttons.forEach((button) => {
      let id = button.dataset.id;
      let inCart = cart.find((item) => item.id === id);
      if (inCart) {
        button.innerText = 'En el carrito';
        button.disabled = true;
      } else {
        button.addEventListener('click', (Event) => {
          Event.target.innerText = 'En el carrito';
          Event.target.disabled = true;
          let cartItem = { ...Storage.getProducts(id), cantidad: 1 };
          cart = [...cart, cartItem];
          Storage.saveCart(cart);
          this.setCartValue(cart);
          this.addCartItem(cartItem);
          this.showCart();
        });
      }
    });
  }
  setCartValue(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map((item) => {
      tempTotal += item.price * item.cantidad;
      itemsTotal += item.cantidad;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
  }
  addCartItem(item) {
    const div = document.createElement('div');
    div.classList.add('cart-item');
    div.innerHTML = `
    <img src="${item.image}" alt="" />
          </div>
          <div>
            <h4>${item.title}</h4>
            <h5>$${item.price}</h5>
            <span class="remove-item" data-id=${item.id}>remover</span>
          </div>
          <div>
            <i class="fas fa-chevron-up" data-id=${item.id}></i>
            <p class="item-amount">${item.cantidad}</p>
            <i class="fas fa-chevron-down" data-id=${item.id}></i>
          </div>
    `;
    cartContent.appendChild(div);
  }
  showCart() {
    cartOverlay.classList.add('transparentBcg');
    cartDOM.classList.add('showCart');
  }
  setupAPP() {
    cart = Storage.getCart();
    this.setCartValue(cart);
    this.populateCart(cart);
    cartBtn.addEventListener('click', this.showCart);
    closeCartBtn.addEventListener('click', this.hiddeCart);
  }
  populateCart(cart) {
    cart.forEach((item) => this.addCartItem(item));
  }
  hiddeCart() {
    cartOverlay.classList.remove('transparentBcg');
    cartDOM.classList.remove('showCart');
  }
  cartLogic() {
    clearCartBtn.addEventListener('click', () => {
      this.clearCart();
    });
    cartContent.addEventListener('click', (Event) => {
      if (Event.target.classList.contains('remove-item')) {
        let removeItem = Event.target;
        let id = removeItem.dataset.id;
        cartContent.removeChild(removeItem.parentElement.parentElement);
        this.removeItem(id);
      } else if (Event.target.classList.contains('fa-chevron-up')) {
        let addAmount = Event.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.cantidad = tempItem.cantidad + 1;
        Storage.saveCart(cart);
        this.setCartValue(cart);
        addAmount.nextElementSibling.innerText = tempItem.cantidad;
      } else if (Event.target.classList.contains('fa-chevron-down')) {
        let lowerAmount = Event.target;
        let id = lowerAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.cantidad = tempItem.cantidad - 1;
        if (tempItem.cantidad > 0) {
          Storage.saveCart(cart);
          this.setCartValue(cart);
          lowerAmount.previousSibling.innerText = tempItem.cantidad;
        } else {
          cartContent.removeChild(lowerAmount.parentElement.parentElement);
          this.removeItem(id);
        }
      }
    });
  }
  clearCart() {
    let cartItems = cart.map((item) => item.id);
    cartItems.forEach((id) => this.removeItem(id));
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hiddeCart();
  }
  removeItem(id) {
    cart = cart.filter((item) => item.id !== id);
    this.setCartValue(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `
    <i class="fas fa-shopping-cart"></i> agregar al carrito
    `;
  }
  getSingleButton(id) {
    return buttonsDOM.find((button) => button.dataset.id === id);
  }
}

class Storage {
  static saveProducts(products) {
    localStorage.setItem('products', JSON.stringify(products));
  }
  static getProducts(id) {
    let products = JSON.parse(localStorage.getItem('products'));
    return products.find((product) => product.id === id);
  }
  static saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
  }
  static getCart() {
    return localStorage.getItem('cart')
      ? JSON.parse(localStorage.getItem('cart'))
      : [];
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const ui = new UI();
  const products = new Products();
  ui.setupAPP();

  products
    .getProducts()
    .then((products) => {
      ui.displayProducts(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      ui.getBagButtons();
      ui.cartLogic();
    });
});
