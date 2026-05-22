//small app so not using express, learning pure node too along the way

const http = require('http');
const fs   = require('fs');
const path = require('path');
const db   = require('./dbFunctions');

const PORT = 3500;


//some helpers

function sendJSON(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => resolve(body ? JSON.parse(body) : {}));
  });
}



//server basic routing and functions for this small app

const server = http.createServer(async (req, res) => {
  const { method, url } = req;


  //express would be easier, but i am just practicing simple node for this assignment
  //will find the method and its path to route

  
  if (method === 'GET' && url.startsWith('/api/cards')) {
    const deck = new URL(url, 'http://x').searchParams.get('deck');
    return sendJSON(res, 200, db.getAllCards(deck));
  }

  
  if (method === 'POST' && url === '/api/cards') {
    const body = await readBody(req);
    if (!body.question || !body.answer) {
      return sendJSON(res, 400, { error: 'question and answer are required' }); //the flashcards are for a quiz app
    }
    const card = db.createCard(body.question, body.answer, body.deck);
    return sendJSON(res, 201, card);
  }
  

  if (method === 'PATCH' && url.startsWith('/api/cards/')) {
    const id   = parseInt(url.split('/')[3]);
    const body = await readBody(req);
    const card = db.updateCard(id, body);
    return sendJSON(res, 200, card);
  }

  
  if (method === 'DELETE' && url.startsWith('/api/cards/')) {
    const id = parseInt(url.split('/')[3]);
    db.deleteCard(id);
    return sendJSON(res, 200, { deleted: id });
  }

  
  sendJSON(res, 404, { error: 'action not supported yet :)' });
});


//server listening here
server.listen(PORT, () => {
  console.log(`Flashcards running at http://localhost:${PORT}`);
});