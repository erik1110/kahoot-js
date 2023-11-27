const mongoose = require("mongoose")
const Quiz = require("../models/quiz")

const createQuiz = async (req, res) => {
  /**
   * #swagger.tags = ['Quiz']
   * #swagger.summary = '建立題庫 (Create a quiz)'
   */
  /**
  #swagger.parameters['parameter'] = {
    in: 'body',
    description: 'Body',
    schema: {
      'name': 'My quiz',
      'backgroundImage': 'data:image/jpeg;base64,...',
      'description': 'This is my quiz.',
      'creatorName': 'Erik',
      'pointsPerQuestion': 5,
      'isPublic': true,
      'tags': ['test1'],
      'likesCount': [],
      'questionList': [
        {
          'questionType': 'Quiz',
          'pointType': 'Double',
          'answerTime': 10,
          'backgroundImage': '',
          'question': 'Which planet is known as the Red Planet?',
          'answerList': [
            {
              'name': 'a',
              'body': 'Venus',
              'isCorrect': false,
            },
          ],
        }
      ]
    }
  }
  #swagger.security=[{"Bearer": []}],
  #swagger.responses[200] = {
    description: 'OK',
  }    
  */
  const {
    name,
    backgroundImage,
    description,
    creatorName,
    pointsPerQuestion,
    isPublic,
    tags,
    likesCount,
    questionList,
  } = req.body
  const quiz = new Quiz({
    name,
    backgroundImage,
    description,
    creatorId: req.user.id,
    creatorName,
    pointsPerQuestion,
    numberOfQuestions: questionList.length,
    isPublic,
    tags,
    likesCount,
    questionList,
    dateCreated: new Date().toISOString(),
  })

  try {
    const newQuiz = await quiz.save()
    res.status(201).json(newQuiz)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const getQuizes = async (req, res) => {
  /**
   * #swagger.tags = ['Quiz']
   * #swagger.summary = '取得全部題庫 (Get all quizzes)'
   */
  /**
  #swagger.security=[{"Bearer": []}],
  #swagger.responses[200] = {
    description: 'OK',
  }    
  */
  try {
    const quizes = await Quiz.find()
    res.status(200).send(quizes)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getPublicQuizes = async (req, res) => {
  /**
   * #swagger.tags = ['Quiz']
   * #swagger.summary = '取得公開題庫 (Get public quizzes)'
   */
  /**
  #swagger.security=[{"Bearer": []}],
  #swagger.responses[200] = {
    description: 'OK',
  }    
  */
  const { page } = req.query
  try {
    const LIMIT = 6
    const startIndex = (Number(page) - 1) * LIMIT // get the starting index of every page

    const total = await Quiz.find({ isPublic: true }).countDocuments({})
    const quizes = await Quiz.find({ isPublic: true })
      .sort({ _id: -1 }) // sort from the newest
      .limit(LIMIT)
      .skip(startIndex) // skip first <startIndex> quizes
    // const quizes = await Quiz.find({ isPublic: true })
    res.status(200).send({
      data: quizes,
      currentPage: Number(page),
      numberOfPages: Math.ceil(total / LIMIT),
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getTeacherQuizes = async (req, res) => {
  /**
   * #swagger.tags = ['Quiz']
   * #swagger.summary = '取得老師的題庫 (Get the teacher quizzes)'
   */
  /**
  #swagger.security=[{"Bearer": []}],
  #swagger.responses[200] = {
    description: 'OK',
  }    
  */
  let teacherId = req.params.teacherId
  try {
    const quizes = await Quiz.find({ creatorId: teacherId })
    res.status(200).send(quizes)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getQuiz = async (req, res) => {
  /**
   * #swagger.tags = ['Quiz']
   * #swagger.summary = '取得特定題庫 (Get the quiz)'
   */
  /**
  #swagger.security=[{"Bearer": []}],
  #swagger.responses[200] = {
    description: 'OK',
  }    
  */
  let quiz
  try {
    quiz = await Quiz.findById(req.params.id)
    if (quiz == null) {
      return res.status(404).json({ message: "Quiz not found" })
    }
    res.status(200).json(quiz)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const deleteQuiz = async (req, res) => {
  /**
   * #swagger.tags = ['Quiz']
   * #swagger.summary = '刪除題庫 (Delete the quiz)'
   */
  /**
  #swagger.security=[{"Bearer": []}],
  #swagger.responses[200] = {
    description: 'OK',
  }    
  */
  const { id } = req.params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).send(`No quiz with id: ${id}`)
  }

  try {
    await Quiz.findByIdAndRemove(id)
    res.json({ message: "Quiz deleted succesfully" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const updateQuiz = async (req, res) => {
  /**
   * #swagger.tags = ['Quiz']
   * #swagger.summary = '更新題庫 (Update the quiz)'
   */
  /**
  #swagger.security=[{"Bearer": []}],
  #swagger.responses[200] = {
    description: 'OK',
  }    
  */
  const { id } = req.params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).send(`No quiz with id: ${id}`)
  }

  const {
    name,
    backgroundImage,
    description,
    pointsPerQuestion,
    isPublic,
    tags,
    questionList,
  } = req.body
  const quiz = new Quiz({
    _id: id,
    name,
    backgroundImage,
    description,
    pointsPerQuestion,
    numberOfQuestions: questionList.length,
    isPublic,
    tags,
    questionList,
    dateCreated: new Date().toISOString(),
  })

  try {
    const updatedQuiz = await Quiz.findByIdAndUpdate(id, quiz, { new: true })
    res.json(updatedQuiz)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const addQuestion = async (req, res) => {
  /**
   * #swagger.tags = ['Quiz']
   * #swagger.summary = '新增問題 (Add questions)'
   */
  /**
  #swagger.security=[{"Bearer": []}],
  #swagger.responses[200] = {
    description: 'OK',
  }    
  */
  const { quizId } = req.params
  const {
    questionType,
    question,
    pointType,
    answerTime,
    answerList,
    correctAnswersList,
  } = req.body
  let quiz
  try {
    quiz = await Quiz.findById(quizId)
    if (quiz == null) {
      return res.status(404).json({ message: "Quiz not found" })
    }
    quiz.questionList.push({
      questionType,
      question,
      pointType,
      answerTime,
      answerList,
      correctAnswersList,
    })
    quiz.numberOfQuestions += 1
    const updatedQuiz = await quiz.save()
    res.send(updatedQuiz)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const getQuestions = async (req, res) => {
  /**
   * #swagger.tags = ['Quiz']
   * #swagger.summary = '取得全部問題 (Get all questions)'
   */
  /**
  #swagger.security=[{"Bearer": []}],
  #swagger.responses[200] = {
    description: 'OK',
  }    
  */
  const { quizId } = req.params
  try {
    const quiz = await Quiz.findById(quizId)
    if (quiz == null) {
      return res.status(404).json({ message: "Quiz not found" })
    }
    res.status(200).send(quiz.questionList)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getQuestion = async (req, res) => {
  /**
   * #swagger.tags = ['Quiz']
   * #swagger.summary = '取得特定問題 (Get the question by questionId)'
   */
  /**
  #swagger.security=[{"Bearer": []}],
  #swagger.responses[200] = {
    description: 'OK',
  }    
  */
  const { quizId, questionId } = req.params
  try {
    const quiz = await Quiz.findById(quizId)
    if (quiz == null) {
      return res.status(404).json({ message: "Quiz not found" })
    }
    const question = quiz.questionList.id(questionId)
    res.json(question)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const deleteQuestion = async (req, res) => {
  /**
   * #swagger.tags = ['Quiz']
   * #swagger.summary = '刪除問題 (Delete the question by questionId)'
   */
  /**
  #swagger.security=[{"Bearer": []}],
  #swagger.responses[200] = {
    description: 'OK',
  }    
  */
  const { quizId, questionId } = req.params
  if (!mongoose.Types.ObjectId.isValid(quizId)) {
    return res.status(404).send(`No quiz with id: ${quizId}`)
  }
  if (!mongoose.Types.ObjectId.isValid(questionId)) {
    return res.status(404).send(`No question with id: ${questionId}`)
  }
  const quiz = await Quiz.findById(quizId)

  try {
    let questionIndex = quiz.questionList.findIndex(
      (obj) => obj._id == questionId
    )
    quiz.questionList.splice(questionIndex, 1)
    quiz.numberOfQuestions -= 1
    await Quiz.findByIdAndUpdate(quizId, quiz, {
      new: true,
    })
    res.json({ message: "Question deleted succesfully" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const updateQuestion = async (req, res) => {
  /**
   * #swagger.tags = ['Quiz']
   * #swagger.summary = '更新問題 (Update the question by questionId)'
   */
  /**
  #swagger.security=[{"Bearer": []}],
  #swagger.responses[200] = {
    description: 'OK',
  }    
  */
  const { quizId, questionId } = req.params
  if (!mongoose.Types.ObjectId.isValid(quizId)) {
    return res.status(404).send(`No quiz with id: ${quizId}`)
  }
  if (!mongoose.Types.ObjectId.isValid(questionId)) {
    return res.status(404).send(`No question with id: ${questionId}`)
  }

  const {
    questionType,
    question,
    pointType,
    answerTime,
    answerList,
    correctAnswersList,
  } = req.body
  let quiz

  try {
    quiz = await Quiz.findById(quizId)
    if (quiz == null) {
      return res.status(404).json({ message: "Quiz not found" })
    }
    let questionIndex = quiz.questionList.findIndex(
      (obj) => obj._id == questionId
    )
    quiz.questionList[questionIndex] = {
      _id: questionId,
      questionType,
      question,
      pointType,
      answerTime,
      answerList,
      correctAnswer,
      correctAnswersList,
    }
    const updatedQuiz = await Quiz.findByIdAndUpdate(quizId, quiz, {
      new: true,
    })
    res.send(updatedQuiz)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const likeQuiz = async (req, res) => {
  /**
   * #swagger.tags = ['Quiz']
   * #swagger.summary = '按讚題庫 (Like the Quiz)'
   */
  /**
  #swagger.security=[{"Bearer": []}],
  #swagger.responses[200] = {
    description: 'OK',
  }    
  */
  const { id } = req.params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).send(`No quiz with id: ${id}`)
  }

  try {
    const quiz = await Quiz.findById(id)
    const index = quiz.likesCount.findIndex((id) => id === String(req.user.id))
    if (index === -1) {
      quiz.likesCount.push(req.user.id)
    } else {
      quiz.likesCount = quiz.likesCount.filter( 
        (id) => id !== String(req.user.id)
      )
    }
    const updatedQuiz = await Quiz.findByIdAndUpdate(id, quiz, { new: true })
    res.json(updatedQuiz)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const getQuizesBySearch = async (req, res) => {
  /**
   * #swagger.tags = ['Quiz']
   * #swagger.summary = '題庫搜尋 (Search the Quizzes)'
   */
  /**
  #swagger.security=[{"Bearer": []}],
  #swagger.responses[200] = {
    description: 'OK',
  }    
  */
  const { searchQuery, tags } = req.query

  try {
    //i -> ignore case, like ii, Ii, II
    const name = new RegExp(searchQuery, "i")

    const quizes = await Quiz.find({
      isPublic: true,
      $or: [{ name }, { tags: { $in: tags.split(",") } }],
    })

    res.status(200).send(quizes)
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

const commentQuiz = async (req, res) => {
  /**
   * #swagger.tags = ['Quiz']
   * #swagger.summary = '評論題庫 (Comment the Quiz)'
   */
  /**
  #swagger.security=[{"Bearer": []}],
  #swagger.responses[200] = {
    description: 'OK',
  }    
  */
  const { id } = req.params
  const { comment } = req.body

  try {
    const quiz = await Quiz.findById(id)
    quiz.comments.push(comment)
    const updatedQuiz = await Quiz.findByIdAndUpdate(id, quiz, {
      new: true,
    })
    res.status(200).send(updatedQuiz)
  } catch (e) {
    res.status(400).json({ message: error.message })
  }
}

module.exports = {
  createQuiz,
  getQuizes,
  getPublicQuizes,
  getTeacherQuizes,
  getQuizesBySearch,
  getQuiz,
  deleteQuiz,
  updateQuiz,
  addQuestion,
  getQuestions,
  getQuestion,
  updateQuestion,
  deleteQuestion,
  likeQuiz,
  commentQuiz,
}
