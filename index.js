const express = require("express");
const app = express();
const PORT = process.env.PORT || 4001;
const amqp = require("amqplib");

var channel, connection;

app.use(express.json());

async function connectQueue() {
    try {
        connection = await amqp.connect("amqp://localhost:5672");
        channel = await connection.createChannel(); //connection üzerinden bir tane channel oluşturuyoruz.

        await channel.assertQueue("test-queue");//test-queue adında queue kontrol ediliyor. eğer yoksa test-queue adında bir queue oluşturuluyor.
    } catch (error) {
        console.log(error);
    }
}

async function sendData(data) {
    /// sendToQueue queue ismi ve gönderilecek datayı parametre olarak alıyor, ve queue'ye girilen datayı atıyor.
    await channel.sendToQueue("test-queue",Buffer.from(JSON.stringify(data)));
    await channel.close();
    await connection.close();
}

app.get("/send-msg", async (req,res) => {
    const data = {
        title   : "Six of Crows",
        author  : "Leigh Burdugo"
    }
    await connectQueue();
    sendData(data);
    console.log("A message is sent to queue");
    res.send("Message sent")
});

app.listen(PORT,() => console.log("Server running at port " + PORT));