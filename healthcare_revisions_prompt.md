# Claude Code Prompt — Healthcare Case Study Revisions Round 2
## File to edit: healthcare_case_study.html

---

## CONTEXT

This prompt contains revisions to healthcare_case_study.html. The goal is to make the case study clearer, more honest, and readable by someone with no ML background. Many changes involve expanding explanations, removing jargon, removing irrelevant content, and fixing things that are confusing or misleading.

---

## PART 1 — REMOVALS

### R1 — Remove the entire debugging / "What Went Wrong" section
Remove the full section with heading "What Went Wrong and How It Was Fixed" and all its subsections:
- TRL 1.2.0 broke the training setup
- CUDA Out of Memory with 80 GB of VRAM
- SSH key not authorized on RunPod
- HuggingFace upload failed silently

Remove it from the TOC as well. The SSH access issue may be briefly mentioned in the Learnings section only (see A12 below).

### R2 — Remove "Library versions matter more than tutorials suggest" from Learnings
Remove this entire subsection from the Learnings section.

### R3 — Remove "Deployment is part of the project" from Learnings
Remove this entire subsection from the Learnings section.

### R4 — Remove all 7B model references
In the Key Decisions section, decision #2 currently mentions the 7B variant. Remove all references to 7B. Rewrite the decision to focus only on why the 1B instruction-tuned variant was chosen: fast iteration cycles, and the fact that the instruction-tuned base already knows how to hold a conversation.

### R5 — Remove all pill/badge styling from step headings
Remove the `h4.step` CSS class entirely. All step headings (Step 1, Step 2, Step 3, "Model loading with QLoRA", "Training loop") should render as plain bold h4 text — black, no background color, no border-radius, no padding pill. Just bold text. Remove the `.step` CSS rule.

### R6 — Remove "unlike GPT-4 which is locked behind a paid API"
In the Executive Summary, remove this phrase from the Gemma 3 explanation.

### R7 — Remove the car rental analogy
Remove: "by the hour, the same way you might rent a car rather than buy one"

### R8 — Remove "it made a job that would otherwise take days feasible in an afternoon"
Remove this phrase entirely. Where "job" appears nearby, change it to "task." Do not say "afternoon."

### R9 — Remove the Excel analogy from the PyTorch description
Remove: "similar to how Excel is the default tool for spreadsheets but for neural networks"
Also remove: "most ML engineers" — replace with just "engineers."

### R10 — Rewrite the intro sentence to remove all jargon brand names
Replace this sentence in the intro section:
> "The solution: fine-tune on 100,000 real patient-doctor conversations using QLoRA, on a cloud H100 GPU, and deploy the result as a live web app on HuggingFace Spaces."

With a plain-English version that avoids all brand/technique names in the intro:
- Do not say "QLoRA" — say "a parameter-efficient retraining technique"
- Do not say "HuggingFace" — say "a public AI model hosting platform"
- Do not say "cloud H100 GPU" — say "a rented high-performance GPU"
- Do not say "fine-tune" in the intro — say "retrain on top of"

### R11 — Remove "compressing the frozen base model to save memory" without explanation
The current QLoRA description says "compressing the frozen base model to save memory" without explaining it. Either remove this phrase or replace it with a full plain-English explanation: QLoRA works by first representing the original model's weights in a compressed numeric format that uses less GPU memory, then adding a small set of new trainable layers on top. The compressed base model's weights are locked and not updated — only the new layers learn. This means training requires far less memory than updating the entire model.

---

## PART 2 — CHANGES

### C1 — Fix footer link
Change the footer model link from:
  `https://huggingface.co/jeremylangdon/gemma3-healthcare-finetune`
To:
  `https://huggingface.co/spaces/jeremylangdon/gemma3-healthcare-bot`
Update both the href and the visible text.

### C2 — Add live app link in Executive Summary
After the sentence in the Executive Summary about the deployed web application, add a visible clickable link on its own line:
  `→ Try the live app`
Link it to: `https://huggingface.co/spaces/jeremylangdon/gemma3-healthcare-bot`
Open in a new tab. Style it like other links in the document.

### C3 — Change "What keyword metrics measure" column from red to blue
In the keyword metrics comparison grid, the column labelled "What keyword metrics measure" uses `class="comparison-col lose"` which renders it red. This is wrong — the column is not showing something bad, just something limited. Change it to `class="comparison-col win"` or add a new class that colors its heading blue instead of red.

### C4 — Rewrite the pull quote about keyword metrics — make it plain English
Replace:
> "No statistically significant difference was found on any metric. That does not mean fine-tuning failed — it means keyword counting is the wrong tool for measuring domain adaptation."

With:
> "The evaluation found no measurable difference between the two models on these word-presence checks. That does not mean the training did not work — it means checking whether the word 'doctor' appears in a response tells us almost nothing about whether the response is clinically good."

### C5 — Every mention of "keyword detection" — explain what it actually does
Every time "keyword detection" or "automated keyword detection" is used, add a brief plain-English insert: a program that scans the model's response for specific words (such as "doctor" or "urgent") and records whether they are present or absent — without reading or understanding the meaning of the response.

### C6 — Clarify "human raters" — explain it is human data labeling
Where the text says "human raters or medical benchmarks like MedQA," rewrite to:
- Confirm yes, "human raters" means qualified medical professionals (doctors or nurses) who read the model's responses and score them for clinical quality, accuracy, and appropriate safety boundaries — the same process used to train AI systems through human data labeling.
- Explain MedQA: a standardized set of medical licensing exam questions used to benchmark whether AI systems have factual medical knowledge. Getting a score on MedQA is the AI equivalent of passing a medical board exam.

### C7 — Rewrite the "refers to doctor" / "mentions urgency" metrics introduction
Before the evaluation results table, add 3–4 sentences explaining why these two metrics were chosen:
- "Refers to doctor" measures whether the model consistently recommended professional consultation — the most important safety behavior for a healthcare assistant.
- "Mentions urgency" measures whether the model flagged time-sensitive situations as requiring immediate action rather than a scheduled appointment.
- These were chosen because they are the two behaviors most likely to affect patient outcomes if wrong. They are also measurable automatically, which is why they were used as a first pass.
- Explain that keyword scanning (checking if these words appear) was used because it can be run on hundreds of responses automatically. A human reviewer would be needed to assess whether the response was actually appropriate — not just whether the word appeared.

---

## PART 3 — CONTENT ADDITIONS

### A1 — Add project statement label (if not already present)
Above the title, add a single line in small all-caps label style (use the `.project-label` class):
> "An AI assistant trained on 100,000 real doctor conversations to answer health questions the way a clinician communicates — structured, cautious, and consistent."

### A2 — Add Definitions / Key Terms section
Add this section BEFORE the Executive Summary. Use a heading "Key Terms" and a two-column table (Term | What it means). Include:

| Term | What it means |
|------|---------------|
| Fine-tuning | Taking an existing AI model and retraining it on new, specific examples to change how it behaves in a particular area — without starting from scratch. |
| Open-weight model | An AI model whose internal parameters are publicly available. Anyone can download, modify, and run it. |
| Parameters | The numerical values inside an AI model that determine how it responds to any input. This model has 1 billion of them. |
| LoRA adapter | A small 52MB file of trained weights that sits on top of an unchanged base model and steers its responses in a new direction. |
| QLoRA | A memory-efficient training method that compresses the base model's parameters during training so that it fits in GPU memory, while still allowing new layers to be trained on top. |
| Token | The smallest unit of text a language model processes — roughly a word or part of a word. |
| Loss | A number measuring how wrong the model's predictions are during training. Starts high, should fall as learning progresses. |
| GPU | A chip that can run many mathematical operations simultaneously — used for AI training because training involves billions of small calculations at once. |
| RLHF | Reinforcement Learning from Human Feedback. A training method where humans rate model outputs for quality and the model is trained to produce higher-rated responses. Used by Google and OpenAI to align their models. |

Style the table using the existing `.data-table` class.

### A3 — Expand the "What fails" list — add fine-tuned counterpart for each item
Replace the simple bullet list with a structured comparison. For each failure, show what the fine-tuned model does differently. Use a visual format — either two columns or alternating ❌/✅ pairs:

❌ **Base model:** Confidently states medical facts that may be wrong, presenting guesses as established information.
✅ **Fine-tuned model:** Frames responses as patterns typically seen in clinical practice, not as definitive answers.

❌ **Base model:** Misses warning signs when multiple symptoms together indicate something serious, treating them as separate minor complaints.
✅ **Fine-tuned model:** Identifies high-risk symptom combinations and explicitly flags them as time-sensitive.

❌ **Base model:** States things like "this sounds like X condition" — making it sound like a diagnosis — without the examination or tests that would actually support one.
✅ **Fine-tuned model:** Says what a presentation is "consistent with" rather than naming a diagnosis, and explains why a doctor's evaluation is needed to confirm anything.

❌ **Base model:** Tone varies unpredictably — sometimes alarming the reader unnecessarily, sometimes dismissing serious concerns.
✅ **Fine-tuned model:** Maintains a consistent, measured clinical tone calibrated to the described severity.

❌ **Base model:** Inconsistent about when to recommend emergency care — the same symptom combination might get different urgency levels in different sessions.
✅ **Fine-tuned model:** Applies consistent thresholds — certain symptom combinations always trigger an urgent recommendation.

### A4 — Expand GPT-4 / closed model section significantly
Expand the "Why The Obvious Solutions Don't Work" section's closed-model paragraph. Replace the current brief text with a much fuller explanation covering three distinct reasons:

**Privacy and data residency:**
Using a closed model like GPT-4 requires sending every user question to an external company's servers. For most healthcare contexts, patient questions contain sensitive health information. Most hospitals and healthcare organizations cannot legally send this data to a third-party API without a specific data processing agreement. A fine-tuned open model can run entirely on the organization's own servers — patient data never leaves their infrastructure.

**Inability to train on your own data:**
Closed models cannot be updated with your organization's clinical protocols, patient population patterns, or internal safety rules. The model you license is fixed. If your organization has a specific triage protocol, or serves a population with distinct health patterns, a closed model has no way to learn that. An open fine-tunable model can be trained on exactly the data and behavior your organization needs.

**Cost at production scale:**
At 10,000 patient queries per day, a GPT-4 API deployment costs roughly $50–200/day depending on response length — this adds up to $18,000–$73,000 per year before any other infrastructure costs. A fine-tuned open model running on rented GPU infrastructure costs a fraction of that at scale, and can eventually be self-hosted at near-zero marginal cost.

### A5 — Add paragraph in "What Results Actually Mean" about why results were expected, and suggest different use case
In the analysis section ("What the Results Actually Mean"), after explaining RLHF, add two more paragraphs:

First: Explain that the outcome was predictable. Gemma 3 Instruct was already optimized by Google specifically to say things like "consult a doctor." It already had deeply embedded safety language before this project began. Trying to shift that specific behavior with 100K examples at a low LoRA rank is like trying to change someone's most deeply ingrained habits in one afternoon of coaching. The training metrics show learning happened — just not on the specific surface behavior that keyword scanning measures.

Second: Suggest a use case where this kind of fine-tuning would show dramatically clearer results. Example: a telehealth company building a triage assistant for their specific patient intake flow, or a pharmacy building a medication question bot. In those cases, the base model has zero knowledge of the company's protocols, product catalog, or clinical decision rules. There is no pre-existing RLHF behavior to compete with. Fine-tuning on even 5,000–10,000 examples of the company's desired behavior would show large, measurable improvements because you are teaching the model something entirely new, not trying to override something it was specifically trained to do.

### A6 — Discuss whether 95 questions was enough
In the evaluation section, after the table and footnote, add a paragraph on sample size:
- 95 questions across 18 clinical categories averages roughly 5 questions per category.
- With this sample size, the confidence intervals are wide — the true score could realistically be anywhere within a 15–17 percentage point range around each reported number.
- This means even a real difference of 10 percentage points between the two models might not appear statistically significant, because both confidence intervals overlap.
- The "not significant" result here does not mean no difference exists — it may mean the study did not have enough test cases to detect a real difference that exists. This is called being underpowered.
- A more conclusive evaluation would use 300–500 questions per category (5,400–9,000 total for 18 categories), which would produce much narrower confidence intervals and potentially detect real differences the current study cannot confirm.

### A7 — Clarify confusion matrix figure caption
Rewrite the figcaption for confusion_full.png to:
- State explicitly that in each panel, the LEFT set of bars represents the BASE model, and the RIGHT set represents the FINE-TUNED model.
- Explain what a confusion matrix shows: it breaks down what the model got right and wrong. True positives = the model said the keyword was present, and it was. True negatives = the model's response didn't include the keyword, and it wasn't supposed to. False positives and negatives = errors in each direction.
- Note that the disagreement breakdown (rightmost panel) shows only the cases where the two models gave different answers — not overall performance.

### A8 — Expand loss curves explanation
Expand the loss curves section with:
1. Explain that both training loss and evaluation loss measure the same thing: the difference between what the model predicted and what the correct answer actually was. Training loss is measured on examples the model has seen; evaluation loss is measured on examples it has never been shown.
2. Explain overfitting plainly: if training loss drops but evaluation loss rises, the model is memorizing the specific wording of its training examples rather than learning general clinical patterns. It would perform well on training data but fail on any real patient question phrased differently.
3. Point to the actual chart: in this run, the green evaluation line and blue training line track closely together, and both trend downward. This is the healthy pattern. The curves look close in this run — which is exactly what you want to see. If the green line had curved back upward while the blue kept falling, that would be overfitting and the model would need to be retrained.
4. Reinforce: both lines measure the gap between prediction and reality. Them converging and declining together means the model is genuinely learning patterns that generalize — not just memorizing.

### A9 — Expand token accuracy explanation
Expand the token accuracy section to explain:
1. What it means for the model to pick the right word: when a model generates text, it is constantly predicting the next word-piece given everything before it. Token accuracy measures whether the word it chose matches what a doctor actually wrote in the training data — not just any fluent word, but the clinically appropriate one.
2. Why 61.1% matters for clinical language: random guessing from a medical vocabulary would score close to 0%. 61.1% means the model has internalized a significant portion of how doctors actually write — the right hedging phrases ("it is important to note that"), the right clinical terms ("nuchal rigidity," "paroxysmal"), the right sentence structures. These are patterns a general model trained on internet text does not have.
3. The train/eval gap is only 0.6 percentage points (61.1% vs 60.5%), which is extremely small. This means the model learned patterns that generalize to new examples — it did not just memorize the specific wording of the 106,548 training conversations.

### A10 — Expand gradient norm explanation
Rewrite the gradient norm section to be fully explained:
1. What a gradient is: during training, after each prediction, the model calculates how much it needs to adjust each of its parameters to make a better prediction next time. The gradient is the direction and size of that adjustment — it tells each parameter "increase slightly" or "decrease a lot."
2. Why the gradient norm was high early: at the start, the model had almost no familiarity with clinical language. Every medical sentence it encountered was surprising, requiring large corrections to many parameters simultaneously. A high gradient norm means large, urgent adjustments.
3. Why stabilization is the goal: as training progressed and the model learned more clinical patterns, each new example required smaller corrections — fine-tuning rather than major rewiring. The gradient norm dropping from 8.7 to 0.76 shows the model moving from "learning something completely new" to "refining what it has already learned."
4. Why the clip threshold exists: without a maximum gradient limit, a single unusual batch of data could cause one enormous update that destroys previously learned behavior. The 0.3 clip threshold ensures no single training step can overwrite everything the model learned before it.
5. The learning rate schedule: starts at 2e-4 and decays toward zero using a cosine curve. Early updates are larger — exploring the learning landscape. Later updates are smaller and more precise — locking in what was learned. The 100-step warmup prevents large damaging updates at the very beginning when the model has not yet established stable patterns.

### A11 — Expand entropy explanation with examples
Rewrite the entropy section for easy readers:
1. What entropy means in plain terms: entropy measures how uncertain the model is about what word to say next. High entropy = many equally plausible options. Low entropy = very confident about the next word.
2. Give an example: if a model sees "Take two tablets with..." it might be very confident the next word is "water" or "food." If it sees "The patient presents with a 3-day history of..." it should be uncertain — the next word could be "fever," "chest pain," "abdominal pain," or dozens of other clinically plausible completions. A model that is too certain here is probably wrong.
3. Why entropy rose slightly during training: early in training the model was confident (using familiar general-English patterns) but wrong. As it began learning medical language, it became temporarily less certain — it was recognizing that the range of clinically appropriate next words was much wider and more specific than general text. This is healthy.
4. Why high certainty too early is a warning sign: a model that is very certain very early is usually memorizing surface patterns rather than learning. The slight entropy rise followed by stabilization shows the model was genuinely restructuring how it processes clinical text.

### A12 — Improve non-diagnosis boundary explanation in Data Pipeline
Where the callout says "Why the system prompt matters," expand it to clearly explain the non-diagnosis boundary:
- The model is trained never to state a diagnosis. Instead of "This sounds like meningitis," the trained model says "This combination of symptoms is one that requires urgent evaluation by a doctor."
- Why this matters: making a diagnosis requires physical examination, laboratory results, imaging, and a complete medical history — none of which the AI has access to. A wrong diagnosis stated confidently can cause direct harm: a patient might avoid the emergency room because an AI told them their symptoms were a tension headache.
- How the system prompt enforces this: every single one of the 106,548 training examples contains the same system prompt instructing the model never to diagnose. The model sees this constraint so many times, across so many different clinical presentations, that it learns the boundary as a default behavior — not as a rule it might break if prompted differently.

### A13 — Brief mention of SSH access issue in Learnings
In the Learnings section, add a brief point about practical infrastructure skills:
> "Connecting to a remote GPU — Setting up SSH access to a remote server, managing authentication keys, and working inside a JupyterLab environment over SSH are practical skills that most ML tutorials skip. Being able to connect, debug, and manage a remote training session is part of the job."

---

## PART 4 — DO NOT CHANGE

- Any existing code blocks
- Any existing chart images
- Any existing data tables (only add to them, do not remove rows)
- The reading progress bar script
- The TOC active-link highlight script
- The footer (other than the link fix in C1)

---

## PART 5 — FINAL CHECKS

After all changes, verify:
1. No step pills exist anywhere — all step headings are plain bold text
2. "What keyword metrics measure" column is blue, not red
3. Footer link points to https://huggingface.co/spaces/jeremylangdon/gemma3-healthcare-bot
4. The debugging section is fully removed
5. The Definitions / Key Terms section appears before the Executive Summary
6. The evaluation table has an introduction explaining why the metrics were chosen
7. The GPT-4 section includes all three expanded reasons (privacy, training, cost)
8. Both the loss and token accuracy sections explain the train/eval gap in plain English
9. The entropy section includes a concrete example a non-technical reader can follow
10. The confusion matrix figcaption identifies which side is the base model and which is fine-tuned
