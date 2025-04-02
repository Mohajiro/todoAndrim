// src/models/Task.js

export default class Task {
    constructor({ _id = null, title = '', completed = false }) {
      this._id = _id;
      this.title = title;
      this.completed = completed;
    }
  
    toggle() {
      this.completed = !this.completed;
    }
  
    static fromJSON(json) {
      return new Task({
        _id: json._id,
        title: json.title,
        completed: json.completed,
      });
    }
  
    toJSON() {
      return {
        _id: this._id,
        title: this.title,
        completed: this.completed,
      };
    }
  }