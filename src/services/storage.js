// function to create random id for each flash card - inspired by
// https://stackoverflow.com/questions/105034/how-to-create-guid-uuid
function id() {
  return "xxxxxxxxxxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// key to identify the collection of cards in the data store
const key = "cards";

const db = {
  create: function(newCard) {
    // Give the new card an id
    let i = id();
    newCard.id = i;

    // Get all the cards
    let allCards = JSON.parse(localStorage.getItem(key)) || {};

    // Add the new card to cards collection
    allCards[i] = newCard;

    // Save the updated cards collection
    localStorage.setItem(key, JSON.stringify(allCards));
  },
  read: function() {
    // Get all the cards
    let allCards = JSON.parse(localStorage.getItem(key)) || {};

    // Return the cards as an array
    return Object.values(allCards);
  },
  update: function(id, newData) {
    // Get all the cards
    let allCards = JSON.parse(localStorage.getItem(key)) || {};

    // Update the specific card with the new data
    allCards[id] = { ...allCards[id], ...newData };

    // Save the updated cards collection
    localStorage.setItem(key, JSON.stringify(allCards));
  },
  delete: function(id) {
    // Get all the cards
    let allCards = JSON.parse(localStorage.getItem(key)) || {};

    // delete the card from the cards collection
    delete allCards[id];

    // Save the updated cards collection
    localStorage.setItem(key, JSON.stringify(allCards));
  }
};

export { db };