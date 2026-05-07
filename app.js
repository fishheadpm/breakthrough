let data = [];
let currentRound = null;
let queue = [];
let index = 0;
let history = {};

fetch('data.json?v=1')
  .then(res => res.json())
  .then(json => {
    data = json;
    currentRound = data[0];
  });

function start() {
  queue = shuffle(currentRound.questions.map(q => q.id));
  index = 0;
  save();
  next();
}

function continueGame() {
  load();
  next();
}

function next() {
  if (index >= queue.length) {
    alert('終了');
    return;
  }

  const q = getQ();

  document.getElementById('progress').textContent =
    `${index + 1} / ${queue.length}`;

  document.getElementById('question').textContent =
    q.japanese;

  document.getElementById('answerArea').classList.add('hidden');

  document.getElementById('menuScreen').classList.add('hidden');
  document.getElementById('quizScreen').classList.remove('hidden');
}

function showAnswer() {
  const q = getQ();
  document.getElementById('answer').textContent = q.english;
  document.getElementById('answerArea').classList.remove('hidden');
}

function correct() {
  index++;
  save();
  next();
}

function wrong() {
  const id = getQ().id;

  history[id] = (history[id] || 0) + 1;

  queue.push(id);
  index++;

  save();
  next();
}

function getQ() {
  return currentRound.questions.find(q => q.id === queue[index]);
}

function save() {
  localStorage.setItem('breakthrough1_progress', JSON.stringify({ queue, index }));
  localStorage.setItem('breakthrough1_history', JSON.stringify(history));
}

function load() {
  const p = JSON.parse(localStorage.getItem('breakthrough1_progress'));
  history = JSON.parse(localStorage.getItem('breakthrough1_history')) || {};

  if (p) {
    queue = p.queue;
    index = p.index;
  } else {
    start();
  }
}

function resetHistory() {
  localStorage.removeItem('breakthrough1_progress');
  localStorage.removeItem('breakthrough1_history');
  alert('リセットしました');
}

function showHistory() {
  history = JSON.parse(localStorage.getItem('breakthrough1_history')) || {};

  let text = '';

  for (let id in history) {
    const q = currentRound.questions.find(q => q.id === id);
    text += `${q.japanese}\n間違い回数:${history[id]}\n\n`;
  }

  alert(text || '履歴なし');
}

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}
