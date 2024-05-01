const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
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

initializeDBAndServer();

const authenticateToken = (request,response,next) => {
    let jwtToken;
    const authHeader = request.headers["authorization"];
    if(authHeader != undefined) {
        jwtToken = authHeader.split(" ")[1];
    }

    if(jwtToken === undefined) {
        response.status(401);
        response.send("Invalid Access token")


    }
    else {
        jwt.verify(jwtToken,ertyuioiugfdfjkiuytrd, async (error, user) => {
            if(error) {
                    response.status(401);
                    response.send("Invalid Access Token")
            } else {
                next();
                    }
                })
            }
    
}

app.post("/users/",async (request,response) => {
    const {username,password} = request.body;
    const hashedPassword = await bcrypt.hash(password,10);
    const selectUserQuery = `SELECT * FROM user WHERE username='${username}'`;
    const dbUser = await db.get(selectUserQuery);
    if(dbUser === undefined) {
        const createUserQuery = `
        INSERT INTO
            user (username,password)
        VALUES (
            '${username}',
            '${hashedPassword}'
        );

        `;
        await db.run(createUserQuery);
        response.send("USer created succeful")
    }
    else {
        response.status(400);
        response.send("User already exists");
    }
})

app.post("/login/", async (request, response) => {
    const {username,password} = request.body;
    const selectUserQuery = `SELECT * FROM user WHERE username='${username}'`;
    const dbUser = await db.get(selectUserQuery);

    if(dbUser === undefined){
        response.status(400);
        response.send("Invalid user");
    }else {
        const isPassowrdMatched = await bcrypt.compare(password,dbUser.password)
        if (isPassowrdMatched === true){
            const payload = {username:username}
            const jwtToken = jwt.sign(payload, "ertyuioiugfdfjkiuytrd")
            response.send({jwtToken});
        } else {

            response.send("Invalid Password")
        }
    } 
})

app.get('/tasks/',authenticateToken ,async (request, response) => {
             const getTaskQuery = `
            SELECT * FROM tasks;
                `

                const tasksQuery = await db.all(getTaskQuery)
                 response.send(tasksQuery)
  
})

app.get('/tasks/:taskId', authenticateToken,async (request, response) => {
  const {taskId} = request.params
  const getTaskQuery = `
    SELECT * FROM tasks
    WHERE task_id = ${taskId};
  `
  const tasksQuery = await db.get(getTaskQuery)
  response.send(tasksQuery)
})

app.get('/tasks/:taskId/eachtasks/', authenticateToken,async (request, response) => {
  const {taskId} = request.params
  const getTaskQuery = `
    SELECT * FROM eachtasks
    WHERE task_id = '${taskId}';
  `

  const tasksQuery = await db.all(getTaskQuery)
  response.send(tasksQuery)
})

app.post('/tasks/', authenticateToken,async (request, response) => {
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

app.put('/tasks/:taskId', authenticateToken,async (request, response) => {
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

app.post('/tasks/:taskId/eachtasks/', authenticateToken,async (request, response) => {
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

app.put('/tasks/:taskId/eachtasks/:id', authenticateToken,async (request, response) => {
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
