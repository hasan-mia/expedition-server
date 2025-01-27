const { getIO } = require("../config/socket");

const sendLiveMessage = (event, message, data) => {
    const io = getIO();
    console.log('Event: ', event, 'message: ', message);
    io.emit(event, { message, data });
};

const sendMessageToRoom = async (roomId, event, message, status) => {
    const io = getIO();
    console.log(`Socket message emit: roomId=${roomId}, event=${event}, status=${status}, message=${message}`);
    const room = roomId.toString();
    const sockets = await io.in(room).allSockets();
    console.log(`Emitting to room ${room} with ${sockets.size} clients`);
    io.to(room).emit(event, { status, message });
};

module.exports = { sendLiveMessage, sendMessageToRoom };