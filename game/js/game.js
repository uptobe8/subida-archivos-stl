let data, currentSector, missionIndex = 0, score = 0;
const badges = new Set();

const menuScreen = document.getElementById('menu-screen');
const gameScreen = document.getElementById('game-screen');
const resultScreen = document.getElementById('result-screen');
const sectorList = document.getElementById('sector-list');
const missionTitle = document.getElementById('mission-title');
const missionDescription = document.getElementById('mission-description');
const optionsEl = document.getElementById('options');
const feedbackEl = document.getElementById('feedback');
const nextBtn = document.getElementById('next-btn');
const hudSector = document.getElementById('hud-sector');
const hudScore = document.getElementById('hud-score');
const hudLevel = document.getElementById('hud-level');

function levelName() {
  return [...data.levels].reverse().find(l => score >= l.minScore).name;
}

function updateHud() {
  hudScore.textContent = `Puntos: ${score}`;
  hudLevel.textContent = `Nivel: ${levelName()}`;
}

function renderMission() {
  const mission = currentSector.missions[missionIndex];
  missionTitle.textContent = `${missionIndex + 1}. ${mission.title}`;
  missionDescription.textContent = mission.question;
  optionsEl.innerHTML = '';
  feedbackEl.textContent = '';
  nextBtn.classList.add('hidden');

  mission.options.forEach((opt, i) => {
    const b = document.createElement('button');
    b.className = 'option-btn';
    b.textContent = opt;
    b.onclick = () => selectOption(i, b);
    optionsEl.appendChild(b);
  });
}

function selectOption(index, button) {
  const mission = currentSector.missions[missionIndex];
  const buttons = [...document.querySelectorAll('.option-btn')];
  buttons.forEach(b => b.disabled = true);

  if (index === mission.correct) {
    score += 100;
    button.classList.add('correct');
    feedbackEl.textContent = `✅ Correcto. ${mission.feedback}`;
    if (missionIndex === 0) badges.add('Selector de Canales');
    if (missionIndex === 1) badges.add('Automatizador');
    if (missionIndex === 2) badges.add('Conversión Efectiva');
    if (missionIndex === 3) badges.add('IA Responsable');
  } else {
    score += 25;
    button.classList.add('wrong');
    buttons[mission.correct].classList.add('correct');
    feedbackEl.textContent = `❌ Respuesta no óptima. ${mission.feedback}`;
  }

  updateHud();
  nextBtn.classList.remove('hidden');
}

function finishGame() {
  gameScreen.classList.add('hidden');
  resultScreen.classList.remove('hidden');
  document.getElementById('final-score').textContent = `Puntuación final: ${score}`;
  document.getElementById('final-level').textContent = `Nivel alcanzado: ${levelName()}`;
  const ul = document.getElementById('badges');
  ul.innerHTML = '';
  [...badges].forEach(b => {
    const li = document.createElement('li');
    li.textContent = b;
    ul.appendChild(li);
  });
}

nextBtn.onclick = () => {
  missionIndex += 1;
  if (missionIndex >= currentSector.missions.length) finishGame(); else renderMission();
};

document.getElementById('restart-btn').onclick = () => location.reload();

fetch('data/plan_data.json')
  .then(r => r.json())
  .then(json => {
    data = json;
    data.sectors.forEach(s => {
      const b = document.createElement('button');
      b.textContent = s.name;
      b.onclick = () => {
        currentSector = s;
        missionIndex = 0;
        score = 0;
        menuScreen.classList.add('hidden');
        resultScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        hudSector.textContent = `Sector: ${s.name}`;
        updateHud();
        renderMission();
      };
      sectorList.appendChild(b);
    });
  });
