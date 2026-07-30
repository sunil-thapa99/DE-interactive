(function () {
  const app = document.getElementById("app");
  const tabs = document.querySelectorAll(".tab");
  const STORAGE_KEY = "sf-pipeline-progress-v1";

  function loadDone() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function saveDone(done) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(done));
  }
  let done = loadDone();

  function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function renderDiagram(nodes) {
    let html = '<div class="arch-diagram">';
    nodes.forEach(n => {
      if (n.arrow) html += '<span class="arch-arrow">&#8594;</span>';
      else html += `<div class="arch-node ${n.hl ? "hl" : ""}">${n.label.replace(/\n/g, "<br>")}</div>`;
    });
    html += "</div>";
    return html;
  }

  function cardId(section, idx) { return `${section}-${idx}`; }

  function renderCards(section, cards) {
    return cards.map((c, i) => {
      const id = cardId(section, i);
      const isDone = !!done[id];
      const codeBlock = c.code
        ? `<div class="pre-wrap"><button class="copy-btn" data-code-id="${id}">Copy</button><pre><code id="code-${id}">${escapeHtml(c.code)}</code></pre></div>`
        : "";
      const noteBlock = c.note ? `<p class="note">${c.noteLabel ? `<strong>${c.noteLabel}</strong> ` : ""}${c.note}</p>` : "";
      const navBlock = c.nav
        ? `<div class="nav-box"><strong>${c.navLabel || "Navigation:"}</strong> ${c.nav}</div>`
        : "";
      return `
        <div class="card" data-id="${id}">
          <div class="card-head" data-toggle="${id}">
            <div class="check ${isDone ? "done" : ""}" data-check="${id}">${isDone ? "&#10003;" : ""}</div>
            <div class="card-title">${c.title}</div>
            <span class="card-nav-badge">${c.badge || "steps"}</span>
            <span class="chevron">&#9656;</span>
          </div>
          <div class="card-body">
            ${navBlock}
            ${codeBlock}
            ${noteBlock}
          </div>
        </div>`;
    }).join("");
  }

  function renderSection(key) {
    const data = CONTENT[key];
    let html = `<div class="section-intro"><h2>${data.intro.title}</h2><p>${data.intro.desc}</p></div>`;
    if (data.diagram) html += renderDiagram(data.diagram);
    html += renderCards(key, data.cards);
    return html;
  }

  function renderCompare() {
    let html = `<div class="section-intro"><h2>Compare the three ETL variants</h2><p>Same ingestion foundation, different transform/orchestration approach.</p></div>`;
    html += `<div style="overflow-x:auto"><table class="compare"><thead><tr><th>Dimension</th><th>Tasks + Streams</th><th>Dynamic Tables</th><th>External Orchestrator</th></tr></thead><tbody>`;
    COMPARE_ROWS.forEach(row => {
      html += `<tr>${row.map(cell => `<td>${cell}</td>`).join("")}</tr>`;
    });
    html += `</tbody></table></div>`;
    return html;
  }

  function renderQuiz() {
    let html = `<div class="section-intro"><h2>Quick knowledge check</h2><p>Click an answer to see if you're right. Score updates live.</p></div>`;
    QUIZ.forEach((q, qi) => {
      html += `<div class="quiz-q" data-q="${qi}"><p class="q-text">${qi + 1}. ${q.q}</p><div class="quiz-opts">`;
      q.options.forEach((opt, oi) => {
        html += `<button class="quiz-opt" data-q="${qi}" data-o="${oi}">${opt}</button>`;
      });
      html += `</div></div>`;
    });
    html += `<div class="quiz-score" id="quizScore">Score: 0 / ${QUIZ.length}</div>`;
    return html;
  }

  function attachCardHandlers() {
    document.querySelectorAll("[data-toggle]").forEach(headEl => {
      headEl.addEventListener("click", (e) => {
        if (e.target.closest(".check")) return;
        const card = headEl.closest(".card");
        card.classList.toggle("open");
      });
    });
    document.querySelectorAll("[data-check]").forEach(checkEl => {
      checkEl.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = checkEl.getAttribute("data-check");
        done[id] = !done[id];
        saveDone(done);
        checkEl.classList.toggle("done", done[id]);
        checkEl.innerHTML = done[id] ? "&#10003;" : "";
        updateProgress();
      });
    });
    document.querySelectorAll(".copy-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-code-id");
        const codeEl = document.getElementById(`code-${id}`);
        navigator.clipboard.writeText(codeEl.textContent).then(() => {
          btn.textContent = "Copied!";
          setTimeout(() => (btn.textContent = "Copy"), 1200);
        });
      });
    });
  }

  function attachQuizHandlers() {
    document.querySelectorAll(".quiz-opt").forEach(btn => {
      btn.addEventListener("click", () => {
        const qi = parseInt(btn.getAttribute("data-q"), 10);
        const oi = parseInt(btn.getAttribute("data-o"), 10);
        const qBlock = document.querySelector(`.quiz-q[data-q="${qi}"]`);
        if (qBlock.classList.contains("answered")) return;
        qBlock.classList.add("answered");
        const correctIdx = QUIZ[qi].correct;
        qBlock.querySelectorAll(".quiz-opt").forEach((o, i) => {
          o.disabled = true;
          if (i === correctIdx) o.classList.add("correct");
          else if (i === oi) o.classList.add("wrong");
        });
        updateQuizScore();
      });
    });
  }

  function updateQuizScore() {
    const answered = document.querySelectorAll(".quiz-q.answered");
    let score = 0;
    answered.forEach(qb => { if (qb.querySelector(".quiz-opt.wrong") === null) score++; });
    const scoreEl = document.getElementById("quizScore");
    if (scoreEl) scoreEl.textContent = `Score: ${score} / ${QUIZ.length}`;
  }

  function allCardIds() {
    const ids = [];
    ["overview", "ingestion", "tasks", "dynamic", "orchestrator", "interview"].forEach(k => {
      CONTENT[k].cards.forEach((_, i) => ids.push(cardId(k, i)));
    });
    return ids;
  }

  function updateProgress() {
    const ids = allCardIds();
    const total = ids.length;
    const doneCount = ids.filter(id => done[id]).length;
    document.getElementById("progressCount").textContent = doneCount;
    document.getElementById("progressTotal").textContent = total;
    const pct = total ? Math.round((doneCount / total) * 100) : 0;
    document.getElementById("progressFill").style.width = pct + "%";
  }

  function renderTab(tabKey) {
    if (tabKey === "compare") app.innerHTML = renderCompare();
    else if (tabKey === "quiz") app.innerHTML = renderQuiz();
    else app.innerHTML = renderSection(tabKey);

    if (tabKey === "quiz") attachQuizHandlers();
    else attachCardHandlers();
    updateProgress();
  }

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      renderTab(tab.getAttribute("data-tab"));
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  renderTab("overview");
})();
