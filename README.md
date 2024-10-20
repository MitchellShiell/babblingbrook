# Running Ollama



Pull the ollama image
```
docker pull ollama/ollama
```

Run Ollama Container

```
docker run -d --gpus=all -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama
```

Pull desired Model:

```
docker exec -it ollama ollama pull neural-chat
```

# Data

Need to create a self signed cert:

`openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes`

to run

`npx ts-node --esm src/authFlow.ts`