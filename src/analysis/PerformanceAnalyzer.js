/**
 * Performance Analyzer Class
 * 
 * This class provides core academic performance analysis functionality for students.
 * It performs non-AI-powered statistical analysis of student assessment data.
 * 
 * Note: For AI-powered analysis features (such as predictive modeling, natural language
 * insights, or advanced pattern recognition), this data should be sent to a separate
 * machine learning model API. This class focuses on fundamental statistical analysis
 * that can be computed directly from the assessment data.
 */

class PerformanceAnalyzer {
  constructor() {
    // Initialize any configuration or constants
    this.analysisVersion = '1.0.0';
    this.supportedAssessmentTypes = ['quiz', 'test', 'homework', 'project', 'midterm', 'final'];
  }

  /**
   * Analyze a student's academic performance based on assessment data
   * @param {string} studentId - The unique identifier for the student
   * @param {Array<Object>} assessmentData - Array of assessment records for the student
   * @returns {Object} Structured analysis results in JSON format
   */
  analyzeStudent(studentId, assessmentData) {
    try {
      // Validate input parameters
      if (!studentId || typeof studentId !== 'string') {
        throw new Error('Student ID is required and must be a valid string');
      }

      if (!Array.isArray(assessmentData) || assessmentData.length === 0) {
        throw new Error('Assessment data is required and must be a non-empty array');
      }

      // Validate assessment data structure
      this._validateAssessmentData(assessmentData);

      // Perform core analysis
      const subjectAverages = this._calculateSubjectAverages(assessmentData);
      const subjectPerformance = this._identifySubjectPerformance(subjectAverages);
      const trendAnalysis = this._calculateTrendAnalysis(assessmentData);
      const overallStats = this._calculateOverallStatistics(assessmentData);
      const assessmentTypeAnalysis = this._analyzeByAssessmentType(assessmentData);

      // Compile comprehensive analysis results
      const analysisResults = {
        studentId: studentId,
        analysisDate: new Date().toISOString(),
        analysisVersion: this.analysisVersion,
        
        // Subject-based analysis
        subjectAnalysis: {
          averageScores: subjectAverages,
          highestPerformingSubject: subjectPerformance.highest,
          lowestPerformingSubject: subjectPerformance.lowest,
          subjectCount: Object.keys(subjectAverages).length
        },
        
        // Trend analysis
        trendAnalysis: trendAnalysis,
        
        // Overall performance statistics
        overallStatistics: overallStats,
        
        // Assessment type breakdown
        assessmentTypeAnalysis: assessmentTypeAnalysis,
        
        // Summary insights
        summary: this._generateSummaryInsights(subjectAverages, trendAnalysis, overallStats),
        
        // Metadata
        metadata: {
          totalAssessments: assessmentData.length,
          dateRange: this._getDateRange(assessmentData),
          dataQuality: this._assessDataQuality(assessmentData)
        }
      };

      return analysisResults;

    } catch (error) {
      return {
        success: false,
        error: error.message,
        studentId: studentId,
        analysisDate: new Date().toISOString()
      };
    }
  }

  /**
   * Calculate average scores per subject
   * @param {Array<Object>} assessmentData - Assessment records
   * @returns {Object} Subject averages
   * @private
   */
  _calculateSubjectAverages(assessmentData) {
    const subjectScores = {};

    assessmentData.forEach(assessment => {
      const subject = assessment.subject;
      const score = parseFloat(assessment.score);

      if (!subjectScores[subject]) {
        subjectScores[subject] = [];
      }
      subjectScores[subject].push(score);
    });

    // Calculate averages for each subject
    const subjectAverages = {};
    Object.keys(subjectScores).forEach(subject => {
      const scores = subjectScores[subject];
      const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      subjectAverages[subject] = {
        average: Math.round(average * 100) / 100, // Round to 2 decimal places
        assessmentCount: scores.length,
        highestScore: Math.max(...scores),
        lowestScore: Math.min(...scores)
      };
    });

    return subjectAverages;
  }

  /**
   * Identify highest and lowest performing subjects
   * @param {Object} subjectAverages - Subject average scores
   * @returns {Object} Performance analysis
   * @private
   */
  _identifySubjectPerformance(subjectAverages) {
    const subjects = Object.keys(subjectAverages);
    
    if (subjects.length === 0) {
      return { highest: null, lowest: null };
    }

    let highest = { subject: subjects[0], average: subjectAverages[subjects[0]].average };
    let lowest = { subject: subjects[0], average: subjectAverages[subjects[0]].average };

    subjects.forEach(subject => {
      const average = subjectAverages[subject].average;
      if (average > highest.average) {
        highest = { subject, average };
      }
      if (average < lowest.average) {
        lowest = { subject, average };
      }
    });

    return { highest, lowest };
  }

  /**
   * Calculate trend analysis between different assessment types
   * @param {Array<Object>} assessmentData - Assessment records
   * @returns {Object} Trend analysis results
   * @private
   */
  _calculateTrendAnalysis(assessmentData) {
    // Group assessments by type
    const assessmentsByType = {};
    assessmentData.forEach(assessment => {
      const type = assessment.assessmentType || 'unknown';
      if (!assessmentsByType[type]) {
        assessmentsByType[type] = [];
      }
      assessmentsByType[type].push(parseFloat(assessment.score));
    });

    // Calculate average for each assessment type
    const typeAverages = {};
    Object.keys(assessmentsByType).forEach(type => {
      const scores = assessmentsByType[type];
      typeAverages[type] = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    });

    // Calculate trends between assessment types
    const trends = {};
    const types = Object.keys(typeAverages);
    
    for (let i = 0; i < types.length - 1; i++) {
      for (let j = i + 1; j < types.length; j++) {
        const type1 = types[i];
        const type2 = types[j];
        const change = typeAverages[type2] - typeAverages[type1];
        const percentChange = (change / typeAverages[type1]) * 100;
        
        trends[`${type1}_to_${type2}`] = {
          change: Math.round(change * 100) / 100,
          percentChange: Math.round(percentChange * 100) / 100,
          direction: change > 0 ? 'improvement' : change < 0 ? 'decline' : 'stable'
        };
      }
    }

    return {
      assessmentTypeAverages: typeAverages,
      trends: trends,
      improvementAreas: this._identifyImprovementAreas(typeAverages),
      consistencyScore: this._calculateConsistencyScore(Object.values(typeAverages))
    };
  }

  /**
   * Calculate overall performance statistics
   * @param {Array<Object>} assessmentData - Assessment records
   * @returns {Object} Overall statistics
   * @private
   */
  _calculateOverallStatistics(assessmentData) {
    const scores = assessmentData.map(assessment => parseFloat(assessment.score));
    
    const sum = scores.reduce((total, score) => total + score, 0);
    const average = sum / scores.length;
    const sortedScores = [...scores].sort((a, b) => a - b);
    
    // Calculate median
    const median = sortedScores.length % 2 === 0
      ? (sortedScores[sortedScores.length / 2 - 1] + sortedScores[sortedScores.length / 2]) / 2
      : sortedScores[Math.floor(sortedScores.length / 2)];

    // Calculate standard deviation
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - average, 2), 0) / scores.length;
    const standardDeviation = Math.sqrt(variance);

    return {
      average: Math.round(average * 100) / 100,
      median: Math.round(median * 100) / 100,
      highest: Math.max(...scores),
      lowest: Math.min(...scores),
      standardDeviation: Math.round(standardDeviation * 100) / 100,
      range: Math.max(...scores) - Math.min(...scores),
      totalAssessments: scores.length
    };
  }

  /**
   * Analyze performance by assessment type
   * @param {Array<Object>} assessmentData - Assessment records
   * @returns {Object} Assessment type analysis
   * @private
   */
  _analyzeByAssessmentType(assessmentData) {
    const typeAnalysis = {};

    assessmentData.forEach(assessment => {
      const type = assessment.assessmentType || 'unknown';
      const score = parseFloat(assessment.score);

      if (!typeAnalysis[type]) {
        typeAnalysis[type] = {
          scores: [],
          subjects: new Set()
        };
      }

      typeAnalysis[type].scores.push(score);
      typeAnalysis[type].subjects.add(assessment.subject);
    });

    // Calculate statistics for each type
    Object.keys(typeAnalysis).forEach(type => {
      const scores = typeAnalysis[type].scores;
      const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      
      typeAnalysis[type] = {
        average: Math.round(average * 100) / 100,
        count: scores.length,
        highest: Math.max(...scores),
        lowest: Math.min(...scores),
        subjects: Array.from(typeAnalysis[type].subjects)
      };
    });

    return typeAnalysis;
  }

  /**
   * Validate assessment data structure
   * @param {Array<Object>} assessmentData - Assessment records to validate
   * @throws {Error} If data structure is invalid
   * @private
   */
  _validateAssessmentData(assessmentData) {
    const requiredFields = ['score', 'subject'];
    
    assessmentData.forEach((assessment, index) => {
      requiredFields.forEach(field => {
        if (!(field in assessment)) {
          throw new Error(`Assessment at index ${index} is missing required field: ${field}`);
        }
      });

      // Validate score is numeric
      const score = parseFloat(assessment.score);
      if (isNaN(score)) {
        throw new Error(`Assessment at index ${index} has invalid score: ${assessment.score}`);
      }

      // Validate score range (assuming 0-100 scale)
      if (score < 0 || score > 100) {
        throw new Error(`Assessment at index ${index} has score outside valid range (0-100): ${score}`);
      }
    });
  }

  /**
   * Identify areas needing improvement based on assessment type performance
   * @param {Object} typeAverages - Average scores by assessment type
   * @returns {Array<string>} List of improvement areas
   * @private
   */
  _identifyImprovementAreas(typeAverages) {
    const threshold = 70; // Consider below 70% as needing improvement
    return Object.keys(typeAverages)
      .filter(type => typeAverages[type] < threshold)
      .sort((a, b) => typeAverages[a] - typeAverages[b]);
  }

  /**
   * Calculate consistency score based on variation in performance
   * @param {Array<number>} averages - Array of average scores
   * @returns {number} Consistency score (0-100, higher is more consistent)
   * @private
   */
  _calculateConsistencyScore(averages) {
    if (averages.length < 2) return 100;
    
    const mean = averages.reduce((sum, avg) => sum + avg, 0) / averages.length;
    const variance = averages.reduce((sum, avg) => sum + Math.pow(avg - mean, 2), 0) / averages.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Convert to 0-100 scale (lower standard deviation = higher consistency)
    const consistencyScore = Math.max(0, 100 - (standardDeviation * 2));
    return Math.round(consistencyScore * 100) / 100;
  }

  /**
   * Generate summary insights from analysis
   * @param {Object} subjectAverages - Subject performance data
   * @param {Object} trendAnalysis - Trend analysis data
   * @param {Object} overallStats - Overall statistics
   * @returns {Object} Summary insights
   * @private
   */
  _generateSummaryInsights(subjectAverages, trendAnalysis, overallStats) {
    const insights = [];
    
    // Overall performance insight
    if (overallStats.average >= 90) {
      insights.push('Excellent overall academic performance');
    } else if (overallStats.average >= 80) {
      insights.push('Strong overall academic performance');
    } else if (overallStats.average >= 70) {
      insights.push('Satisfactory overall academic performance');
    } else {
      insights.push('Academic performance needs improvement');
    }

    // Consistency insight
    if (trendAnalysis.consistencyScore >= 80) {
      insights.push('Demonstrates consistent performance across assessment types');
    } else if (trendAnalysis.consistencyScore >= 60) {
      insights.push('Shows moderate consistency in performance');
    } else {
      insights.push('Performance varies significantly across different assessment types');
    }

    // Subject-specific insights
    const subjectCount = Object.keys(subjectAverages).length;
    if (subjectCount > 1) {
      insights.push(`Performance tracked across ${subjectCount} subjects`);
    }

    return {
      insights: insights,
      overallGrade: this._calculateLetterGrade(overallStats.average),
      performanceLevel: this._getPerformanceLevel(overallStats.average),
      recommendationFlag: overallStats.average < 70 ? 'needs_intervention' : 'on_track'
    };
  }

  /**
   * Get date range from assessment data
   * @param {Array<Object>} assessmentData - Assessment records
   * @returns {Object} Date range information
   * @private
   */
  _getDateRange(assessmentData) {
    const dates = assessmentData
      .filter(assessment => assessment.date)
      .map(assessment => new Date(assessment.date))
      .sort((a, b) => a - b);

    return dates.length > 0 ? {
      earliest: dates[0].toISOString(),
      latest: dates[dates.length - 1].toISOString(),
      span: dates.length > 1 ? Math.ceil((dates[dates.length - 1] - dates[0]) / (1000 * 60 * 60 * 24)) : 0
    } : null;
  }

  /**
   * Assess data quality
   * @param {Array<Object>} assessmentData - Assessment records
   * @returns {Object} Data quality assessment
   * @private
   */
  _assessDataQuality(assessmentData) {
    const totalRecords = assessmentData.length;
    const recordsWithDates = assessmentData.filter(a => a.date).length;
    const recordsWithType = assessmentData.filter(a => a.assessmentType).length;
    
    return {
      completeness: Math.round((recordsWithDates / totalRecords) * 100),
      typeSpecification: Math.round((recordsWithType / totalRecords) * 100),
      overallQuality: Math.round(((recordsWithDates + recordsWithType) / (totalRecords * 2)) * 100)
    };
  }

  /**
   * Calculate letter grade from numeric average
   * @param {number} average - Numeric average score
   * @returns {string} Letter grade
   * @private
   */
  _calculateLetterGrade(average) {
    if (average >= 97) return 'A+';
    if (average >= 93) return 'A';
    if (average >= 90) return 'A-';
    if (average >= 87) return 'B+';
    if (average >= 83) return 'B';
    if (average >= 80) return 'B-';
    if (average >= 77) return 'C+';
    if (average >= 73) return 'C';
    if (average >= 70) return 'C-';
    if (average >= 67) return 'D+';
    if (average >= 65) return 'D';
    return 'F';
  }

  /**
   * Get performance level description
   * @param {number} average - Numeric average score
   * @returns {string} Performance level
   * @private
   */
  _getPerformanceLevel(average) {
    if (average >= 90) return 'Advanced';
    if (average >= 80) return 'Proficient';
    if (average >= 70) return 'Developing';
    return 'Beginning';
  }
}

export { PerformanceAnalyzer };