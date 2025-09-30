class Note {
    constructor(title = '', content = '', tags = [], author = '', date = new Date(), colour = '#ffffff') {
        this.id = crypto.randomUUID();
        this._title = title;
        this._content = content;
        this.author = author;
        this.date = date;
        this.tags = tags;
        this.colour = colour;
    }

    get title() {
        return this._title;
    }

    set title(newTitle) {
        this._title = newTitle;
    }

    get content() {
        return this._content;
    }

    set content(newContent) {
        this._content = newContent;
    }

    toJSON() {
        return {
            id: this.id,
            title: this.title,
            author: this.author,
            content: this.content,
            date: this.date,
            tags: this.tags,
            colour: this.colour,
        }
    }

    static fromJSON(obj) {
        const n = new Note(obj.title, obj.content, obj.tags, obj.author, obj.date, obj.colour);
        n.id = obj.id;
        return n;
    }
}

class NotesList {
    constructor(tagList) {
        this.storageKey = 'myNotes';
        this.notes = [];
        this.tagList = tagList;
        this.loadNotes();
    }

    addNote() {
        const newNote = new Note();
        this.notes.unshift(newNote);
        this.saveNotes();
        return newNote;
    }

    deleteNote(note) {
        const index = this.notes.findIndex(n => n.id === note)
        if (index >= 0) {
            this.notes.splice(index, 1);
            this.saveNotes();
        }
    }

    updateNote(note) {
        const noteObj = this.notes.find(n => n.id === note);
        if (!noteObj) return;

        const titleVal = document.querySelector(`.note-title[data-id="${note}"]`);
        const contentVal = document.querySelector(`.note-content[data-id="${note}"]`);
        const tagsVal = document.querySelector(`.note-tag-list[data-id="${note}"]`);
        const colourVal = document.querySelector(`.note-colour[data-id="${note}"]`);

        noteObj.title = titleVal.value;
        noteObj.content = contentVal.value;
        noteObj.colour = colourVal.value;
        noteObj.tags = tagsVal.value.split(", ");

        this.saveNotes();
    }

    focusNote(noteId, targetClass) {
        const noteObj = this.notes.find(n => n.id === noteId);
        if (!noteObj) return;

        const noteDiv = document.querySelector(`.note-card[data-id="${noteId}"]`);
        if (!noteDiv) return;

        const oldTagEl = noteDiv.querySelector(`.note-tag-list[data-id="${noteId}"]`);
        if (!oldTagEl) return;

        if (oldTagEl.tagName === 'INPUT' || oldTagEl.tagName === 'TEXTAREA') {
            return;
        }

        const newTagEl = document.createElement('input');
        newTagEl.type = 'text';
        newTagEl.classList.add('note-tag-list');
        // newTagEl.classList.add('input-border');
        newTagEl.setAttribute('placeholder', 'Tags...');
        newTagEl.setAttribute('data-id', noteId);
        newTagEl.value = oldTagEl.textContent || noteObj.tags.join(', ');
        oldTagEl.replaceWith(newTagEl);

        const noteTitle = document.querySelector(`.note-title[data-id="${noteId}"]`);
        const noteContent = document.querySelector(`.note-content[data-id="${noteId}"]`);

        // noteTitle.classList.add('input-border');
        // noteContent.classList.add('input-border');

        if (targetClass.classList.contains('note-card') || (targetClass.classList.contains('add-note-button') || targetClass.classList.contains('add-note-icon') || targetClass.classList.contains('add-note-link'))) {
            noteTitle.focus();
        }
        if (targetClass.classList.contains('note-tag-list')) {
            newTagEl.focus();
        }
    }

    saveNotes() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.notes));
    }

    loadNotes() {
        const data = JSON.parse(localStorage.getItem(this.storageKey)) || [];
        this.notes = data.map(Note.fromJSON);
        if (this.notes.length === 0) this.seedNotes();
    }

    seedNotes() {
        this.notes = [
            new Note('Test note 1', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.', ['tag 1', 'tag 2'], 'Alex Moreton'),
            new Note('Shopping list', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.', ['tag 1', 'tag 2'], 'Rachel'),
            new Note('Job interview', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ', ['tag 1', 'tag 2'], 'Al'),
        ];
        this.saveNotes();
    }
}

class NotesUI {
    constructor(notesList, tagsList) {
        this.notesList = notesList;
        this.tagsList = tagsList;
        this.notesDiv = document.querySelector('.notes-list');
    }

    tagListMethod() {
        console.log(this.tagsList);
    }

    filterNotes(str) {
        const filteredView = this.notesList.notes.filter(n =>
            n.title.toLowerCase().includes(str.toLowerCase()) 
            || n.content.toLowerCase().includes(str.toLowerCase()) 
            || n.tags.some(tag => tag.toLowerCase().includes(str.toLowerCase()))
        );
        return filteredView;
    }

    refreshNotes(filteredArray = this.notesList.notes) {
        this.notesDiv.innerHTML = '';

        if (filteredArray.length === 0) {
            this.notesDiv.innerHTML = 'No notes found!'
        }

        filteredArray.forEach(note => this.renderNote(note));
    }

    renderNote(note) {
        const div = document.createElement('div');
        div.classList.add('note-card');
        div.style.backgroundColor = `${note.colour}a6`;
        div.dataset.id = note.id;
        div.innerHTML = `
            <input type="text" class="note-title" data-id="${note.id}" value="${note.title}" placeholder="Title...">
            <br>
            <textarea class="note-content" rows="5" data-id="${note.id}" placeholder="Content...">${note.content}</textarea>
            <br>
            <span class="note-tag-list" data-id="${note.id}"></span>
            <br>
            <button type="button" class="delete-note" data-id="${note.id}"></button>
            <input type="color" class="note-colour" name="note-colour" data-id="${note.id}" value="${note.colour}">
        `;
        this.notesDiv.appendChild(div);
        this.renderTags(note);
    }

    renderTags(note) {
        const noteDiv = document.querySelector(`.note-tag-list[data-id="${note.id}"]`);
        const tagStr = note.tags.join(', ');
        noteDiv.innerText = tagStr;
    }

    unfocusNote(noteId) {
        const noteTitle = document.querySelector(`.note-title[data-id="${noteId}"]`);
        const noteContent = document.querySelector(`.note-content[data-id="${noteId}"]`);

        noteTitle.classList.remove('input-border');
        noteContent.classList.remove('input-border');

        const oldTagEl = document.querySelector(`.note-tag-list[data-id="${noteId}"]`);
        const newTagEl = document.createElement('span');
        newTagEl.classList.add('note-tag-list');
        newTagEl.setAttribute('placeholder', 'Tags...');
        newTagEl.setAttribute('data-id', noteId);
        newTagEl.innerText = oldTagEl.value;
        oldTagEl.replaceWith(newTagEl);
    }
}

// Current tags are not linked up to these objects, how to link them?

class Tag {
    constructor(name) {
        this.id = crypto.randomUUID();
        this.name = name;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
        }
    }

    static fromJSON(obj) {
        const n = new Tag(obj.name);
        n.id = obj.id;
        return n;
    }
}

class TagList {
    constructor() {
        this.storageKey = 'myTagList';
        this.tags = [];
        this.loadTags();
    }

    saveTags() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.tags));
    }

    loadTags() {
        const data = JSON.parse(localStorage.getItem(this.storageKey)) || [];
        this.tags = data.map(Tag.fromJSON);
        if (this.tags.length === 0) this.seedTags();
    }

    seedTags() {
        this.tags = [
            new Tag('job-hunting'),
            new Tag('books'),
        ];
        this.saveTags();
    }
}

class NotesApp {
    constructor() {
        this.tagList = new TagList();
        this.notesList = new NotesList(this.tagList);
        this.notesUI = new NotesUI(this.notesList, this.tagList);
    }

    init() {
        this.notesUI.refreshNotes();
        this.bindEvents();
        this.notesUI.tagListMethod();
    }

    bindEvents() {
        const notesList = document.querySelector('.notes-list');
        const button = document.querySelector('.add-note-button');

        document.addEventListener('input', e => {
            if (e.target.classList.contains('filter-notes')) {
                this.notesUI.refreshNotes(this.notesUI.filterNotes(e.target.value));
            }
        })

        notesList.addEventListener('click', e => {
            const noteCard = e.target.closest('.note-card');
            if (e.target.classList.contains('delete-note')) {
                this.notesList.deleteNote(e.target.dataset.id);
                this.notesUI.refreshNotes();
            }
            if (noteCard) {
                const focusedElements = document.querySelectorAll('.input-border');
                if (focusedElements.length > 0) {
                    const noteId = focusedElements[0].dataset.id;
                    this.notesUI.unfocusNote(noteId);
                }
                this.notesList.focusNote(noteCard.dataset.id, e.target);
            }
        })

        document.addEventListener('click', e => {
            const notesListArea = e.target.closest('.notes-list');
            const addButton = e.target.closest('.add-note-button');

            if (!notesListArea && !addButton) {
                const focusedElements = document.querySelectorAll('.input-border');
                if (focusedElements.length > 0) {
                    const noteId = focusedElements[0].dataset.id;
                    this.notesUI.unfocusNote(noteId);
                }
            }
        });

        notesList.addEventListener('input', e => {
            if (e.target.classList.contains('note-title')) {
                this.notesList.updateNote(e.target.dataset.id);
            }
            if (e.target.classList.contains('note-content')) {
                this.notesList.updateNote(e.target.dataset.id);
            }
            if (e.target.classList.contains('note-tag-list')) {
                this.notesList.updateNote(e.target.dataset.id);
            }
        })

        notesList.addEventListener('change', e => {
            if (e.target.classList.contains('note-colour')) {
                this.notesList.updateNote(e.target.dataset.id);
                this.notesUI.refreshNotes();
            }
        })

        button.addEventListener('click', e => {
            const newNote = this.notesList.addNote();
            this.notesUI.refreshNotes();
            this.notesList.focusNote(newNote.id, e.target);
        })
    }
}

const app = new NotesApp();
app.init();

// Add tag searching (if no tag found, a new tag can be added)