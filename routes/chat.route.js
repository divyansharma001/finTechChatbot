import express from 'express'
import chatController from '../controllers/chat.controller.js'

const router = express.Router()

router.route('/chat').post(chatController)

export default router;