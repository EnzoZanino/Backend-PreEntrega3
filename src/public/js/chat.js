const chatSocket = io();
const message = document.querySelector("#message");
const sendButton = document.querySelector("#send-button");
const chatContainer = document.getElementById("chat-container");

let currentUserEmail;

async function updateUserEmailContainer() {
    try {
        const response = await fetch('/getUserEmail');
        const data = await response.json();

        currentUserEmail = data.email;

        // Emitir el evento después de obtener el correo electrónico
        chatSocket.emit('userConnected', currentUserEmail);
		// Coloca el código aquí para asegurarte de que currentUserEmail esté disponible
        // console.log("holaaa " + currentUserEmail);
    } catch (error) {
        console.error('Error al obtener el correo electrónico del usuario:', error);
    }
}
// Llamar a la función asíncrona
updateUserEmailContainer();

let chatHistory
chatSocket.on("chatHistory", (history) => {
	chatHistory = history
	renderChatHistory();
});

chatSocket.on("newChatMessage", (newMessage) => {
	console.log(newMessage)
	chatHistory.push(newMessage);
	renderChatHistory();
});

sendButton.addEventListener("click", (e) => {
	e.preventDefault();
	let newMessage = {
		user: currentUserEmail,
		message: message.value,
	};
	// if (user == "") return alert("User email required");
	if (message.value.trim() == "")
		return alert("Message empty, please introduce content");
    chatSocket.emit("message", newMessage);

	message.value = "";
});

function renderChatHistory() {
	if (!chatHistory) {
		chatHistory = []
	}
	chatContainer.innerHTML = "";
	chatHistory.forEach((message) => {
		displayMessage(message);
	});
}

const MessageEnd = "background-color: #e4ded3; padding: 5px 10px 1px 10px; margin-bottom: 5px; border-radius: 10px; text-align: right;"
const MessageStart = "background-color: #a7a298; padding: 5px 10px 1px 10px; margin-bottom: 5px; border-radius: 10px; text-align: left;"
const date = "color: #3b3a3a; font-size: 0.9rem; margin-bottom: 3px;"
const messageS = "font-size: 1.1rem; margin-bottom: 3px;"

function displayMessage(message) {
	const isCurrentUser = message.user === currentUserEmail;
	const alignmentClass = isCurrentUser ? MessageEnd : MessageStart;
	const pForMe = `<div style="${alignmentClass}">
						<p style="color: #3b3a3a; font-size: 0.9rem; margin-bottom: 3px;">
							<strong> ${message.user}</strong>
						</p>
						<p style="font-size: 1.1rem; margin-bottom: 3px;">
							${message.message}
						</p>
					</div>`;
	const pForOther = `<div style="${alignmentClass}">
							<p style="color: #3b3a3a; font-size: 0.9rem; margin-bottom: 3px;">
								<strong>${message.user}</strong>
							</p>
							<p style="font-size: 1.1rem; margin-bottom: 3px;">
								${message.message}
							</p>
						</div>`;
	const pToUse = isCurrentUser ? pForMe : pForOther;
	chatContainer.innerHTML += pToUse;
}
