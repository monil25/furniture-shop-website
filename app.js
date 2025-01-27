const client = contentful.createClient({
  // This is the space ID. A space is like a project folder in Contentful terms
  space: "emop31kpwz90",
  // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
  accessToken: "Fu1YpqGl7gwIcHobeRjjCEKuoOgokpyWsFv4Haez9Ak"
});

//variables
const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");
//cart
let cart = [];
//buttons
let buttonsDOM = [];
//getting the products
class Products {
  async getProducts() {
    try {

      let contentful = await client.getEntries({
        content_type: 'comfyHouseProducts'
      });

      //console.log(contentful);
      //from below used for products.json local file. 
      // let result = await fetch("products.json");
      // let data = await result.json();
      //let products = data.items;
      let products = contentful.items;
      products = products.map(item => {
        const {
          title,
          price
        } = item.fields;
        const {
          id
        } = item.sys;
        const image = item.fields.image.fields.file.url;
        return {
          title,
          price,
          id,
          image
        };
      });
      return products;
    } catch (error) {
      console.log(error);
    }
  }
}
//display products
class UI {
  displayProducts(products) {
    let result = '';
    products.forEach(product => {
      result += `
      <!-- single product -->
        <article class="product">
          <div class="img-container">
            <img
              src=${product.image} alt="product" class="product-img"
            />
            <button class="bag-btn" data-id=${product.id}>
              <i class="fas fa-shopping-cart"></i>
              add to cart
            </button>
          </div>
          <h3>${product.title}</h3>
          <h4>$${product.price}</h4>
        </article>
        <!-- end of single product -->`;
    });
    productsDOM.innerHTML = result;
  }
  getBagButtons() {
    const buttons = [...document.querySelectorAll(".bag-btn")];
    buttonsDOM = buttons;
    buttons.forEach(button => {
      let id = button.dataset.id;
      let inCart = cart.find(item => item.id === id);
      if (inCart) {
        button.innerText = "In Cart";
        button.disabled = true;
      }
      button.addEventListener('click', event => {
        event.target.innerText = "In Cart";
        event.target.disabled = true;
        //get product from products
        let cartItem = {
          ...Storage.getProduct(id),
          quantity: 1
        };
        //add product to cart
        cart.push(cartItem);
        //save cart in local storage
        Storage.saveCart(cart);
        //set cart item
        this.setCartValues(cart);
        //display cart item
        this.addCartItem(cartItem);
        //show the cart
        this.showCart();
      });
    });
  }
  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map(item => {
      tempTotal += item.price * item.quantity;
      itemsTotal += item.quantity;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
  }
  addCartItem(item) {
    const div = document.createElement('div');
    div.classList.add('cart-item');
    div.innerHTML = `<div class="cart-item">
          <img src=${item.image} alt="product-1" />
          <div>
            <h4>${item.title}</h4>
            <h5>$${item.price}</h5>
            <span class="remove-item" data-id=${item.id}>remove</span>
          </div>
          <div>
            <i class="fas fa-chevron-up" data-id=${item.id}></i>
            <p class="item-amount">${item.quantity}</p>
            <i class="fas fa-chevron-down" data-id=${item.id}></i>
          </div>
        </div>`;
    cartContent.appendChild(div);
  }
  showCart() {
    cartOverlay.classList.add('transparentBcg');
    cartDOM.classList.add('showCart');
  }
  hideCart() {
    cartOverlay.classList.remove('transparentBcg');
    cartDOM.classList.remove('showCart');
  }
  setupAPP() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populateCart(cart);
    cartBtn.addEventListener('click', this.showCart);
    closeCartBtn.addEventListener('click', this.hideCart);
  }
  populateCart(cart) {
    cart.forEach(item => this.addCartItem(item));
  }
  cartLogic() {
    // clearCartBtn.addEventListener('click', this.clearCart);
    //by using the method in comment
    //you will print  clear cart button.<button class="clear-cart banner-btn>clear cart</button>".
    clearCartBtn.addEventListener('click', () => {
      this.clearCart();
    });
    //cart functionality
    cartContent.addEventListener("click", event => {
      if (event.target.classList.contains('remove-item')) {
        let toRemoveItem = event.target;
        let id = toRemoveItem.dataset.id;
        toRemoveItem.parentNode.parentNode.parentNode.removeChild(toRemoveItem.parentNode.parentNode);
        this.removeItem(id);
      } else if (event.target.classList.contains("fa-chevron-up")) {
        let addQuantity = event.target;
        let id = addQuantity.dataset.id;
        let tempItem = cart.find(item => item.id === id)
        if (tempItem.quantity === 10) {
          alert(`Maximum 10 quantity allowed for ${tempItem.title}`);
        } else {
          tempItem.quantity += 1;
          Storage.saveCart(cart);
          this.setCartValues(cart);
          addQuantity.nextElementSibling.innerText = tempItem.quantity;
        }
      } else if (event.target.classList.contains("fa-chevron-down")) {
        let lowerQuantity = event.target;
        let id = lowerQuantity.dataset.id;
        let tempItem = cart.find(item => item.id === id);
        tempItem.quantity -= 1;
        if (tempItem.quantity > 0) {
          Storage.saveCart(cart);
          this.setCartValues(cart);
          lowerQuantity.previousElementSibling.innerText = tempItem.quantity;
        } else {
          lowerQuantity.parentNode.parentNode.parentNode.removeChild(lowerQuantity.parentNode.parentNode);
          this.removeItem(id);
        }

      }
    });
  }
  clearCart() {
    //clear cart button
    let cartItems = cart.map(item => item.id);
    cartItems.forEach(id => this.removeItem(id));
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  }
  removeItem(id) {
    cart = cart.filter(item => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let btn = this.getSingleButton(id);
    btn.disabled = false;
    btn.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`;
  }
  getSingleButton(id) {
    return buttonsDOM.find(button => button.dataset.id === id);
  }
}
//local Storage
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem('products'));
    return products.find(product => product.id === id);
  }
  static saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
  }
  static getCart() {
    return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
  }
}
document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();
  //setup app
  ui.setupAPP();
  //get all products
  products.getProducts().then(products => {
    ui.displayProducts(products);
    Storage.saveProducts(products);
  }).then(() => {
    ui.getBagButtons();
    ui.cartLogic();
  });
});