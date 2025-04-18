(function($) {
    "use strict"; // Start of use strict
    window.requestFolderSelection = () => {
        let i = Math.floor(Math.random() * 9999) + 1
        window.requestFolderSelectionSuccess('/storage/path-to-folder-' + i + '/Folder ' + i)
    }

    window.requestFolderSelectionSuccess = (path) => {
        const pathsJson = window.readPreferences('paths')
        if (pathsJson === '') {
            pathsJson = '[]';
        }
        let paths = JSON.parse(pathsJson);
        paths.push(path)
        window.writePreferences('paths', JSON.stringify(paths))
        window.uiUpdateFolders(paths)
    }

    window.deleteFolder = (path) => {
        const pathsJson = window.readPreferences('paths')
        let paths = JSON.parse(pathsJson);
        paths.splice(
            $.inArray(path, paths),
            1
        )

        window.writePreferences('paths', JSON.stringify(paths))
        window.uiUpdateFolders(paths)
    }

    window.deleteFile = (path) => {
        //Nothing needed at this point
    }

    let settings = {}
    window.readPreferences = (key) => {
        if (key === 'paths' && settings['paths'] === undefined) {
            let paths = []
            for (let i = 1; i <= 10; i++) {
                paths.push('/storage/path-to-folder-' + i + '/Folder ' + i)
            }
            settings['paths'] = JSON.stringify(paths)
        }

        return settings[key]
    }

    window.writePreferences = (key, value) => {
        settings[key] = value
    }

    window.listFiles = (path) => {
        let files = []
        for (let i = 1; i <= 10; i++) {
            const filePath = path + '/File ' + i
            const date = new Date(); // Gets the current date and time
            date.setDate(date.getDate() - i)
            files.push({
                'path': filePath,
                'date': date.toLocaleDateString()
            })
        }

        return files
    }
    window.readFile = (path) => {
        let content = '# Sample Content\n\n *' + path + '*\n\n'
        for (let i = 1; i <= 30; i++) {
            content = content + '- Line ' + i + '\n'
        }

        return content
    }
})(jQuery); // End of use strict
