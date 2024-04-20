import { Controller } from "@hotwired/stimulus"
import Handsontable from "handsontable"
import consumer from "channels/consumer"


export default class extends Controller {
    static targets = ["list"]

    connect() {
        this.initializeEventListeners();

        this.setupHandsontable();

        this.activeUsers = {};

        this.selectedCells = [];

        this.usersSubscription = consumer.subscriptions.create("ActiveUsersChannel", {
            received: data => {
                if (data.selected_cells) {
                    this.renderSelectedCells(data);
                }
            }
        });

        this.cellsSubscription = consumer.subscriptions.create("SpreadSheetCellsChannel", {
            received: data => {
                this.updateCell(data.new_val);
            }
        });

        this.current_user = {
            id: 'unknown'
        };

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
        } else if (data.current_user) {
            this.setCurrentUser(data.current_user)
        }
    }

    newUser(user) {
        this.activeUsers[user.id] = user;
        this.numberUsers();
        this.renderActiveUsers();
        this.renderSelectedCells();
    }

    removeUser(userId) {
        delete this.activeUsers[userId];
        this.renderActiveUsers();
    }

    setCurrentUser(user) {
        this.current_user = user;
    }

    numberUsers() {
        let num = 0;
        for (let id in this.activeUsers) {
            if (id !== this.current_user.id) {
                num += 1;
                this.activeUsers[id].num = num;
            }
        }
    }

    renderActiveUsers() {
        this.listTarget.innerHTML = Object.values(this.activeUsers).map(user =>
            `<li class="user-${user.num}">${user.id}</li>`
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
            afterSelection: (r, c, r2, c2) => this.selectCells(r, c, r2, c2),
            afterDeselect: () => this.deselectCells(),
            afterChange: (changes, source) => {
                console.log('here')
                if (source !== 'remote' && changes) {
                    changes.forEach(change => {
                        this.setCellValue({ r: change[0], c: change[1] }, change[3]);
                    });
                }
            },
            licenseKey: 'non-commercial-and-evaluation',
        });
    }

    selectCells(r, c, r2, c2) {
        this.usersSubscription.perform('select_cells', { selected_cells: { r, c, r2, c2 } });
    }

    deselectCells() {
        this.usersSubscription.perform('select_cells', { selected_cells: null });
    }

    renderSelectedCells() {
        this.selectedCells.forEach(({ r, c }) => {
            const cell = this.hot.getCell(r, c);
            if (cell && cell.classList.contains("current")) {
                cell.className = "current";
            } else {
                cell.className = "";
            }
        });

        this.selectedCells = [];
        Object.entries(this.activeUsers).forEach(([id, user]) => {
            if (user.selected_cells && id !== this.currentUserId) {
                this.selectedCells.push(user.selected_cells);
                const cell = this.hot.getCell(user.selected_cells.r, user.selected_cells.c);
                cell.classList.add(`user-${user.num}`);
            }
        });
    }

    updateCell(data) {
        const { location, value } = data;
        this.hot.setDataAtCell(location.r, location.c, value, 'remote');
    }

    setCellValue(location, value) {
        this.cellsSubscription.perform('set_cell_value', { location: location, value: value });
    }
}