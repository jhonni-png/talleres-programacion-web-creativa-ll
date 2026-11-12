"use strict";

/* ==========================================================
   TALLER 11 - SISTEMA DE EVALUACIONES INTERACTIVAS
   Universidad de Caldas - Programación Web Creativa II
   ========================================================== */

/* ---------- 1. BANCO DE PREGUNTAS ---------- */
/* "correct" es la posición (0 a 3) de la respuesta correcta en "options" */
const questions = [
    {
        question: "¿Qué significa la sigla HTML?",
        options: [
            "Lenguaje de Programación de Hipertexto",
            "Lenguaje de Marcado de Hipertexto",
            "Herramienta de Maquetación Total",
            "Lenguaje de Módulos Híbridos"
        ],
        correct: 1,
        explanation: "HTML (HyperText Markup Language) es un lenguaje de marcado "
            + "que define la estructura de una página."
    },
    {
        question: "¿Cuál etiqueta HTML representa el encabezado de mayor "
            + "jerarquía en una página?",
        options: ["<h6>", "<header>", "<h1>", "<title>"],
        correct: 2,
        explanation: "La etiqueta <h1> define el título principal. Las etiquetas "
            + "<h2> a <h6> son niveles inferiores."
    },
    {
        question: "¿Qué propiedad de CSS permite cambiar el color de fondo "
            + "de un elemento?",
        options: ["background-color", "text-color", "font-color", "color-fill"],
        correct: 0,
        explanation: "La propiedad background-color establece el color de fondo "
            + "de cualquier elemento."
    },
    {
        question: "¿Cuál es la forma correcta de vincular un archivo CSS "
            + "externo en un documento HTML?",
        options: [
            "<style src=\"styles.css\">",
            "<css href=\"styles.css\">",
            "<script href=\"styles.css\">",
            "<link rel=\"stylesheet\" href=\"styles.css\">"
        ],
        correct: 3,
        explanation: "Se usa la etiqueta <link> dentro de <head>, con "
            + "rel=\"stylesheet\" y la ruta en href."
    },
    {
        question: "¿Qué palabra clave de JavaScript declara una variable "
            + "cuyo valor no puede reasignarse?",
        options: ["var", "let", "static", "const"],
        correct: 3,
        explanation: "const declara una constante: no se puede reasignar "
            + "después de su declaración inicial."
    },
    {
        question: "¿Qué método de JavaScript selecciona un elemento del "
            + "documento a partir de su atributo id?",
        options: [
            "document.getElementById()",
            "document.findId()",
            "document.selectTag()",
            "document.getClassName()"
        ],
        correct: 0,
        explanation: "document.getElementById() devuelve el elemento cuyo id "
            + "coincide con el texto indicado."
    },
    {
        question: "¿Qué evento se dispara cuando el usuario hace clic sobre "
            + "un elemento?",
        options: ["hover", "click", "submit", "change"],
        correct: 1,
        explanation: "El evento click se produce al presionar y soltar el "
            + "botón principal del mouse sobre un elemento."
    },
    {
        question: "¿Qué modelo de CSS describe cada elemento como una caja "
            + "formada por contenido, padding, border y margin?",
        options: [
            "Modelo de tabla",
            "Modelo de caja (box model)",
            "Modelo de rejilla",
            "Modelo de capas"
        ],
        correct: 1,
        explanation: "El box model explica cómo se calculan el tamaño y los "
            + "espacios de cada elemento en la página."
    },
    {
        question: "¿Qué es el DOM en el desarrollo web?",
        options: [
            "Un lenguaje de estilos para diseñar páginas",
            "Un servidor que almacena páginas web",
            "Una representación en árbol del documento, modificable con JavaScript",
            "Un programa para editar imágenes"
        ],
        correct: 2,
        explanation: "El DOM (Document Object Model) permite que JavaScript lea "
            + "y cambie el contenido, la estructura y los estilos."
    },
    {
        question: "¿Qué operador de JavaScript compara tanto el valor como "
            + "el tipo de dato?",
        options: ["=", "==", "!=", "==="],
        correct: 3,
        explanation: "El operador === es de igualdad estricta: solo es "
            + "verdadero si valor y tipo son idénticos."
    },
    {
        question: "¿Qué declaración de CSS activa el modelo de diseño Flexbox "
            + "en un contenedor?",
        options: [
            "display: flex;",
            "position: flex;",
            "float: flex;",
            "layout: flexbox;"
        ],
        correct: 0,
        explanation: "display: flex convierte al elemento en un contenedor "
            + "flexible y organiza a sus hijos en una fila o columna."
    },
    {
        question: "¿Qué función de JavaScript ejecuta un bloque de código "
            + "repetidamente cada cierto intervalo de tiempo?",
        options: ["setTimeout()", "setInterval()", "requestPage()", "repeatEvery()"],
        correct: 1,
        explanation: "setInterval() repite una función cada cierto número de "
            + "milisegundos hasta que se llame a clearInterval()."
    }
];

/* ---------- 2. CONFIGURACIÓN ---------- */
const TOTAL_TIME = 360;      // Tiempo total en segundos (6 minutos)
const PASS_PERCENT = 60;     // Porcentaje mínimo para aprobar
const OPTION_LETTERS = ["A", "B", "C", "D"];

/* ---------- 3. ESTADO DE LA APLICACIÓN ---------- */
let currentIndex = 0;
let userAnswers = [];
let timeLeft = TOTAL_TIME;
let timerId = null;
let questionAnswered = false;
let quizActive = false;

/* ---------- 4. REFERENCIAS AL DOM ---------- */
const welcomeScreen = document.getElementById("welcome-screen");
const quizScreen = document.getElementById("quiz-screen");
const resultsScreen = document.getElementById("results-screen");

const infoTotal = document.getElementById("info-total");
const infoTime = document.getElementById("info-time");
const startBtn = document.getElementById("start-btn");

const progressText = document.getElementById("progress-text");
const liveScore = document.getElementById("live-score");
const timerBox = document.getElementById("timer");
const timerText = document.getElementById("timer-text");
const progressBar = document.querySelector(".progress-bar");
const progressFill = document.getElementById("progress-fill");

const questionBadge = document.getElementById("question-badge");
const questionText = document.getElementById("question-text");
const optionsBox = document.getElementById("options");
const feedbackBox = document.getElementById("feedback");
const validationMessage = document.getElementById("validation-message");
const nextBtn = document.getElementById("next-btn");

const scoreRing = document.getElementById("score-ring");
const scorePercent = document.getElementById("score-percent");
const resultTitle = document.getElementById("result-title");
const resultMessage = document.getElementById("result-message");
const statCorrect = document.getElementById("stat-correct");
const statWrong = document.getElementById("stat-wrong");
const statBlank = document.getElementById("stat-blank");
const statTime = document.getElementById("stat-time");
const gradeValue = document.getElementById("grade-value");
const reviewList = document.getElementById("review-list");
const restartBtn = document.getElementById("restart-btn");

/* ---------- 5. FUNCIONES AUXILIARES ---------- */
function showScreen(screen) {
    welcomeScreen.classList.add("hidden");
    quizScreen.classList.add("hidden");
    resultsScreen.classList.add("hidden");
    screen.classList.remove("hidden");
    window.scrollTo(0, 0);
}

function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const mm = String(minutes).padStart(2, "0");
    const ss = String(seconds).padStart(2, "0");
    return mm + ":" + ss;
}

function countCorrectAnswers() {
    let total = 0;
    for (let i = 0; i < questions.length; i++) {
        if (userAnswers[i] === questions[i].correct) {
            total++;
        }
    }
    return total;
}

/* ---------- 6. TEMPORIZADOR ---------- */
function updateTimerDisplay() {
    timerText.textContent = formatTime(timeLeft);
    timerBox.classList.remove("timer-warning", "timer-danger");

    if (timeLeft <= 30) {
        timerBox.classList.add("timer-danger");
    } else if (timeLeft <= 60) {
        timerBox.classList.add("timer-warning");
    }
}

function startTimer() {
    stopTimer();
    timeLeft = TOTAL_TIME;
    updateTimerDisplay();

    timerId = setInterval(function () {
        timeLeft--;
        updateTimerDisplay();

        if (timeLeft <= 0) {
            finishQuiz(true);
        }
    }, 1000);
}

function stopTimer() {
    if (timerId !== null) {
        clearInterval(timerId);
        timerId = null;
    }
}

/* ---------- 7. FLUJO DE LA EVALUACIÓN ---------- */
function startQuiz() {
    currentIndex = 0;
    userAnswers = new Array(questions.length).fill(null);
    questionAnswered = false;
    quizActive = true;

    showScreen(quizScreen);
    startTimer();
    renderQuestion();
}

function renderQuestion() {
    const current = questions[currentIndex];
    questionAnswered = false;

    progressText.textContent = "Pregunta " + (currentIndex + 1)
        + " de " + questions.length;
    liveScore.textContent = "Aciertos: " + countCorrectAnswers();
    questionBadge.textContent = "Pregunta " + (currentIndex + 1);
    questionText.textContent = current.question;

    const done = currentIndex + 1;
    const percent = Math.round((done / questions.length) * 100);
    progressFill.style.width = percent + "%";
    progressBar.setAttribute("aria-valuenow", String(percent));

    optionsBox.innerHTML = "";
    current.options.forEach(function (optionText, index) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "option";
        button.dataset.index = String(index);

        const letter = document.createElement("span");
        letter.className = "option-letter";
        letter.textContent = OPTION_LETTERS[index];

        const text = document.createElement("span");
        text.className = "option-text";
        text.textContent = optionText;

        const mark = document.createElement("span");
        mark.className = "option-mark";

        button.appendChild(letter);
        button.appendChild(text);
        button.appendChild(mark);
        button.addEventListener("click", function () {
            selectOption(index);
        });

        optionsBox.appendChild(button);
    });

    feedbackBox.className = "feedback hidden";
    feedbackBox.textContent = "";
    validationMessage.classList.add("hidden");
    validationMessage.classList.remove("shake");

    nextBtn.textContent = currentIndex === questions.length - 1
        ? "Finalizar evaluación"
        : "Siguiente";
}

function selectOption(selectedIndex) {
    if (!quizActive || questionAnswered) {
        return;
    }

    const current = questions[currentIndex];
    const isCorrect = selectedIndex === current.correct;
    const buttons = optionsBox.querySelectorAll(".option");

    questionAnswered = true;
    userAnswers[currentIndex] = selectedIndex;

    buttons.forEach(function (button, index) {
        const mark = button.querySelector(".option-mark");
        button.disabled = true;

        if (index === current.correct) {
            button.classList.add("correct");
            mark.textContent = "✔";
        } else if (index === selectedIndex) {
            button.classList.add("incorrect");
            mark.textContent = "✖";
        } else {
            button.classList.add("dimmed");
        }
    });

    if (isCorrect) {
        feedbackBox.className = "feedback feedback-correct";
        feedbackBox.textContent = "✔ ¡Correcto! " + current.explanation;
    } else {
        feedbackBox.className = "feedback feedback-incorrect";
        feedbackBox.textContent = "✖ Respuesta incorrecta. La respuesta correcta es: "
            + OPTION_LETTERS[current.correct] + ") "
            + current.options[current.correct] + ". "
            + current.explanation;
    }

    validationMessage.classList.add("hidden");
    liveScore.textContent = "Aciertos: " + countCorrectAnswers();
}

function handleNext() {
    if (!quizActive) {
        return;
    }

    if (!questionAnswered) {
        validationMessage.classList.remove("hidden");
        validationMessage.classList.remove("shake");
        void validationMessage.offsetWidth;
        validationMessage.classList.add("shake");
        return;
    }

    if (currentIndex < questions.length - 1) {
        currentIndex++;
        renderQuestion();
    } else {
        finishQuiz(false);
    }
}

function finishQuiz(timeExpired) {
    quizActive = false;
    stopTimer();
    showResults(timeExpired);
}

/* ---------- 8. RESULTADOS ---------- */
function showResults(timeExpired) {
    const total = questions.length;
    const correctCount = countCorrectAnswers();
    const blankCount = userAnswers.filter(function (answer) {
        return answer === null;
    }).length;
    const wrongCount = total - correctCount - blankCount;
    const percent = Math.round((correctCount / total) * 100);
    const grade = ((correctCount / total) * 5).toFixed(1);
    const timeUsed = TOTAL_TIME - Math.max(timeLeft, 0);

    let title = "";
    let message = "";
    let ringClass = "score-ring";

    if (percent >= 90) {
        title = "🏆 ¡Excelente trabajo!";
        message = "Dominas los fundamentos de la programación web. "
            + "Sigue practicando y creando.";
    } else if (percent >= 70) {
        title = "🎉 ¡Muy bien!";
        message = "Tienes una base sólida. Revisa las respuestas incorrectas "
            + "para llegar a la excelencia.";
    } else if (percent >= PASS_PERCENT) {
        title = "👍 Aprobaste";
        message = "Alcanzaste el mínimo requerido. Repasa los temas "
            + "donde fallaste para fortalecerlos.";
        ringClass += " ring-mid";
    } else {
        title = "📚 Necesitas repasar";
        message = "No te desanimes. Estudia la revisión de respuestas "
            + "e inténtalo de nuevo.";
        ringClass += " ring-fail";
    }

    if (timeExpired) {
        message = "⏰ El tiempo se agotó y la evaluación se cerró "
            + "automáticamente. " + message;
    }

    scoreRing.className = ringClass;
    scoreRing.style.setProperty("--percent", String(percent));
    scorePercent.textContent = percent + "%";
    resultTitle.textContent = title;
    resultMessage.textContent = message;
    statCorrect.textContent = String(correctCount);
    statWrong.textContent = String(wrongCount);
    statBlank.textContent = String(blankCount);
    statTime.textContent = formatTime(timeUsed);
    gradeValue.textContent = grade;

    renderReview();
    showScreen(resultsScreen);
}

function renderReview() {
    reviewList.innerHTML = "";

    questions.forEach(function (item, index) {
        const answer = userAnswers[index];
        let statusClass = "review-blank";
        let statusText = "Sin responder";

        if (answer === item.correct) {
            statusClass = "review-correct";
            statusText = "Correcta";
        } else if (answer !== null) {
            statusClass = "review-incorrect";
            statusText = "Incorrecta";
        }

        const box = document.createElement("div");
        box.className = "review-item " + statusClass;

        const head = document.createElement("div");
        head.className = "review-head";
        const number = document.createElement("span");
        number.textContent = "Pregunta " + (index + 1);
        const status = document.createElement("span");
        status.className = "review-status";
        status.textContent = statusText;
        head.appendChild(number);
        head.appendChild(status);

        const question = document.createElement("p");
        question.className = "review-question";
        question.textContent = item.question;

        const yourAnswer = document.createElement("p");
        yourAnswer.className = "review-line";
        if (answer === null) {
            yourAnswer.textContent = "Tu respuesta: No respondiste esta pregunta.";
        } else {
            yourAnswer.textContent = "Tu respuesta: "
                + OPTION_LETTERS[answer] + ") " + item.options[answer];
        }

        const rightAnswer = document.createElement("p");
        rightAnswer.className = "review-line";
        rightAnswer.textContent = "Respuesta correcta: "
            + OPTION_LETTERS[item.correct] + ") " + item.options[item.correct];

        const explanation = document.createElement("p");
        explanation.className = "review-explanation";
        explanation.textContent = item.explanation;

        box.appendChild(head);
        box.appendChild(question);
        box.appendChild(yourAnswer);
        box.appendChild(rightAnswer);
        box.appendChild(explanation);
        reviewList.appendChild(box);
    });
}

function restartQuiz() {
    stopTimer();
    quizActive = false;
    currentIndex = 0;
    userAnswers = [];
    questionAnswered = false;
    timeLeft = TOTAL_TIME;
    showScreen(welcomeScreen);
}

/* ---------- 9. EVENTOS E INICIALIZACIÓN ---------- */
startBtn.addEventListener("click", startQuiz);
nextBtn.addEventListener("click", handleNext);
restartBtn.addEventListener("click", restartQuiz);

infoTotal.textContent = String(questions.length);
infoTime.textContent = Math.round(TOTAL_TIME / 60) + " min";