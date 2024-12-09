const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb+srv://<user>:<password>@cluster.akoiy.mongodb.net/?retryWrites=true&w=majority&appName=<cluster>";


const app = express()
const port = 3000
const dbName = "Usuarios"
const collect = "Users"


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
const collections = client.db(dbName).collection(collect)

// Middlewares para processar o corpo da requisição
app.use(express.json()); // Transforma qualquer JSON do body em um objeto javascript
app.use(express.urlencoded({ extended: true })); // Para dados de form-urlencoded


app.get("/books", async (req, res) => {
  try {
    await client.connect();

    let count = await collections.countDocuments()
    let search = collections.find({ livro: {$regex: /^[A-Za-z]/ }})
    let result = []

    result.unshift({ countDocuments: count })
    await search.forEach(doc => result.push(doc))
      
    return res.status(200).send(result) 
              
    } catch (error) {
        return res.status(400).send(`${error}`)
    }
    finally {
        return client.close()
    }
})

app.post("/books", async (req, res) => {
    try {
        const data = req.body
        if (JSON.stringify(data).length <= 2) {
            throw new Error("Sem conteúdo para adicionar!");
        }

        await client.connect();

        // O _id é criado automaticamente pelo Atlas
        let result = await collections.insertOne(data)
        console.log("INSERT");

        return res.status(201).send(result)

    } catch (error) {
        return res.status(400).send(`<h1>${error}<h1/>`)
    } finally {
        return client.close()
    }
})

app.get("/books/:id", async (req, res) => {
    try {
        const { id } = req.params

        await client.connect();

        let result = await collections.findOne({ _id: new ObjectId(id) })
        if (!result) {
          throw new Error("Documento não encontrado!");
        }
        console.log("GET");

        return res.status(200).json(result)

    } catch (error) {
        return res.status(error.name == "Error" ? 404 : 400).send(`<h1>${error}<h1/>`)
    } finally {
        return client.close()
    }
})

app.put("/books/:id", async  (req, res) => {
    try {
        const data = req.body
        const { id } = req.params
        const documentToUpdate = {_id: new ObjectId(id)}

        await client.connect();

        let result = await collections.updateOne(documentToUpdate, { $set: data })
        if (result.modifiedCount === 0) {
            throw new Error("Nenhum documento encontrado!");
        }
        console.log("UPDATE");

        return res.status(200).send(result)

    } catch (error) {
        return res.status(error.name == "Error" ? 404 : 400).send(`<h1>${error}<h1/>`)
    } finally {
        return client.close()
    }
})

app.delete("/books/:id", async (req, res) => {
    try {
        const { id } = req.params
        const documentToDelete = { _id: new ObjectId(id)}

        await client.connect()

        let result = await collections.deleteOne(documentToDelete)
        if (result.deletedCount === 0) {
            throw new Error("Nenhum documento encontrado!");
            
        }
        console.log("DELETE");
        
        return res.status(204).send(`<h1>${result}</h1>`)

    } catch (error) {
        return res.status(error.name == "Error" ? 404 : 400).send(`<h1>${error}</h1>`)
    }
})

app.listen(port, () => {
      console.log(`Listening on port ${port}!`);
})
