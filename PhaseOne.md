# Phase One PoC: AI 101 Module

**Goal:** Validate the interactive AI 101 experience by delivering a self‑contained glossary and quiz tailored to In Time Tec roles.

---

## 1. Objectives

* Launch an **Interactive Glossary** of 16 core AI terms with role‑specific context and links to authoritative sources.
* Embed a **3‑question quiz widget** to reinforce learning immediately after the glossary.
* Track completion metrics and collect brief feedback.

---

## 1.1 Tech Stack & Stretch Goals

* **MVP Frontend:** React + TypeScript SPA served entirely on GitHub Pages.
* **Build & Deploy:** GitHub Actions to build and push the production bundle to the `gh-pages` branch on each merge.

## 2. Glossary.&#x20;

Each term below includes:

1. A concise definition.
2. A link to a credible external source.
3. Notes on why it matters for different business personas.

| Term                             | Definition & Source                                                                                                                                            | Relevant Roles                                                                                                                |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **Artificial Intelligence (AI)** | Systems that perform tasks normally requiring human intelligence. [IBM AI](https://www.ibm.com/topics/artificial-intelligence)                                 | Business & Ops: Understand automation potentialPM/Designers: Scope AI featuresData Scientists: Concept context                |
| **Machine Learning (ML)**        | A subset of AI where models learn patterns from data. [Google ML](https://cloud.google.com/learn/what-is-machine-learning)                                     | Business & Ops: Recognize data-driven insightsEngineers: Integrate ML APIsData Scientists: Model-building foundation          |
| **Dataset**                      | A collection of structured or unstructured data used to train and test models. [Wikipedia](https://en.wikipedia.org/wiki/Dataset)                              | Business & Ops: Supply domain data contextsData Scientists: Prepare and clean dataEngineers: Manage data pipelines            |
| **Feature**                      | An individual measurable property or characteristic used as input to a model. [Feature engineering](https://en.wikipedia.org/wiki/Feature_engineering)         | Data Scientists: Design predictive inputsEngineers: Extract features in pipelinesPM/Designers: Understand data needs          |
| **Model**                        | A mathematical representation trained to make predictions. [Microsoft CFT](https://learn.microsoft.com/azure/ai-fundamentals/what-are-models)                  | PM/Designers: Define model requirementsEngineers: Deploy & call modelsData Scientists: Train & evaluate models                |
| **Training**                     | The process of teaching a model from labeled data. [MLflow docs](https://mlflow.org/docs/latest/tracking.html)                                                 | Data Scientists: Core workflowEngineers: Automate training pipelines                                                          |
| **Inference**                    | Running a trained model to generate predictions on new data. [AWS inference](https://aws.amazon.com/machine-learning/what-is-inference/)                       | Business & Ops: Interpret AI outputsEngineers: Manage inference endpointsPM/Designers: Monitor UX performance                 |
| **Prompt**                       | Instruction text guiding generative AI outputs. [OpenAI prompting](https://platform.openai.com/docs/guides/prompting)                                          | PM/Designers: Craft user instructionsEngineers: Optimize prompt structureBusiness & Ops: Write effective prompts              |
| **Token**                        | A unit of text (word piece) processed by an LLM. [OpenAI Tokenizer](https://platform.openai.com/tokenizer)                                                     | Engineers: Manage cost & usageData Scientists: Understand model inputs                                                        |
| **Latency**                      | Time taken for a model to respond to a request. [Latency (engineering)](https://en.wikipedia.org/wiki/Latency_%28engineering%29)                               | Engineers: Optimize performancePM/Designers: Ensure smooth UX                                                                 |
| **Overfitting**                  | When a model learns noise instead of signal and performs poorly on new data. [Overfitting](https://en.wikipedia.org/wiki/Overfitting)                          | Data Scientists: Monitor generalizationEngineers: Validate models in stagingPM/Designers: Assess feature scope                |
| **Bias**                         | Systematic error leading to unfair model outcomes. [AI bias](https://en.wikipedia.org/wiki/Bias_in_machine_learning)                                           | PM/Designers: Ensure fair UXData Scientists: Test fairness metricsSecurity/Compliance: Mitigate ethical risks                 |
| **Large Language Model (LLM)**   | A transformer-based model trained on massive text corpora. [Wikipedia LLM](https://en.wikipedia.org/wiki/Large_language_model)                                 | Engineers: Select appropriate model sizeData Scientists: Understand scale implicationsPM: Assess UX capabilities              |
| **Embedding**                    | A numeric vector representation of text or data items. [Embedding](https://developers.google.com/machine-learning/crash-course/embeddings/what-are-embeddings) | Engineers: Build search/scoring pipelinesData Scientists: Feature representationBusiness & Ops: Concept of similarity queries |
| **Fine-Tuning**                  | Adapting a pretrained model on new data for specific tasks. [OpenAI fine-tuning](https://platform.openai.com/docs/guides/fine-tuning)                          | Data Scientists: Customize modelsEngineers: Implement training pipelinesPM/Designers: Tailor UX for domain needs              |
| **Hyperparameter**               | Configuration settings for model training (e.g., learning rate). [Hyperparameter](https://en.wikipedia.org/wiki/Hyperparameter_%28machine_learning%29)         | Data Scientists: Tune model performanceEngineers: Automate hyperparameter searchPM: Understand training complexity            |
| **Neural Network**               | A series of interconnected nodes mimicking brain neurons for learning patterns. [Neural network](https://en.wikipedia.org/wiki/Artificial_neural_network)      | Data Scientists: Build deep learning modelsEngineers: Deploy scalable architecturesPM: Recognize deep learning use cases      |
| **Drift**                        | Change in data distribution or model performance over time. [Data drift](https://evidently.ai/blog/detecting-data-drift)                                       | Engineers: Set up monitoringData Scientists: Trigger retraining pipelinesPM/Designers: Ensure model reliability               |

---

## 3. Quiz Widget

* **Rotating Questions:** Implement a question pool covering all 16 glossary terms. Each quiz instance randomly selects 3 questions per user session, ensuring across sessions users eventually see every term. After a question is answered, it is marked as used for that user via a simple client‑side cookie or localStorage flag to avoid immediate repeats.
* **Question Bank:** Maintain a JSON file (`questions.json`) in the GitHub repo with entries for each term:

  ```json
  [
    {
      "term": "Inference",
      "question": "Which term describes running a model to get predictions?",
      "options": ["Training", "Inference", "Prompt", "Token"],
      "answer": "Inference",
      "link": "#inference"
    },
    ...
  ]
  ```
* **Session Logic (GitHub Pages):** A small JavaScript script on the static site fetches `questions.json`, filters out questions previously answered by the user, randomly picks 3, and renders them. Upon completion, the script records which terms have been quizzed in localStorage. After all terms have been covered, the script resets the flag to allow a new cycle.

---

## 4. Tracking & Feedback

* **Client-side Quiz Metrics:** Use `localStorage` to record:

  * Which quiz terms a user has completed.
  * Their best quiz score.
  * Number of quiz attempts.
    Display a simple in-app summary (e.g., “You’ve attempted the quiz Y times and your top score is Z/3”).

*This lightweight approach keeps all tracking client-only, fully compatible with GitHub Pages, and gives users direct feedback on their progress without external analytics.* a core AI 101 experience with authoritative links and role‑relevant context, and minimal, easily implementable tracking on a static GitHub Pages site.\* a core AI 101 experience with authoritative links and role‑relevant context, ready for rapid validation.\*
