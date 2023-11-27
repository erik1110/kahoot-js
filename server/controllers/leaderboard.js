const mongoose = require("mongoose")
const Leaderboard = require("../models/leaderboard")
const Quiz = require("../models/quiz")
const Game = require("../models/game")

const createLeaderboard = async (req, res) => {
  /**
   * #swagger.tags = ['Leaderboard']
   * #swagger.summary = '建立排行榜 (Create a Leaderboard)'
   */
  /**
  #swagger.parameters['parameter'] = {
    in: 'body',
    description: 'Body',
    schema: {
      'gameId': '6538974895cace142e42c86a',
      'playerResultList': [],
    }
  }
  #swagger.security=[{"Bearer": []}],
  #swagger.responses[200] = {
    description: 'OK',
  }    
  */
  const { gameId, playerResultList } = req.body

  let game = await Game.findById(gameId)
  let quiz = await Quiz.findById(game.quizId)

  const leaderboard = new Leaderboard({
    gameId,
    playerResultList,
  })

  quiz.questionList.forEach((question) => {
    leaderboard.questionLeaderboard.push({
      questionIndex: question.questionIndex,
      questionResultList: [],
    })
    leaderboard.currentLeaderboard.push({
      questionIndex: question.questionIndex,
      leaderboardList: [],
    })
  })

  try {
    const newLeaderboard = await leaderboard.save()
    res.status(201).json(newLeaderboard)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const getLeaderboard = async (req, res) => {
  /**
   * #swagger.tags = ['Leaderboard']
   * #swagger.summary = '取得排行榜 (Get a Leaderboard)'
   */
  /**
  #swagger.security=[{"Bearer": []}],
  #swagger.responses[200] = {
    description: 'OK',
  }    
  */
  let leaderboard
  try {
    leaderboard = await Leaderboard.findById(req.params.id)
    if (leaderboard == null) {
      return res.status(404).json({ message: "Leaderboard not found" })
    }
    res.json(leaderboard)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const addPlayerResult = async (req, res) => {
  /**
   * #swagger.tags = ['Leaderboard']
   * #swagger.summary = '新增玩家結果 (Add a player result)'
   */
  /**
  #swagger.security=[{"Bearer": []}],
  #swagger.responses[200] = {
    description: 'OK',
  }    
  */
  const { leaderboardId } = req.params
  const { playerResultId } = req.body
  let leaderboard

  try {
    leaderboard = await Leaderboard.findById(leaderboardId)
    leaderboard.playerResultList.push(playerResultId)
    const newLeaderboard = await leaderboard.save()
    res.status(201).json(newLeaderboard)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const updateQuestionLeaderboard = async (req, res) => {
  /**
   * #swagger.tags = ['Leaderboard']
   * #swagger.summary = '更新問題排行榜 (Update questions leaderboard)'
   */
  /**
  #swagger.security=[{"Bearer": []}],
  #swagger.responses[200] = {
    description: 'OK',
  }    
  */
  const { leaderboardId } = req.params
  const { questionIndex, playerId, playerPoints } = req.body
  let leaderboard

  try {
    leaderboard = await Leaderboard.findById(leaderboardId)
    leaderboard.questionLeaderboard[questionIndex - 1].questionResultList.push({
      playerId,
      playerPoints,
    })

    const newLeaderboard = await leaderboard.save()
    res.status(201).json(newLeaderboard)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const updateCurrentLeaderboard = async (req, res) => {
  /**
   * #swagger.tags = ['Leaderboard']
   * #swagger.summary = '更新排行榜 (Update current leaderboard)'
   */
  /**
  #swagger.security=[{"Bearer": []}],
  #swagger.responses[200] = {
    description: 'OK',
  }    
  */
  const { leaderboardId } = req.params
  const { questionIndex, playerId, playerCurrentScore } = req.body
  let leaderboard

  try {
    leaderboard = await Leaderboard.findById(leaderboardId)
    leaderboard.currentLeaderboard[questionIndex - 1].leaderboardList.push({
      playerId,
      playerCurrentScore,
    })

    const newLeaderboard = await leaderboard.save()
    res.status(201).json(newLeaderboard)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

module.exports = {
  createLeaderboard,
  getLeaderboard,
  addPlayerResult,
  updateQuestionLeaderboard,
  updateCurrentLeaderboard,
}
