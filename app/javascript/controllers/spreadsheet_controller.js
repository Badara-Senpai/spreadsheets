import { Controller } from "@hotwired/stimulus"
import Handsontable from "handsontable"

export default class extends Controller {
    static targets = ["list"]

    connect() {
        this.initializeEventListeners();

        this.setupHandsontable();

        this.activeUsers = {};
    }

    disconnect() {
        document.removeEventListener('user-update', this.handleUpdate.bind(this));
    }

    initializeEventListeners() {
        document.addEventListener('user-update', this.handleUpdate.bind(this));
    }

    handleUpdate(event) {
        const { detail: data } = event;
        if (data.old_val && !data.new_val) {
            this.removeUser(data.old_val.id);
        } else if (data.new_val) {
            this.newUser(data.new_val);
        }
    }

    newUser(user) {
        console.log(user)
        this.activeUsers[user.id] = user;
        this.renderActiveUsers();
    }

    removeUser(userId) {
        delete this.activeUsers[userId];
        this.renderActiveUsers();
    }

    renderActiveUsers() {
        console.log(this.activeUsers)

        this.listTarget.innerHTML = Object.values(this.activeUsers).map(user =>
            `<li>${user.id}</li>`
        ).join("");
    }

    setupHandsontable() {
        const container = document.getElementById('spreadsheet');
        this.hot = new Handsontable(container, {
            minSpareCols: 1,
            minSpareRows: 1,
            startRows: 10,
            startCols: 10,
            rowHeaders: true,
            colHeaders: true,
            contextMenu: true,
            licenseKey: 'non-commercial-and-evaluation'
        });
    }
}