/**
 * score.js - Evaluates category and total psychometric scores
 * Handles score mapping, weighting, and candidate recommendations.
 */

const ScoreManager = {
  /**
   * Calculates scores per category and final score based on selected answers
   * @param {Object} answers Map of question ID to selected option index
   * @param {Array} questions Full list of questions
   * @returns {Object} { scores: { kepribadian: X, logika: Y, ... }, totalScore: Z, category: "..." }
   */
  calculate(answers, questions) {
    const categoryTotals = {
      kepribadian: 0,
      logika: 0,
      copywriting: 0,
      kreativitas: 0,
      analisa_data: 0
    };

    // Keep track of counts (expecting 10 per category)
    const categoryCounts = {
      kepribadian: 0,
      logika: 0,
      copywriting: 0,
      kreativitas: 0,
      analisa_data: 0
    };

    questions.forEach(question => {
      const cat = question.category;
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;

      const selectedOptionIndex = answers[question.id];
      if (selectedOptionIndex !== undefined && selectedOptionIndex !== null) {
        const option = question.options[selectedOptionIndex];
        if (option) {
          categoryTotals[cat] += option.score;
        }
      }
    });

    // Each category score is out of 100 (assuming 10 questions max 10 points each)
    // We normalize to out of 100 just in case count is not exactly 10, but here it is.
    const normalizedScores = {};
    Object.keys(categoryTotals).forEach(cat => {
      const count = categoryCounts[cat] || 10;
      const maxScore = count * 10;
      normalizedScores[cat] = Math.round((categoryTotals[cat] / maxScore) * 100);
    });

    // Total score is weighted equally (20% each) which is the simple average
    const totalScore = Math.round(
      (normalizedScores.kepribadian +
       normalizedScores.logika +
       normalizedScores.copywriting +
       normalizedScores.kreativitas +
       normalizedScores.analisa_data) / 5
    );

    const recommendation = this.getRecommendation(totalScore);

    return {
      scores: normalizedScores,
      totalScore: totalScore,
      category: recommendation
    };
  },

  /**
   * Maps score to category recommendation
   * @param {number} score 0 - 100
   * @returns {string} Recommendation category
   */
  getRecommendation(score) {
    if (score >= 90) return 'Sangat Direkomendasikan';
    if (score >= 80) return 'Direkomendasikan';
    if (score >= 70) return 'Dipertimbangkan';
    return 'Belum Sesuai';
  },

  /**
   * Get CSS color class for the recommendation badge
   * @param {string} category 
   * @returns {string} Bootstrap color class
   */
  getRecommendationBadgeClass(category) {
    switch (category) {
      case 'Sangat Direkomendasikan':
        return 'bg-success text-white';
      case 'Direkomendasikan':
        return 'bg-primary text-white';
      case 'Dipertimbangkan':
        return 'bg-warning text-dark';
      case 'Belum Sesuai':
        return 'bg-danger text-white';
      default:
        return 'bg-secondary text-white';
    }
  }
};
