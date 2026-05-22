// state 
let allCards   = [];
let quizCards  = [];
let quizIndex  = 0;
let quizKnown  = 0;

// DOM refs
const views = {
  list: document.getElementById('view-list'),
  form: document.getElementById('view-form'),
  quiz: document.getElementById('view-quiz'),
};

const navBtns = {
  view: document.getElementById('btn-view'),
  add:  document.getElementById('btn-add'),
  quiz: document.getElementById('btn-quiz'),
};

// view switching
function showView(name) {
  Object.values(views).forEach(v => v.classList.add('hidden'));
  Object.values(navBtns).forEach(b => b.classList.remove('active'));
  views[name].classList.remove('hidden');
  if (name === 'list') { navBtns.view.classList.add('active'); loadCards(); }
  if (name === 'form') { navBtns.add.classList.add('active'); }
  if (name === 'quiz') { navBtns.quiz.classList.add('active'); }
}

navBtns.view.addEventListener('click', () => showView('list'));
navBtns.quiz.addEventListener('click', () => showView('quiz'));
navBtns.add.addEventListener('click',  () => {
  clearForm();
  showView('form');
});

//  API helpers 
async function api(method, path, body) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const res  = await fetch(path, opts);
  return res.json();
}

//  card list 
async function loadCards(deck) {
  const url   = deck ? `/api/cards?deck=${encodeURIComponent(deck)}` : '/api/cards';
  allCards    = await api('GET', url);
  renderCards(allCards);
}

function renderCards(cards) {
  const list = document.getElementById('card-list');

  if (cards.length === 0) {
    list.innerHTML = '<div class="empty-state">No cards yet. Add one above.</div>';
    return;
  }

  list.innerHTML = cards.map(c => {
    const badgeHTML = c.known === 1
      ? '<span class="known-badge known">known</span>'
      : c.known === 2
      ? '<span class="known-badge learning">learning</span>'
      : '';

    return `
      <div class="card-row" data-id="${c.id}">
        <div class="card-q">
          ${escHtml(c.question)}
          <div class="card-deck">${escHtml(c.deck)}</div>
        </div>
        <div class="card-a">
          ${escHtml(c.answer)}
          ${badgeHTML}
        </div>
        <div class="card-actions">
          <button onclick="editCard(${c.id})">Edit</button>
          <button class="del" onclick="deleteCard(${c.id})">Delete</button>
        </div>
      </div>`;
  }).join('');
}

document.getElementById('btn-filter').addEventListener('click', () => {
  const deck = document.getElementById('filter-deck').value.trim();
  loadCards(deck || null);
});

//  add / edit form 
function clearForm() {
  document.getElementById('edit-id').value        = '';
  document.getElementById('input-question').value = '';
  document.getElementById('input-answer').value   = '';
  document.getElementById('input-deck').value     = '';
  document.getElementById('form-title').textContent = 'Add Card';
}

function editCard(id) {
  const card = allCards.find(c => c.id === id);
  if (!card) return;
  document.getElementById('edit-id').value        = card.id;
  document.getElementById('input-question').value = card.question;
  document.getElementById('input-answer').value   = card.answer;
  document.getElementById('input-deck').value     = card.deck;
  document.getElementById('form-title').textContent = 'Edit Card';
  showView('form');
}

document.getElementById('btn-save').addEventListener('click', async () => {
  const id       = document.getElementById('edit-id').value;
  const question = document.getElementById('input-question').value.trim();
  const answer   = document.getElementById('input-answer').value.trim();
  const deck     = document.getElementById('input-deck').value.trim() || 'default';

  if (!question || !answer) {
    alert('Question and answer cannot be empty.');
    return;
  }

  if (id) {
    await api('PATCH', `/api/cards/${id}`, { question, answer, deck });
  } else {
    await api('POST', '/api/cards', { question, answer, deck });
  }

  showView('list');
});

document.getElementById('btn-cancel').addEventListener('click', () => showView('list'));

async function deleteCard(id) {
  if (!confirm('Delete this card?')) return;
  await api('DELETE', `/api/cards/${id}`);
  loadCards();
}

//  quiz mode 
document.getElementById('btn-start-quiz').addEventListener('click', async () => {
  const deck = document.getElementById('quiz-deck').value.trim();
  const url  = deck ? `/api/cards?deck=${encodeURIComponent(deck)}` : '/api/cards';
  quizCards  = await api('GET', url);

  if (quizCards.length === 0) {
    alert('No cards to quiz on.');
    return;
  }

  // shuffle
  quizCards  = quizCards.sort(() => Math.random() - 0.5);
  quizIndex  = 0;
  quizKnown  = 0;

  document.getElementById('quiz-done').classList.add('hidden');
  document.getElementById('quiz-card').classList.remove('hidden');
  showQuizCard();
});

function showQuizCard() {
  const card = quizCards[quizIndex];
  document.getElementById('quiz-question').textContent = card.question;
  document.getElementById('quiz-answer').textContent   = card.answer;
  document.getElementById('quiz-answer').classList.add('hidden');
  document.getElementById('quiz-feedback').classList.add('hidden');
  document.getElementById('btn-reveal').classList.remove('hidden');
}

document.getElementById('btn-reveal').addEventListener('click', () => {
  document.getElementById('quiz-answer').classList.remove('hidden');
  document.getElementById('quiz-feedback').classList.remove('hidden');
  document.getElementById('btn-reveal').classList.add('hidden');
});

async function quizAdvance(known) {
  const card = quizCards[quizIndex];
  // persist the known flag back to the db
  await api('PATCH', `/api/cards/${card.id}`, { known: known ? 1 : 2 });

  if (known) quizKnown++;
  quizIndex++;

  if (quizIndex >= quizCards.length) {
    document.getElementById('quiz-card').classList.add('hidden');
    document.getElementById('quiz-done').classList.remove('hidden');
    document.getElementById('quiz-score').textContent =
      `You knew ${quizKnown} out of ${quizCards.length} cards.`;
    return;
  }
  showQuizCard();
}

document.getElementById('btn-known').addEventListener('click',   () => quizAdvance(true));
document.getElementById('btn-unknown').addEventListener('click', () => quizAdvance(false));

document.getElementById('btn-quiz-again').addEventListener('click', () => {
  quizCards = quizCards.sort(() => Math.random() - 0.5);
  quizIndex = 0;
  quizKnown = 0;
  document.getElementById('quiz-done').classList.add('hidden');
  document.getElementById('quiz-card').classList.remove('hidden');
  showQuizCard();
});

//  safety helper 
// prevents html injection if someone types <script> in a card
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

//  init 
showView('list');