const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()
require('dotenv').config();
const Pool = require('pg').Pool
const pool = new Pool({
  user: "xpgushjfjwzypv",
  host: "ec2-79-125-30-28.eu-west-1.compute.amazonaws.com",
  database: "d9q6od77chsgde",
  password: "339d673052bc436fe62a3d2f301a66c66a7971a31b0d37967a886aef3c8d70b4",
  port: "5432",
  ssl: { rejectUnauthorized: false }
})

const getUsers = async (request, response) => {
  const getusers = await prisma.users.findMany({
  })
  getusers != null ? response.json(getusers) : response.json({
    text: 'No user found'
  })
}

const getUserById = async (request, response) => {
  const id = parseInt(request.params.id)
  const getuser = await prisma.users.findUnique({
    where: {
      id: id,
    }
  })
  getuser != null ? response.json(getuser) : response.json({
    text: 'No user found'
  })
}

const verifyToken = (req, res, next) => {
  const bearerHeader = req.headers['authorization']
  if (typeof baererHeader !== 'undefined') {
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1]
    req.token = bearerToken
    next()
  }
  else {
    res.status(403)
  }
}

const login = (request, response) => {
  const { email, password } = request.body
  pool.query('SELECT id, password FROM users WHERE email = $1', [email], (error, result) => {
    if (error) {
      console.log('ERROR :')
      console.log(error)
      response.status(400).json({ auth: false, message: "Email or password incorrect" })
    }
    else if (result.rows.length > 0) {
      console.log("RESULT :")
      console.log(result)
      userPassword = result.rows[0].password
      const validPassword = bcrypt.compareSync(password, userPassword);
      if (!validPassword) {
        console.log("INVALID PASSWORD")
        response.status(400).json({ message: 'Incorect password' })
      }
      else {
        console.log('VALID PASSWORD :')
        userId = result.rows[0].id
        jwt.sign({ user: userId }, 'secretkey', (err, token) => {
          console.log(token)
          response.status(200).json({ auth: true, token: token, userId: userId })
        })
      }
    }
    else {
      console.log('NO USER FOUND')
      response.status(404).json({ auth: false, message: "No user found" })
    }
  })
}

const createUser = async (request, response) => {
  const { lastname, firstname, email, password, phone } = request.body
  let hash = bcrypt.hashSync(password, 10, (err, hash) => {
    if (err) {
      response.status(400).send(`Can't hash password, retry`)
    }
  });
  const insertuser = await prisma.users.create({
    data: {
      lastname: lastname,
      firstname: firstname,
      email: email,
      password: hash,
      phone: phone,
    }
  }).then((res) => {
    if (res != null) {
      response.json({
        text: `User added with id : ${res.id}`
      })
    }
  }).catch((e) => {
    response.json({
      text: `User can't be added`
    })
  })
}

const updateUser = (request, response) => {
  const id = parseInt(request.params.id)
  const { firstname, email } = request.body

  pool.query(
    'UPDATE users SET Firstname = $1, Email = $2 WHERE id = $3',
    [firstname, email, id],
    (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).send(`User modified with ID: ${id}`)
    }
  )
}

const deleteUser = (request, response) => {
  const id = parseInt(request.params.id)

  pool.query('DELETE FROM users WHERE id = $1', [id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).send(`User deleted with ID: ${id}`)
  })
}

const createJob = async (request, response) => {
  const { Name, Description, Categories, Date, Remuneration, State, Long, Lat, Tasker, Jobber } = request.body
  const insertjob = await prisma.jobs.create({
    data: {
      Name: Name,
      Description: Description,
      Categories: Categories,
      Date: Date,
      Remuneration: Remuneration,
      State: State,
      Long: Long,
      Lat: Lat,
      Tasker: Tasker,
      Jobber: Jobber
    }
  }).then((res) => {
    if (res != null) {
      response.json({
        text: `Job added with id : ${res.id}`
      })
    }
  }).catch((e) => {
    response.json({
      text: `Job can't be added`
    })
  })
}

const updateJob = async (request, response) => {
  const id = parseInt(request.params.id)
  const { Name, Description, Categories, Date, Remuneration, State, Long, Lat, Tasker, Jobber } = request.body

  const updatejob = await prisma.jobs.update({
    where: { id: id },
    data: {
      Name: Name != null ? Name : undefined,
      Description: Description != null ? Description : undefined,
      Categories: Categories != null ? Categories : undefined,
      Date: Date != null ? Date : undefined,
      Remuneration: Remuneration != null ? Remuneration : undefined,
      State: State != null ? Name : undefined,
      Long: Long != null ? Long : undefined,
      Lat: Lat != null ? Lat : undefined,
      Tasker: Tasker != null ? Tasker : undefined,
      Jobber: Jobber != null ? Jobber : undefined,
    },
  }).then((res) => {
    console.log(res)
    if (res != null) {
      response.json({
        text: `Job updated with id : ${res.id}`
      })
    }
  }).catch((e) => {
    console.log(e)
    response.json({
      text: `Job can't be updated`
    })
  })
}

const deleteJob = async (request, response) => {
  const id = parseInt(request.params.id)
  const deletejob = await prisma.jobs.delete({
    where: { id: id },
  }).then((res) => {
    if (res != null) {
      response.json({
        text: `Job deleted with id : ${res.id}`
      })
    }
  }).catch((e) => {
    response.json({
      text: `Job can't be deleted`
    })
  })
}

const getJobs = (request, response) => {
  jwt.verify(request.token, 'secretkey', async (err, authData) => {
    if (err) {
      console.log(err)
      console.log("ERROR GETTING JOBS")
      console.log(request.token)
      response.status(403).send(err)
    }
    else {
      // try {
      //   const jobs = await prisma.jobs.findMany({})
      //   jobs != null ? response.json(jobs) : response.json({
      //     message: 'No user found',
      //     authData
      //   })
      // }
      // catch (err) {
      //   response.status(406).send(err)
      // }
      pool.query('SELECT * FROM jobs', (error, results) => {
        if (error) {
          res.status(403).send(error)
            throw error;
        }
        res.status(200).json(results.rows);
    });
    }
  })
}

const getJob = async (request, response) => {
  const id = parseInt(request.params.id)
  const getjob = await prisma.jobs.findUnique({
    where: {
      id: id,
    }
  })
  getjob != null ? response.json(getjob) : response.json({
    text: 'No user found'
  })
}

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  login,
  createJob,
  updateJob,
  deleteJob,
  getJob,
  getJobs
}