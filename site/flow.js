(() => {
  'use strict';

  const STORAGE_KEY = 'amigoinvisible-2026-juego-v1';
  const $ = (id) => document.getElementById(id);
  const panels = ['setupPanel', 'selectPanel', 'privacyPanel', 'giftPanel', 'resultPanel', 'finishPanel'];
  let game = null;
  let selectedIndex = null;
  let corruptStorage = false;

  function normalizeName(name) {
    return name.trim().replace(/\s+/g, ' ');
  }

  function validateGame(value) {
    if (!value || value.version !== 1 || !Array.isArray(value.names) || !Array.isArray(value.assignments) || !Array.isArray(value.completed)) return false;
    const n = value.names.length;
    if (n < 2 || n > 80 || value.assignments.length !== n || value.completed.length !== n) return false;
    if (value.names.some(name => typeof name !== 'string' || !name.trim() || name.length > 80)) return false;
    if (new Set(value.names.map(name => name.toLocaleLowerCase('es'))).size !== n) return false;
    if (value.completed.some(value => typeof value !== 'boolean')) return false;
    const recipients = new Set();
    for (let i = 0; i < n; i++) {
      const assigned = value.assignments[i];
      if (!Number.isInteger(assigned) || assigned < 0 || assigned >= n || assigned === i || recipients.has(assigned)) return false;
      recipients.add(assigned);
    }
    return true;
  }

  function restore() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!validateGame(parsed)) throw new Error('Estado guardado inválido');
      return parsed;
    } catch (_) {
      corruptStorage = true;
      $('storageWarning').hidden = false;
      $('startBtn').disabled = true;
      return null;
    }
  }

  function save(nextGame) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextGame));
      return true;
    } catch (_) {
      return false;
    }
  }

  // Usa aleatoriedad del navegador y evita sesgos del módulo.
  function randomInteger(max) {
    const limit = Math.floor(4294967296 / max) * max;
    const buffer = new Uint32Array(1);
    let value;
    do {
      crypto.getRandomValues(buffer);
      value = buffer[0];
    } while (value >= limit);
    return value % max;
  }

  function shuffledIndices(n) {
    const result = Array.from({length: n}, (_, i) => i);
    for (let i = n - 1; i > 0; i--) {
      const j = randomInteger(i + 1);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  function makeAssignments(n) {
    // Rechazar sorteos con autorregalos produce un reparto justo entre
    // todas las permutaciones válidas (derangements).
    for (let trial = 0; trial < 1000; trial++) {
      const shuffled = shuffledIndices(n);
      if (shuffled.every((recipient, index) => recipient !== index)) return shuffled;
    }
    // Respaldo garantizado: ciclo aleatorio sin posiciones fijas.
    const cycle = shuffledIndices(n);
    const result = Array(n);
    cycle.forEach((current, index) => { result[current] = cycle[(index + 1) % n]; });
    return result;
  }

  function showPanel(panelId) {
    for (const id of panels) $(id).hidden = id !== panelId;
    $('resetRow').hidden = !game && !corruptStorage;
  }

  function completedCount() {
    return game.completed.filter(Boolean).length;
  }

  function updateSetupCount() {
    const n = $('namesInput').value.split(/\r?\n/).filter(line => normalizeName(line)).length;
    $('setupCount').textContent = `${n} ${n === 1 ? 'nombre introducido' : 'nombres introducidos'}`;
  }

  function showSelect() {
    selectedIndex = null;
    $('recipientName').textContent = '';
    $('resultFor').textContent = '';
    if (completedCount() === game.names.length) return showFinish();

    const select = $('participantSelect');
    select.replaceChildren();
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Selecciona tu nombre';
    select.append(placeholder);

    game.names.forEach((name, i) => {
      if (game.completed[i]) return;
      const option = document.createElement('option');
      option.value = String(i);
      option.textContent = name;
      select.append(option);
    });
    select.value = '';
    $('chooseBtn').disabled = true;
    $('progressCount').textContent = `${completedCount()} de ${game.names.length} participantes`;
    $('progressBar').style.width = `${100 * completedCount() / game.names.length}%`;
    $('chooseError').textContent = '';
    showPanel('selectPanel');
  }

  function showFinish() {
    $('finishCount').textContent = `${game.names.length} participantes han descubierto su Amigo Invisible.`;
    showPanel('finishPanel');
  }

  function startGame() {
    $('setupError').textContent = '';
    const names = $('namesInput').value.split(/\r?\n/).map(normalizeName).filter(Boolean);
    if (names.length < 2) return error('setupError', 'Incluye al menos dos participantes.');
    if (names.length > 80) return error('setupError', 'El máximo es de 80 participantes.');
    if (names.some(name => name.length > 80)) return error('setupError', 'Los nombres no pueden superar los 80 caracteres.');
    if (new Set(names.map(name => name.toLocaleLowerCase('es'))).size !== names.length) {
      return error('setupError', 'Hay nombres duplicados. Añade un apellido para distinguirlos.');
    }
    if (!confirm(`¿Confirmas la lista de ${names.length} participantes? Después no se podrá modificar sin reiniciar el sorteo.`)) return;
    const next = {version: 1, names, assignments: makeAssignments(names.length), completed: names.map(() => false)};
    if (!save(next)) return error('setupError', 'No se ha podido guardar el sorteo. Comprueba que el navegador permita almacenamiento local.');
    game = next;
    $('namesInput').value = '';
    showSelect();
  }

  function error(element, message) { $(element).textContent = message; }

  function chooseParticipant() {
    const value = $('participantSelect').value;
    if (!/^\d+$/.test(value)) return error('chooseError', 'Elige un nombre de la lista.');
    const index = Number(value);
    if (!game || index >= game.names.length || game.completed[index]) return error('chooseError', 'Este participante ya ha realizado su turno.');
    selectedIndex = index;
    $('privacyName').textContent = game.names[index];
    showPanel('privacyPanel');
  }

  function revealRecipient() {
    if (!game || selectedIndex === null || game.completed[selectedIndex]) return showSelect();
    const next = {...game, completed: game.completed.slice()};
    next.completed[selectedIndex] = true;
    if (!save(next)) return error('giftError', 'No se ha podido registrar esta participación. Prueba de nuevo antes de mostrar el nombre.');
    game = next;
    $('resultFor').textContent = `${game.names[selectedIndex]}, tienes una misión muy especial:`;
    $('recipientName').textContent = game.names[game.assignments[selectedIndex]];
    showPanel('resultPanel');
    runConfetti();
  }

  function runConfetti() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const canvas = $('fx'), ctx = canvas.getContext('2d');
    if (!ctx) return;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    const width = innerWidth, height = innerHeight;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    const rect = $('resultPanel').getBoundingClientRect();
    const x = rect.left + rect.width / 2, y = rect.top + rect.height / 2;
    const palette = ['#ffe9b9', '#e5b36c', '#ffffff', '#8eb7ce'];
    const particles = Array.from({length: 75}, () => ({
      x, y, vx: (Math.random() - .5) * 12, vy: (Math.random() - .8) * 10,
      size: Math.random() * 4 + 2, color: palette[Math.floor(Math.random() * palette.length)]
    }));
    const begin = performance.now();
    function frame(now) {
      const elapsed = now - begin;
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy; p.vy += .14;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, Math.min(1, (1700 - elapsed) / 450));
        ctx.fillRect(p.x, p.y, p.size, p.size * 1.5);
      }
      ctx.globalAlpha = 1;
      if (elapsed < 1700) requestAnimationFrame(frame);
      else ctx.clearRect(0, 0, width, height);
    }
    requestAnimationFrame(frame);
  }

  function resetGame() {
    const answer = prompt('Para borrar el sorteo actual y comenzar otro, escribe REINICIAR:');
    if (answer !== 'REINICIAR') return;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (_) {
      error('globalError', 'No se han podido borrar los datos del navegador.');
      return;
    }
    game = null;
    selectedIndex = null;
    corruptStorage = false;
    $('namesInput').value = '';
    $('recipientName').textContent = '';
    $('storageWarning').hidden = true;
    $('startBtn').disabled = false;
    updateSetupCount();
    showPanel('setupPanel');
  }

  $('namesInput').addEventListener('input', updateSetupCount);
  $('startBtn').addEventListener('click', startGame);
  $('participantSelect').addEventListener('change', () => { $('chooseBtn').disabled = !$('participantSelect').value; });
  $('chooseBtn').addEventListener('click', chooseParticipant);
  $('notAloneBtn').addEventListener('click', showSelect);
  $('aloneBtn').addEventListener('click', () => { $('giftError').textContent = ''; showPanel('giftPanel'); });
  $('cancelRevealBtn').addEventListener('click', showSelect);
  $('revealBtn').addEventListener('click', revealRecipient);
  $('nextBtn').addEventListener('click', showSelect);
  $('resetBtn').addEventListener('click', resetGame);

  game = restore();
  updateSetupCount();
  if (game) showSelect(); else showPanel('setupPanel');
})();
