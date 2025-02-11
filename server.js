import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'

dotenv.config()

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/happyThoughts"
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.Promise = Promise

const port = process.env.PORT || 8080
const app = express()

app.use(cors())
app.use(express.json())

app.use((req, res, next) => {
  if (mongoose.connection.readyState === 1) {
    next()
  } else {
    res.status(503).json({ error: 'Service unavaliable' })
  }
})

const thoughtSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 140
  },
  hearts: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date, 
    default: Date.now
  }
})

const Thought = mongoose.model('Thought', thoughtSchema)

// Start defining your routes here
app.get('/', (req, res) => {
  res.send('Hello world')
})
app.get('/thoughts', async (req, res) => {
  try {
    const thoughts = await Thought.find()
      .sort({ createdAt: 'desc' })
      // The DESC command is used to sort the data returned in descending order.
      .limit(20)
      .exec()
      // executes a search for a match in a specified string
    res.json(thoughts)
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Could not get thoughts',
      errors: error.errors
    })
  }
})

app.post('/thoughts', async (req, res) => {
  try {
    const newThought = await new Thought(req.body).save()
    res.json(newThought)
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Could not save new thought',
      errors: error.errors
    })
  }
})

app.post('/thoughts/:thoughtId/like', async (req, res) => {
  const { thoughtId } = req.params
  try {
    const like = await Thought.findOneAndUpdate(
      { _id: thoughtId },
      { $inc: { hearts: 1 } },
      // The $inc operator increments a field by a specified value
      { new: true }
    )
    res.json(like)
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Could not like this post',
      errors: error.errors
    })
  }
})
// Start the server
app.listen(port, () => {
  // eslint-disable-next-line
  console.log(`Server running on http://localhost:${port}`)
})
