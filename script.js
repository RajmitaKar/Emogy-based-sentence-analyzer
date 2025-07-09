let model;
const analyzeBtn = document.getElementById("analyzeBtn");
const outputEmoji = document.getElementById("outputEmoji");
const statusText = document.getElementById("status");

// Emotion template sentences
const emojiMap = {
  happy: "😊", sad: "😢", angry: "😠",
  love: "😍", surprise: "😲", sarcasm: "🙃",stressed:"😣",fear:"😨",confused:"😅"
};

const emotionTemplates = {
  happy: ["I'm feeling great", "This is amazing","I am so excited","I am so happy"],
  sad: ["I'm really down", "I feel hopeless","I am crying"],
  angry: ["This is frustrating", "I'm so mad","I hate you"],
  love: ["I really like you", "I adore this"],
  surprise: ["Wow, that's unexpected!", "I can't believe it"],
  sarcasm: ["Oh fantastic... not", "Well that went *just* great"],
  stressed:["I am pressurised","I am stressed"],
  fear:["It is so scary,I am so afraid"],
  confused:["I did not understand","This is so confusing",],
};

async function loadModel() {
  statusText.textContent = "Loading model...";
  model = await use.load();
  statusText.textContent = "Model loaded. 🎯";
}

loadModel();

function cosineSimilarity(vecA, vecB) {
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
  return dot / (magA * magB);
}

async function getEmbedding(sentence) {
  const embeddings = await model.embed([sentence]);
  return embeddings.arraySync()[0];
}

analyzeBtn.addEventListener("click", async () => {
  const input = document.getElementById("userInput").value.trim();
  if (!input) return;

  if (!model) {
    statusText.textContent = "Model still loading... please wait.";
    return;
  }

  outputEmoji.textContent = "🔎";
  const inputVec = await getEmbedding(input);

  let bestScore = -Infinity;
  let bestEmotion = null;

  for (const emotion in emotionTemplates) {
    let scores = [];

    for (const template of emotionTemplates[emotion]) {
      const templateVec = await getEmbedding(template);
      const sim = cosineSimilarity(inputVec, templateVec);
      scores.push(sim);
    }

    const avgSim = scores.reduce((a, b) => a + b, 0) / scores.length;
    if (avgSim > bestScore) {
      bestScore = avgSim;
      bestEmotion = emotion;
    }
  }

  outputEmoji.textContent = emojiMap[bestEmotion] || "🤔";
});