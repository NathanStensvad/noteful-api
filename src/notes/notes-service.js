const notesService = {
    getAllNotes(knex) {
        return knex.select('*').from('notes')
    },
    getById(knex, id){
        return knex.from('notes').select('*').where('id', id).first()
    },
    insertNote(knex, newFolder) {
        return knex
            .insert(newFolder)
            .into('notes')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    deleteNote(knex, id) {
        return knex('notes')
            .where({ id })
            .delete()
    }
}

module.exports = notesService