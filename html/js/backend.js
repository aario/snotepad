(function($) {
    "use strict"; // Start of use strict

    const DEFAULT_VALUES = {
        'paths': {}
    }

    const DEBUG = (new URLSearchParams(window.location.search)).get('debug') === 'true'

    setTimeout(() => {
            if (typeof AndroidInterface === 'undefined' && DEBUG === false) {
                window.showToast("Android interface not available. Probably I'm incompatible with your phone altogether :-(");
            }
        },
        1000
    )

    let callbacks = {}

    window.requestFolderSelection = () => {
        if (DEBUG) {
            let i = Math.floor(Math.random() * 9999) + 1
            window.requestFolderSelectionSuccess('/storage/path-to-folder-' + i + '/Folder ' + i)
            return
        }

        AndroidInterface.initiateFolderSelection();
    }

    window.requestFolderSelectionSuccess = (path) => {
        let paths = JSON.parse(window.readPreferences('paths'));
        if (paths === null) {
            paths = []
        }

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
        if (!DEBUG) {
            AndroidInterface.initiateRemoveFolderPermission(path);
        }

        window.writePreferences('paths', JSON.stringify(paths))
        window.uiUpdateFolders(paths)
    }

    window.deleteFile = (path) => {
        if (!DEBUG) {
            AndroidInterface.deleteFile(path);
        }
    }

    window.readPreferences = (key) => {
        result = window.localStorage.getItem(key)
        if (result === undefined) {
            result = DEFAULT_VALUES[key]
        }

        return result
    }

    window.writePreferences = (key, value) => {
        window.localStorage.setItem(key, value);
    }

    window.requestReadFolder = (path, callback) => {
        callbacks['readFolder' + path] = callback
        if (DEBUG) {
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
            window.readFolderSuccess(path, files)

            return
        }

        AndroidInterface.initiateReadFolder(path)
    }

    window.readFolderSuccess = (path, folderContent) => {
        callbacks['readFolder' + path](path, folderContent)
        delete callbacks['readFolder' + path]
    }

    window.requestReadFile = (path, callback) => {
        callbacks['readFile' + path] = callback
        if (DEBUG) {
            let content = '# Sample Content\n\n *' + path + '*\n\n'
            for (let i = 1; i <= 30; i++) {
                content = content + '- Line ' + i + '\n'
            }
            
            window.readFileSuccess(path, content)

            return
        }

        AndroidInterface.initiateReadFile(path)
    }

    window.readFileSuccess = (path, fileContent) => {
        callbacks['readFile' + path](path, fileContent)
        delete callbacks['readFile' + path]
    }

    window.requestWriteFile = (path, fileContent, callback) => {
        callbacks['writeFile' + path] = callback
        if (DEBUG) {
            window.writeFileSuccess(path)

            return
        }

        AndroidInterface.initiateWriteFile(path, fileContent)
    }

    window.writeFileSuccess = (path) => {
        callbacks['writeFile' + path](path)
        delete callbacks['writeFile' + path]
    }
})(jQuery); // End of use strict
