const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const dbPath = path.join(__dirname, 'tasksdb.db')
const app = express()
app.use(express.json())
let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

    app.listen(3000, () => {
      console.log("Server is running at server 'http://localhost:3000/")
    })
  } catch (error) {
    console.log(`DB Error: ${error.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

app.get('/tasks/', async (request, response) => {
  const getTaskQuery = `
    SELECT * FROM tasks;
  `

  const tasksQuery = await db.all(getTaskQuery)
  response.send(tasksQuery)
})

app.get('/tasks/:taskId', async (request, response) => {
  const {taskId} = request.params
  const getTaskQuery = `
    SELECT * FROM tasks
    WHERE task_id = ${taskId};
  `
  const tasksQuery = await db.get(getTaskQuery)
  response.send(tasksQuery)
})

app.get('/tasks/:taskId/eachtasks/', async (request, response) => {
  const {taskId} = request.params
  const getTaskQuery = `
    SELECT * FROM eachtasks
    WHERE task_id = '${taskId}';
  `

  const tasksQuery = await db.all(getTaskQuery)
  response.send(tasksQuery)
})

app.post('/tasks/', async (request, response) => {
  const {user} = request.body
  const addTaskQuery = `
    INSERT INTO 
      tasks(user)
    VALUES ('${user}');
  `

  const addResponse = await db.run(addTaskQuery)
  const tasksId = addResponse.lastID
  response.send('Successfully added')
})

app.put('/tasks/:taskId', async (request, response) => {
  const {user} = request.body
  const {taskId} = request.params
  const updateTaskQuery = `
    UPDATE tasks
    SET user ='${user}'
    WHERE task_id = ${taskId};
  `
  await db.run(updateTaskQuery)
  response.send('succefully updated')
})

app.post('/tasks/:taskId/eachtasks/', async (request, response) => {
  const {taskName, taskDescription, taskStatus, taskDue} = request.body
  const {taskId} = request.params
  const addTasksQuery = `
    INSERT INTO 
      eachtasks(task_name,task_description,task_status,task_due,task_id)
      VALUES (
        '${taskName}','${taskDescription}','${taskStatus}','${taskDue}',${taskId}
      )
      ;
  `
  const addResponse = await db.run(addTasksQuery)
  const tasksId = addResponse.lastID
  response.send('successfully added')
})

app.put('/tasks/:taskId/eachtasks/:id', async (request, response) => {
  const {id, taskId} = request.params
  const {taskName, taskDescription, taskStatus, taskDue} = request.body
  const updateTaskQuery = `
    UPDATE eachtasks
    SET
      task_name = '${taskName}',
      task_description = '${taskDescription}',
      task_status = '${taskStatus}',
      task_due = '${taskDue}',
      task_id = '${taskId}'
    WHERE 
      id = ${id};
  `

  await db.run(updateTaskQuery)
  response.send('successfully updated')
})

module.exports = app
