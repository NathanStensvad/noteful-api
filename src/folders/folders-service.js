const foldersService = {
    getAllFolders(knex) {
        return knex.select('*').from('folders')
    },
    insertFolder(knex, newFolder) {
        return knex
            .insert(newFolder)
            .into('folders')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
}

module.exports = foldersService