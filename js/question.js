/**
 * question.js - Question Bank & Selection Manager
 * Handles loading, shuffling, session saving of test questions, and candidate answers.
 */

const QuestionManager = {
  questionsKey: 'web_psikotes_shuffled_questions',
  answersKey: 'web_psikotes_candidate_answers',

  /**
   * Shuffles an array using Fisher-Yates algorithm
   */
  shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  },

  /**
   * Loads questions. Restores shuffled array from sessionStorage if exists, otherwise
   * fetches questions, shuffles, and stores them.
   * @returns {Promise<Array>} List of 50 questions
   */
  async loadQuestions() {
    const stored = sessionStorage.getItem(this.questionsKey);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Error parsing stored questions", e);
      }
    }

    try {
      // Fetch questions from JSON
      const response = await fetch('data/questions.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const rawQuestions = await response.json();
      
      // Shuffle the 50 questions
      const shuffled = this.shuffle(rawQuestions);
      
      // Save shuffled list to sessionStorage to maintain consistency across reloads
      sessionStorage.setItem(this.questionsKey, JSON.stringify(shuffled));
      return shuffled;
    } catch (error) {
      console.error("Failed to load questions", error);
      // Fallback: If fetch fails, we can throw error or return empty array.
      // Since fetch can fail if opened from file:// protocol, let's provide a mechanism.
      // But we will run a server or instruct standard static server execution.
      throw error;
    }
  },

  /**
   * Save a single answer to sessionStorage
   * @param {string} questionId 
   * @param {number} optionIndex 
   */
  saveAnswer(questionId, optionIndex) {
    const answers = this.getAnswers();
    answers[questionId] = optionIndex;
    sessionStorage.setItem(this.answersKey, JSON.stringify(answers));
  },

  /**
   * Retrieve all saved answers
   * @returns {Object} Map of questionId -> optionIndex
   */
  getAnswers() {
    const stored = sessionStorage.getItem(this.answersKey);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return {};
      }
    }
    return {};
  },

  /**
   * Clear session test data (questions and answers)
   */
  clearSessionState() {
    sessionStorage.removeItem(this.questionsKey);
    sessionStorage.removeItem(this.answersKey);
  }
};
