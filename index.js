const express = require('express')
const app = express()
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
app.use(express.json())

const dbPath = path.join(__dirname, 'tasksdb.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at localhost://3000')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

app.get('/tasks/', async (request, response) => {
  const getTaskQuery = `
        SELECT *
        FROM tasks
        `
  const taskQuery = await db.all(getTaskQuery)
  response.send(taskQuery)
})

app.get('/tasks/:id/', async (request, response) => {
  const {id} = request.params
  const getTasksQuery = `
    SELECT *
    FROM tasks
    WHERE
      id = ${id};
  `
  const taskQuery = await db.get(getTasksQuery)
  response.send(taskQuery)
})

app.post('/tasks/', async (request, response) => {
  const {user,taskName ,taskDescription,taskStatus,taskDue} = request.body;

  const getTaskQuery = `
    INSERT INTO 
      district (user,task_name,task_description,task_status,task_due)
    VALUES
      (
        
        '${user}',
        '${taskName}',
        '${taskDescription}',
        '${taskStatus}',
        '${taskDue}'
      );

  `

  const taskQuery = await db.run(getTaskQuery)

  response.send('District Successfully Added')
})


app.put('/tasks/:id/', async (request, response) => {
  const {id} = request.params

  const {user,taskName ,taskDescription,taskStatus,taskDue} = request.body

  const taskQuery = `
    UPDATE 
      tasks
    SET 
      user = '${user}',
      task_name = '${taskName}',
      task_description = '${taskDescription}',
      task_status = '${taskStatus}',
      task_due = '${taskDue}'
    WHERE 
      id = ${id};
  `;

  await db.run(taskQuery)
  response.send('District Details Updated')
})



app.delete('/tasks/:id/', async (request, response) => {
    const {id} = request.params
  
    const deleteTaskQuery = `
      DELETE FROM tasks
      WHERE id = ${id};
    `
  
    await db.run(deleteTaskQuery)
    response.send('District Removed')
  })
  module.exports = app
