const path = require('path')
const express = require('express')
const xss = require('xss')
const NotesService = require('./notes-service')
const notesService = require('./notes-service')

const notesRouter = express.Router()
const jsonParser = express.json()

const noteGenerator = note => ({
    id: note.id,
    name: xss(note.name),
    modified: note.modified,
    folderId: note.folderid,
    content: xss(note.content)
})

notesRouter
    .route('/notes')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        NotesService.getAllNotes(knexInstance)
            .then(note => {
                res.json(note.map(noteGenerator))
            })
            .catch(next)
    })
    .post(jsonParser, (req, res) => {
        const { name, modified, folderId, content } = req.body;
        const newNote = { name, modified, folderid: folderId, content }

        for (const [key, value] of Object.entries(newNote)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                })
            }
        }

        NotesService.insertNote(
            req.app.get('db'),
            newNote
        )
            .then(note => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${note.id}`))
                    .json(noteGenerator(note))
            })
    })

notesRouter
    .route('/notes/:id')
    .all((req, res, next) => {
        notesService.getById(
            req.app.get('db'),
            req.params.id
        )
            .then(note => {
                if (!note) {
                    return res.status(404).json({
                        error: { message: `Note doesn't exist` }
                    })

                }
                res.note = note
                next()
            })
            .catch(next)
    })
    .get((req, res) => {
        res.json(noteGenerator(res.note))
    })
    .delete((req, res, next) => {
        notesService.deleteNote(
            req.app.get('db'),
            req.params.id
        )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = notesRouter