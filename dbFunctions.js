const Database = require('better-sqlite3');
const db = new Database('flashcards.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS cards (
    noteid        INTEGER PRIMARY KEY AUTOINCREMENT,
    question  TEXT NOT NULL,
    answer    TEXT NOT NULL,
    deckName      TEXT DEFAULT 'default',
    known     INTEGER DEFAULT 0
  )
`);

//deck names for organization and known has three values: 0, 1 and 2, would be visible in quiz mode



//the functions I will be using, basic crud and just a quiz mode + deck separation


function getAllCards(deck) {
  if (deck) {
    return db.prepare('SELECT * FROM cards WHERE deck = ?').all(deck);
  }
  return db.prepare('SELECT * FROM cards').all();
}

function getCard(id) {
  return db.prepare('SELECT * FROM cards WHERE id = ?').get(id);
}



function createCard(question, answer, deck = 'default') {
  const stmt = db.prepare('INSERT INTO cards (question, answer, deck) VALUES (?, ?, ?)');
  const result = stmt.run(question, answer, deck);
  return getCard(result.lastInsertRowid); 
}

function updateCard(id, fields) {

    
  const allowed = ['question', 'answer', 'deck', 'known'];
  const updates = Object.keys(fields).filter(k => allowed.includes(k)); 
  //can't let a request update id or something illegal
  
  if (updates.length === 0) return getCard(id);  
  
  const sql = `UPDATE cards SET ${updates.map(k => `${k} = ?`).join(', ')} WHERE id = ?`;
  const values = [...updates.map(k => fields[k]), id];
  db.prepare(sql).run(...values);
  return getCard(id);  // return updated card
}

function deleteCard(id) {
  db.prepare('DELETE FROM cards WHERE id = ?').run(id);
}

module.exports = { getAllCards, getCard, createCard, updateCard, deleteCard };