/****************** STORAGE CONTROLLER - encapsulate operation with local storage ********************/
const StorageCtr = (function () {
    
    // Public methods
    return {
        storeItem: function (item) {
            let items = localStorage.getItem('items') !== null ? JSON.parse(localStorage.getItem('items')) : [];
            items.push(item);
            localStorage.setItem('items', JSON.stringify(items));
        },
        getItemsFromStorage: function () {
            return localStorage.getItem('items') === null ? [] : JSON.parse(localStorage.getItem('items'));
        },
        updateItemStorage: function (updatedItem) {
            let items = this.getItemsFromStorage();
            items.forEach((item, index) => {
                if (updatedItem.id === item.id) {
                    items.splice(index, 1, updatedItem);
                }
            });
            localStorage.setItem('items', JSON.stringify(items));
        },
        deleteItemFromStorage: function (id) {
            let items = this.getItemsFromStorage();
            items = items.filter(item => item.id !== id);
            localStorage.setItem('items', JSON.stringify(items));
        },
        clearItemsFromStorage: function () {
            localStorage.removeItem('items');
        }
    };
})();

/****************** ITEM CONTROLLER - encapsulate CRUD operations with items(meals) *************/
const ItemCtrl = (function () {
    // Item constructor
    const Item = function (id, name, calories) {
        this.id = id;
        this.name = name;
        this.calories = calories;
    };

    // Data Structure / State
    const data = {
        // items: [
        //     // { id: 0, name: 'Steak Dinner', calories: 1200 },
        //     // { id: 1, name: 'Cookie', calories: 400 },
        //     // { id: 2, name: 'Eggs', calories: 300 },
        // ],
        items: StorageCtr.getItemsFromStorage(), // TODO: maybe should pass StorageCtrl as argument in IFI CALL ???
        currentItem: null,
        totalCalories: 0
    };

    // Public methods
    return {
        getItems: function () {
            return data.items
        },
        addItem: function (name, calories) {
            let ID;
            // Create ID
            if (data.items.length > 0) {
                ID = data.items[data.items.length - 1].id + 1;
            } else {
                ID = 0;
            }

            // Calories to number;
            calories = parseInt(calories);

            // Create new item
            const newItem = new Item(ID, name, calories);

            // Add new item to items array
            data.items.push(newItem);

            return newItem;
        },
        getItemById: function (id) {
            let found = null;
            data.items.forEach(item => {
                if (item.id === id) {
                    found = item;
                }
            });
            return found;
        },
        updateItem: function (name, calories) {
            calories = parseInt(calories);

            let found = null;
            data.items.forEach(item => {
                if (item.id === data.currentItem.id) {
                    item.name = name;
                    item.calories = calories;
                    found = item;
                }
            });
            return found;
        },
        deleteItem: function (id) {
            // Get ids
            const ids = data.items.map(item => item.id);
            // Get index
            const index = ids.indexOf(id);
            // Remove item
            data.items.splice(index, 1);
        },
        clearAllItems: function () {
            data.items = [];
        },
        setCurrentItem: function (item) {
            data.currentItem = item;
        },
        getCurrentItem() {
            return data.currentItem;
        },
        getTotalCalories: function () {
            let total = 0;

            data.items.forEach(item => total += item.calories);

            // Set total calories in data structure
            data.totalCalories = total;

            return data.totalCalories;
        }
    }
})();

/****************** UI CONTROLLER - encapsulate manipulations with UI of the applications ***************/
const UICtrl = (function () {
    // Contains selectors for ui elements (kind like enum :))
    const UISelectors = {
        itemList: '#item-list',
        listItems: '#item-list li',
        addBtn: '.add-btn',
        updateBtn: '.update-btn',
        deleteBtn: '.delete-btn',
        clearBtn: '.clear-btn',
        backBtn: '.back-btn',
        itemNameInput: '#item-name',
        itemCaloriesInput: '#item-calories',
        totalCalories: '.total-calories'
    };

    // Public methods
    return {
        populateItemList: function (items) {
            let html = '';
            items.forEach(item => {
                html += `<li class="collection-item" id="item-${item.id}">
                            <strong>${item.name}: </strong> <em>${item.calories} Calories</em>
                            <a href="#" class="secondary-content">
                                 <i class="edit-item fa fa-pencil"></i>
                            </a>
                        </li>`;
            });
            // Insert list items
            document.querySelector(UISelectors.itemList).innerHTML = html;
        },
        getItemInput: function () {
            return {
                name: document.querySelector(UISelectors.itemNameInput).value,
                calories: document.querySelector(UISelectors.itemCaloriesInput).value,
            }
        },
        addListItem: function (item) {
            // Show the list
            document.querySelector(UISelectors.itemList).style.display = 'block';
            // Create li element
            const li = document.createElement('li');
            // Add class
            li.className = 'collection-item';
            // Add id
            li.id = `item-${item.id}`;
            // Add HTML
            li.innerHTML = `<strong>${item.name}: </strong> <em>${item.calories} Calories</em>
                            <a href="#" class="secondary-content">
                                 <i class="edit-item fa fa-pencil"></i>
                            </a>`;
            // Insert item into item list at the and
            document.querySelector(UISelectors.itemList).insertAdjacentElement('beforeend', li);
        },
        updateListItem: function (item) {
            // Retrieve all list items from the DOM as NodeList
            let listItems = document.querySelectorAll(UISelectors.listItems);
            // Turn NodeList into array
            listItems = Array.from(listItems);

            listItems.forEach(listItem => {
                const itemId = listItem.getAttribute('id');

                if (itemId === `item-${item.id}`) {
                    document.querySelector(`#${itemId}`).innerHTML =
                        `<strong>${item.name}: </strong> <em>${item.calories} Calories</em>
                            <a href="#" class="secondary-content">
                                 <i class="edit-item fa fa-pencil"></i>
                            </a>`;
                }
            });
        },
        deleteListItem: function (id) {
            const itemId = `#item-${id}`;
            const item = document.querySelector(itemId);
            item.remove();
        },
        clearInput: function () {
            document.querySelector(UISelectors.itemNameInput).value = '';
            document.querySelector(UISelectors.itemCaloriesInput).value = '';
        },
        addItemToForm: function () {
            document.querySelector(UISelectors.itemNameInput).value = ItemCtrl.getCurrentItem().name;
            document.querySelector(UISelectors.itemCaloriesInput).value = ItemCtrl.getCurrentItem().calories;
            this.showEditState();
        },
        removeItems: function () {
            let listItems = document.querySelectorAll(UISelectors.listItems);

            // Turn NodeList into array
            listItems = Array.from(listItems);
            // Remove each item from the list
            listItems.forEach(item => item.remove());
        },
        hideList: function () {
            document.querySelector(UISelectors.itemList).style.display = 'none';
        },
        showTotalCalories: function (totalCalories) {
            document.querySelector(UISelectors.totalCalories).textContent = totalCalories;
        },
        clearEditState: function () {
            this.clearInput();
            document.querySelector(UISelectors.updateBtn).style.display = 'none';
            document.querySelector(UISelectors.deleteBtn).style.display = 'none';
            document.querySelector(UISelectors.backBtn).style.display = 'none';
            document.querySelector(UISelectors.addBtn).style.display = 'inline';
        },
        showEditState: function () {
            document.querySelector(UISelectors.updateBtn).style.display = 'inline';
            document.querySelector(UISelectors.deleteBtn).style.display = 'inline';
            document.querySelector(UISelectors.backBtn).style.display = 'inline';
            document.querySelector(UISelectors.addBtn).style.display = 'none';
        },
        getSelectors: function () {
            return UISelectors;
        }
    }

})();

/****** APPLICATION CONTROLLER - main controller: servers as mediator between other controllers *******/
const App = (function (ItemCtrl, StorageCtr, UICtrl) {
    // Load event listeners
    const loadEventListeners = function () {
        // Get UI Selectors
        const UISelectors = UICtrl.getSelectors();

        // Add item event
        document.querySelector(UISelectors.addBtn).addEventListener('click', itemAddSubmit);

        // Disable submit on 'enter' keypress
        document.addEventListener('keypress', (e) => {
            if (e.keyCode === 13 || e.which === 13) {
                e.preventDefault();
                return false;
            }
        });

        // Edit icon click event
        document.querySelector(UISelectors.itemList).addEventListener('click', itemEditClick);

        // Update item event
        document.querySelector(UISelectors.updateBtn).addEventListener('click', itemUpdateSubmit);

        // Delete item event
        document.querySelector(UISelectors.deleteBtn).addEventListener('click', itemDeleteSubmit);

        // Back button event
        document.querySelector(UISelectors.backBtn).addEventListener('click', itemBackSubmit);

        // Clear All button event
        document.querySelector(UISelectors.clearBtn).addEventListener('click', clearAllItemsClick);

    };

    /********** Event listener's handler functions ****************/

    // Handler for 'add meal' button click event
    const itemAddSubmit = function (e) {
        // Get form input from UI Controller
        const input = UICtrl.getItemInput();

        // Check for name and calories input
        if (input.name !== '' && input.calories !== '' && !isNaN(input.calories)) {
            // Add item
            const newItem = ItemCtrl.addItem(input.name, input.calories);
            // Add newly create item to UI list
            UICtrl.addListItem(newItem);

            // Get total calories
            const totalCalories = ItemCtrl.getTotalCalories();
            // Add total calories to UI
            UICtrl.showTotalCalories(totalCalories);

            // Store in localStorage
            StorageCtr.storeItem(newItem);
        }
        // Clear input fields
        UICtrl.clearInput();

        e.preventDefault();
    };

    // Handler for 'edit' button click event
    const itemEditClick = function (e) {
        if (e.target.classList.contains('edit-item')) {
            // Get list item id (item-0,...)
            const listId = e.target.parentNode.parentNode.id;

            // Break into an array
            const listIdArr = listId.split('-');
            // Get the actual item id
            const id = parseInt(listIdArr[1]);

            // Get item
            const itemToEdit = ItemCtrl.getItemById(id);

            // Set as current item
            ItemCtrl.setCurrentItem(itemToEdit);

            // Add item to form for editing
            UICtrl.addItemToForm();
        }

        e.preventDefault();
    };

    // Handler for 'update meal' button click event
    const itemUpdateSubmit = function (e) {
        // Get item input
        const input = UICtrl.getItemInput();

        // Update item
        const updatedItem = ItemCtrl.updateItem(input.name, input.calories);

        // Update UI
        UICtrl.updateListItem(updatedItem);

        // Get total calories
        const totalCalories = ItemCtrl.getTotalCalories();
        // Add total calories to UI
        UICtrl.showTotalCalories(totalCalories);

        // Update localStorage
        StorageCtr.updateItemStorage(updatedItem);

        // Change state from edit to initial
        UICtrl.clearEditState();

        e.preventDefault();
    };

    // Handler for back button click
    const itemBackSubmit = function (e) {
        UICtrl.clearEditState();
        e.preventDefault();
    };

    // Handler for delete button click event
    const itemDeleteSubmit = function (e) {
        // Get current item
        const currentItem = ItemCtrl.getCurrentItem();

        // Delete from data structure
        ItemCtrl.deleteItem(currentItem.id);

        // Delete from UI
        UICtrl.deleteListItem(currentItem.id);
        // Get total calories
        const totalCalories = ItemCtrl.getTotalCalories();
        // Add total calories to UI
        UICtrl.showTotalCalories(totalCalories);

        // Delete item from localStorage
        StorageCtr.deleteItemFromStorage(currentItem.id);

        // Change state from edit to initial
        UICtrl.clearEditState();

        e.preventDefault();
    };

    // Handler for Clear All button click event
    const clearAllItemsClick = function (e) {
        // Delete all items from data structure
        ItemCtrl.clearAllItems();

        // Get total calories
        const totalCalories = ItemCtrl.getTotalCalories();
        // Add total calories to UI
        UICtrl.showTotalCalories(totalCalories);

        // Remove from UI
        UICtrl.removeItems();

        // Clear from localStorage
        StorageCtr.clearItemsFromStorage();

        // Hide UL
        UICtrl.hideList();

        e.preventDefault();
    };


    // Public methods
    return {
        init: function () {
            // Clear edit state / set initial state
            UICtrl.clearEditState();

            // Fetch items from data structure
            const items = ItemCtrl.getItems();

            // Check if any items
            if (items.length === 0) {
                // Hide empty list from DOM
                UICtrl.hideList();
            } else {
                // Populate list with items
                UICtrl.populateItemList(items);
            }

            // Get total calories
            const totalCalories = ItemCtrl.getTotalCalories();
            // Add total calories to UI
            UICtrl.showTotalCalories(totalCalories);

            // Load event listeners
            loadEventListeners();
        }
    }

})(ItemCtrl, StorageCtr, UICtrl);

App.init();