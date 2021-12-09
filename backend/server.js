const express = require('express')
const cors=require('cors')
const PORT = 8000;
const app = express()
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors())

const postRoutes=require('./routes/postRoutes')
app.use('/api/',postRoutes)

app.listen(PORT, (err) => {
    if (err) throw err;
    else {
        console.log("Server runs on " + PORT)
    }
})
