import consumer from "channels/consumer"

consumer.subscriptions.create("ActiveUsersChannel", {
  connected() {
    // Called when the subscription is ready for use on the server
  },

  disconnected() {
    // Called when the subscription has been terminated by the server
  },

  received(data) {
    // Called when there's incoming data on the websocket for this channel
    const event = new CustomEvent('user-update', { detail: data });
    setTimeout(() => document.dispatchEvent(event), 200); // Ensures the Stimulus controller is ready
  }
});
