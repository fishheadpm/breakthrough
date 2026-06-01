let data = [];
let currentRound = null;
let queue = [];
let index = 0;
let history = {};

const STORAGE_PREFIX = 'breakthrough';

fetch('data.json?v=2')
  .then(res => res.json())
  .then(json => {
    data = json;
    currentRound = data[0] || null;
    renderRoundButtons();
    updateSelectedRoundLabel();
  })
  .catch(err => {
    console.error(err);
    alert('data.jsonの読み込みに失敗しました');
  });

function renderRoundButtons() {
  const area = document.getElementById('roundButtons');
  area.innerHTML = '';

  data.forEach(round => {
    const button = document.createElement('button');
    button.textContent = round.name || round.id;
    button.onclick = () => selectRound(round.id);
    button.className = currentRound && currentRound.id === round.id ? 'round-button selected' : 'round-button';
    area.appendChild(button);
  });
}

function selectRound(roundId) {
  const round = data.find(r => r.id === roundId);
  if (!round) {
    alert('選択した回が見つかりません');
    return;
  }

  currentRound = round;
  queue = [];
  index = 0;
  history = loadHistory();
  renderRoundButtons();
  updateSelectedRoundLabel();
}

function updateSelectedRoundLabel() {
  document.getElementById('selectedRoundLabel').textContent =
    currentRound ? `選択中：${currentRound.name || currentRound.id}` : '回が選択されていません';
}

function start() {
  if (!currentRound) {
    alert('回を選択してください');
    return;
  }

  queue = shuffle(currentRound.questions.map(q => q.id));
  index = 0;
  history = loadHistory();
  save();
  next();
}

function continueGame() {
  if (!currentRound) {
    alert('回を選択してください');
    return;
  }

  load();
  next();
}

function next() {
  if (!currentRound) {
    alert('回を選択してください');
    return;
  }

  if (index >= queue.length) {
    alert('終了');
    backToMenu();
    return;
  }

  const q = getQ();
  if (!q) {
    alert('問題データが見つかりません。最初からやり直してください。');
    backToMenu();
    return;
  }

  document.getElementById('roundTitle').textContent = currentRound.name || currentRound.id;

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
  if (!q) return;

  document.getElementById('answer').textContent = q.english;
  document.getElementById('answerArea').classList.remove('hidden');
}

function correct() {
  index++;
  save();
  next();
}

function wrong() {
  const q = getQ();
  if (!q) return;

  const id = q.id;
  history[id] = (history[id] || 0) + 1;

  queue.push(id);
  index++;

  save();
  next();
}

function getQ() {
  return currentRound.questions.find(q => q.id === queue[index]);
}

function getProgressKey() {
  return `${STORAGE_PREFIX}_${currentRound.id}_progress`;
}

function getHistoryKey() {
  return `${STORAGE_PREFIX}_${currentRound.id}_history`;
}

function save() {
  localStorage.setItem(getProgressKey(), JSON.stringify({ queue, index }));
  localStorage.setItem(getHistoryKey(), JSON.stringify(history));
}

function load() {
  const p = JSON.parse(localStorage.getItem(getProgressKey()));
  history = loadHistory();

  if (p && Array.isArray(p.queue) && p.queue.length > 0) {
    queue = p.queue;
    index = p.index || 0;
  } else {
    start();
  }
}

function loadHistory() {
  return JSON.parse(localStorage.getItem(getHistoryKey())) || {};
}

function resetHistory() {
  if (!currentRound) {
    alert('回を選択してください');
    return;
  }

  localStorage.removeItem(getProgressKey());
  localStorage.removeItem(getHistoryKey());
  history = {};
  alert(`${currentRound.name || currentRound.id} の履歴をリセットしました`);
}

function showHistory() {
  if (!currentRound) {
    alert('回を選択してください');
    return;
  }

  history = loadHistory();

  let text = '';

  for (let id in history) {
    const q = currentRound.questions.find(q => q.id === id);
    if (!q) continue;
    text += `${q.japanese}\n${q.english}\n間違い回数:${history[id]}\n\n`;
  }

  alert(text || '履歴なし');
}

function backToMenu() {
  document.getElementById('quizScreen').classList.add('hidden');
  document.getElementById('menuScreen').classList.remove('hidden');
  renderRoundButtons();
  updateSelectedRoundLabel();
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}
